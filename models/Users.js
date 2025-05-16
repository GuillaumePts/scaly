const mongoose = require("mongoose");

const UsersSchema = new mongoose.Schema({
    firstName: { type: String, required: true }, // id="prenom"
    lastName: { type: String, required: true }, // id="nom"
    email: { type: String, required: true, unique: true }, // id="mail"
    isVerified: { type: Boolean, default: false }, // id="verified"
    password: { type: String, required: true }, // id="password"
    
    address: { type: String, required: true }, // id="adresse"
    phoneNumber: { type: String }, // id="tel"
    birthDate: { type: Date }, // id="age"
    
    // Informations liées à l'abonnement
    subscriptionStatus: { type: String, default: "Inactif" }, // id="statut" (actif, inactif, suspendu...)
    subscriptionProduct: { type: String, required: true}, // id="produit" (ex: "Scaly Pro", "Scaly Basic")
    subscriptionColor: { type: String, required: true },
    subscriptionStock: { type: String, required: true },// id="option" (ex: "Mensuel", "Annuel", "Avec stockage...")
    subscriptionDate: { type: Date, default: Date.now },
    http: { type: String },// id="date"
    // NEW
    paiement: { type: Boolean, default: false},
    typePaiement: { type: String, default: "Mensuel" },
    price: { type: Number, required: true},
    // Identifiant unique pour Scaly Pic’s
    siteId: { type: String, required: true, unique: true, minlength: 15 }, // id="idweb"

    // Informations Stripe
    stripeCustomerId: { type: String, required: true }, // Identifiant Stripe du client
    stripeSubscriptionId: { type: String }, // ID de l'abonnement Stripe
    stripePaymentMethodId: { type: String }, // ID du moyen de paiement Stripe
    
    
});

module.exports = mongoose.model("Users", UsersSchema);
