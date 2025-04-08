// stripe.js
const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const User = require("../models/User"); // ou le chemin vers ton UserSchema



// Body parser brut pour Stripe
router.post(
    "/webhook-stripe",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"];
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
      let event;
  
      try {
        // Vérification de la signature Stripe
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        console.log("✅ Webhook Stripe reçu et signature validée.");
      } catch (err) {
        console.error("Erreur lors de la validation de la signature du webhook :", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
  
      // Traitement des événements
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
  
        const stripeCustomerId = session.customer;
        const clientReferenceId = session.client_reference_id; // facultatif si tu le passes
        console.log(`⚡ Session complète reçue pour le client : ${stripeCustomerId}`);
  
        try {
          // Recherche du user dans la base de données
          const user = await User.findOne({ email: session.customer_email });
          if (user) {
            user.stripeCustomerId = stripeCustomerId;
            user.subscriptionStatus = "actif";
            user.subscriptionId = session.subscription;
            user.checkoutSessionId = session.id;
            await user.save();
            console.log("✅ Utilisateur mis à jour après paiement Stripe !");
          } else {
            console.warn("⚠️ Utilisateur non trouvé pour l'email :", session.customer_email);
          }
        } catch (err) {
          console.error("Erreur lors de la mise à jour de l'utilisateur :", err);
        }
      } else {
        console.warn(`⚠️ Type d'événement inconnu reçu : ${event.type}`);
      }
  
      res.json({ received: true });
    }
  );
  



module.exports = router;
