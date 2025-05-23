const fs = require("fs");
const path = require("path");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/Users");

async function checkPaymentPermission(req, res, next) {
  try {
    const host = req.headers.host;
    const siteId = host.split(".")[0];
    const configPath = path.join(__dirname, "..", "clients", siteId, "config.json");

    if (!fs.existsSync(configPath)) {
      return res.status(404).json({ success: false, message: "Fichier config introuvable." });
    }

    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

    // 1. Paiements désactivés
    if (!config.ALLOW_PAYMENT) {
      return res.status(403).json({
        success: false,
        message: "Paiements non autorisés pour ce pack.",
      });
    }

    // 2. Stripe non connecté
    if (!config.STRIPE_ACCOUNT_ID || config.STRIPE_ACCOUNT_ID.trim() === "") {
      return res.status(403).json({
        success: false,
        message: "Compte Stripe non connecté. Veuillez connecter votre compte pour recevoir des paiements.",
      });
    }

    // 3. Stripe connecté mais non activé (on vérifie via Stripe en live)
    if (config.STRIPE_STATUS !== "active") {
      try {
        const account = await stripe.accounts.retrieve(config.STRIPE_ACCOUNT_ID);
        const chargesEnabled = account.charges_enabled;

        if (chargesEnabled) {
          // ✅ Mise à jour du config.json
          config.STRIPE_STATUS = "active";
          fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

          // ✅ Mise à jour de la base MongoDB (optionnelle mais propre)
          if (req.user?.id) {
            const user = await User.findOne({ email: req.user.id });
            if (user && user.stripeAccountId === config.STRIPE_ACCOUNT_ID) {
              user.stripeStatus = "active";
              await user.save();
            }
          }

        } else {
          return res.status(403).json({
            success: false,
            message: "Compte Stripe encore inactif. Complétez l'onboarding sur Stripe.",
          });
        }
      } catch (err) {
        console.error("❌ Erreur en consultant le compte Stripe :", err.message);
        return res.status(500).json({
          success: false,
          message: "Erreur lors de la vérification du compte Stripe.",
        });
      }
    }

    // ✅ Tous les contrôles sont bons
    req.commission = config.COMMISSION;
    req.stripeAccountId = config.STRIPE_ACCOUNT_ID;
    next();

  } catch (err) {
    console.error("❌ Erreur middleware paiement :", err.message);
    res.status(500).json({ success: false, message: "Erreur serveur lors du contrôle des paiements." });
  }
}

module.exports = checkPaymentPermission;
