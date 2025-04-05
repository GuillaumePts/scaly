const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true }, // id="prenom"
    lastName: { type: String, required: true }, // id="nom"
    email: { type: String, required: true, unique: true }, // id="mail"
    isVerified: { type: Boolean, default: false }, // id="verified"
    password: { type: String, required: true }, // id="password"
    
    address: { type: String, required: true }, // id="adresse"
    phoneNumber: { type: String }, // id="tel"
    birthDate: { type: Date }, // id="age"
    
    // Informations liées à l'abonnement
    subscriptionStatus: { type: String, default: "inactif" }, // id="statut" (actif, inactif, suspendu...)
    subscriptionProduct: { type: String }, // id="produit" (ex: "Scaly Pro", "Scaly Basic")
    subscriptionOption: { type: String }, // id="option" (ex: "Mensuel", "Annuel", "Avec stockage...")
    subscriptionDate: { type: Date, default: Date.now }, // id="date"
    
    // Identifiant unique pour Scaly Pic’s
    siteId: { type: String, required: true, unique: true, minlength: 15 }, // id="idweb"

    // Informations Stripe
    stripeCustomerId: { type: String, required: true }, // Identifiant Stripe du client
    stripeSubscriptionId: { type: String }, // ID de l'abonnement Stripe
    stripePaymentMethodId: { type: String }, // ID du moyen de paiement Stripe
    
});

module.exports = mongoose.model("User", UserSchema);
