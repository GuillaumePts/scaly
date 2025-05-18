const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const User = require("../models/Users");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ success: false, message: "Accès refusé." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Token invalide ou expiré." });
  }
};

router.post("/delete-account", verifyToken, async (req, res) => {
  const userId = req.user.id // stocké dans le token
  const { immediate } = req.body;
    console.log(userId);

  try {
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ success: false, message: "Utilisateur introuvable." });

    if (immediate) {
      // 1. Supprimer dossier client
      const clientPath = path.join(__dirname, "..", "clients", user.siteId);
      if (fs.existsSync(clientPath)) fs.rmSync(clientPath, { recursive: true, force: true });

      // 2. Supprimer sur Stripe
      if (user.stripeCustomerId) {
        await stripe.customers.del(user.stripeCustomerId);
      }

      // 3. Supprimer en BDD
      await User.deleteOne({ _id: user._id });

      return res.json({ success: true, message: "Compte supprimé immédiatement." });
    } else {
      // Suppression différée (désactive accès immédiatement, mais attend date)
        const date = new Date(user.subscriptionDate);
        date.setMonth(date.getMonth() + 1); // suppression à la fin du mois d’abonnement initial

        user.subscriptionStatus = `Suppression prévu le ${date.toLocaleDateString("fr-FR")}`;
        user.deletionRequested = true;
        user.deletionDate = date;

        await user.save();

        return res.json({
            success: true,
            message: `Suppression planifiée. Votre compte sera supprimé le ${date.toLocaleDateString("fr-FR")}.`
        });
    }
  } catch (err) {
    console.error("❌ Erreur suppression :", err);
    res.status(500).json({ success: false, message: "Erreur lors de la suppression du compte." });
  }
});

module.exports = router;
