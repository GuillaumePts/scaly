const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/Users");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


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

router.post("/stripe-connect-onboarding", verifyToken, async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });

    // ✅ Vérifie le droit au paiement client
    const isAllowed = ["Pro", "Unlimited"].includes(user.subscriptionStock);
    if (!isAllowed) {
      return res.status(403).json({ message: "Fonctionnalité réservée aux offres Pro et Unlimited." });
    }

    let accountId = user.stripeAccountId;

    // 👤 Créer le compte Stripe s’il n’existe pas encore
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: user.email,
      });

      accountId = account.id;

      // 📝 Enregistre le compte dans MongoDB
      user.stripeAccountId = accountId;
      user.stripeActivated = true;
      user.stripeActivationDate = new Date();
      await user.save();
    }

    // 🔗 Crée le lien d’onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: "https://ton-site.com/compte", // 🔁 Où retourner si l'utilisateur clique sur "Retour"
      return_url: "https://ton-site.com/compte", // ✅ Où Stripe redirige après réussite
      type: "account_onboarding"
    });

    return res.status(200).json({ success: true, url: accountLink.url });

  } catch (err) {
    console.error("Erreur Stripe Connect onboarding :", err);
    res.status(500).json({ message: "Erreur serveur Stripe Connect." });
  }
});

module.exports = router;
