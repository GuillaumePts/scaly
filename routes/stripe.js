const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Ton modèle mongoose
const jwt = require("jsonwebtoken");
const path = require('path');
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Middleware simple pour authentifier via cookie JWT
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ success: false, message: "Non authentifié." });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Token invalide." });
    }
};

router.get("/success", (req, res) => {
    
    res.sendFile(path.join(__dirname, '../views', 'payment-success.html'));
});

router.get("/cancel", (req, res) => {
    
    res.sendFile(path.join(__dirname, '../views', 'payment-cancel.html'));
});

router.post("/stripe/start-checkout", authMiddleware, async (req, res) => {
    const userId = req.userId;

  try {
      const user = await User.findById(userId);
      if (!user) {
            console.log('pas user trouvé');
          return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
      }

      // Création de la session Stripe
      const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
              {
                  price_data: {
                      currency: "eur",
                      product_data: {
                          name: 'Pics',
                      },
                      unit_amount: 500, // Exemple 50€
                  },
                  quantity: 1,
              },
          ],
          mode: "payment",
          success_url: `https://7d21-37-65-30-41.ngrok-free.app/api/success`,
          cancel_url: `https://7d21-37-65-30-41.ngrok-free.app/api/cancel`,
          client_reference_id: user._id.toString(),
      });

      res.status(200).json({ success: true, url: session.url });
  } catch (err) {
      console.error("Erreur lors de la création de la session Stripe :", err);
      res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});


// 📩 Route à appeler depuis le front après succès Stripe
router.post("/stripe/confirmation", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "Utilisateur non trouvé." });
        }

        user.subscriptionStatus = "actif";
        await user.save();

        res.json({ success: true, message: "Abonnement activé." });
    } catch (error) {
        console.error("Erreur /stripe/confirmation :", error);
        res.status(500).json({ success: false, message: "Erreur serveur." });
        
    }
});

module.exports = router;
