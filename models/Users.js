const mongoose = require("mongoose");


const UsersSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  isVerified: { type: Boolean, default: false },
  password: { type: String, required: true },

  address: { type: String, required: true },
  phoneNumber: { type: String },
  birthDate: { type: Date },

  // Abonnement
  subscriptionStatus: { type: String, default: "Inactif" }, // "actif", "annulé", "suppression demandée"
  // subscriptionStatus: { type: String, enum: ['inactive', 'active', 'canceled', 'pending_deletion'], default: 'inactive' }
  subscriptionProduct: { type: String, required: true },
  subscriptionColor: { type: String, required: true },
  subscriptionStock: { type: String, required: true },
  subscriptionDate: { type: Date, default: Date.now },
  http: { type: String },

  paiement: { type: Boolean, default: false },
  typePaiement: { type: String, default: "Mensuel" },
  price: { type: Number, required: true },

  // Produit
  siteId: { type: String, required: true, unique: true, minlength: 15 },

  // Stripe
  stripeCustomerId: { type: String, required: true },
  stripeSubscriptionId: { type: String },
  stripePaymentMethodId: { type: String },

  // changement pack
  currentPlan: { type: String, enum: ['starter', 'pro', 'unlimited'], required: true },
  pendingPlan: { type: String, enum: ['starter', 'pro', 'unlimited'], default: null },
  changeAt: { type: Date, default: null },

    // Stripe Client to client
  stripeAccountId: String,      // l'ID du compte Express Stripe
  stripeActivated: Boolean,     // true si activé
  stripeActivationDate: Date,   // (optionnel)
  stripeStatus: { type: String, enum: ["active", "inactive"], default: "inactive" },


  // 🔒 Suppression programmée
  deletionRequested: { type: Boolean, default: false }, // true = user veut supprimer son compte à la fin de la période
  deletionDate: { type: Date }, // Pour garder la trace
});


module.exports = mongoose.model("Users", UsersSchema);
