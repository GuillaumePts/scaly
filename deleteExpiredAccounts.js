const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const User = require(path.join(__dirname, "models", "Users"));
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("📦 Cron connecté à MongoDB"))
  .catch(err => console.error("❌ Connexion MongoDB échouée :", err));

async function deleteExpiredAccounts() {
  try {
    const now = new Date();
    const usersToDelete = await User.find({
      deletionRequested: true,
      deletionDate: { $lte: now }
    });

    for (const user of usersToDelete) {
        try {
            // Supprimer le dossier
            const clientPath = path.join(__dirname, "..", "clients", user.siteId);
            if (fs.existsSync(clientPath)) fs.rmSync(clientPath, { recursive: true, force: true });

            // Supprimer Stripe
            if (user.stripeCustomerId) {
            await stripe.customers.del(user.stripeCustomerId);
            }

            // Supprimer utilisateur en base
            await User.deleteOne({ _id: user._id });

            console.log(`🗑️ Utilisateur ${user.email} supprimé le ${new Date().toLocaleDateString("fr-FR")} (demande du ${new Date(user.deletionDate).toLocaleDateString("fr-FR")}).`);
        } catch (err) {
            console.error(`❌ Échec suppression utilisateur ${user.email} :`, err.message);
        }
        }

  } catch (err) {
    console.error("❌ Erreur lors de la suppression automatique :", err.message);
  }
}

// Planifier tous les jours à 3h du matin
cron.schedule("0 3 * * *", deleteExpiredAccounts);

module.exports = deleteExpiredAccounts;
