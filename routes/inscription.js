const express = require("express");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/User"); // Ajuste le chemin si besoin

const router = express.Router();

router.post("/inscription", async (req, res) => {
    const {
        nom,
        prenom,
        email,
        password,
        adresse,
        tel,
        date,
        ville,
        code_postal,
        subscriptionProduct,
        subscriptionColor,
        subscriptionStock,
    } = req.body;

    let prixxx;

    // Validation des champs
    if (!nom || !prenom || !email || !password || !adresse || !tel || !date || !ville || !code_postal) {
        return res.status(400).json({ success: false, message: "Tous les champs sont requis." });
    }

    // Vérification du format de l'email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: "L'email est invalide." });
    }

    // Validation des données d'abonnement
    if (!["Starter", "Pro", "Unlimited"].includes(subscriptionStock)) {
        return res.status(400).json({ success: false, message: "Le pack sélectionné est invalide." });
    }

    // Prix selon l'abonnement
    if (subscriptionStock === "Starter") {
        prixxx = 7.99;
    } else if (subscriptionStock === "Pro") {
        prixxx = 14.99;
    } else if (subscriptionStock === "Unlimited") {
        prixxx = 29.99;
    } else {
        prixxx = 14.99;
    }

    try {
        // 🔒 Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Cet email est déjà utilisé." });
        }

        // 🔐 Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // 🧾 Créer un client Stripe
        const customer = await stripe.customers.create({
            email,
            name: `${prenom} ${nom}`,
            phone: tel,
            address: {
                line1: adresse,
                city: ville,
                postal_code: code_postal,
                country: "FR",
            },
        });

        // 🔠 Générer un identifiant unique (siteId)
        const siteId = `scalypics_${uuidv4().replace(/-/g, "").slice(0, 15)}`;

        // 🧑‍💼 Créer l'utilisateur en base
        const newUser = new User({
            firstName: prenom,
            lastName: nom,
            email,
            password: hashedPassword,
            isVerified: true, // pour l'instant pas de vérification par mail
            address: `${adresse}, ${code_postal} ${ville}`,
            phoneNumber: tel,
            birthDate: new Date(date),
            subscriptionStatus: "inactif",
            subscriptionProduct: subscriptionProduct || "Pic's", // valeur par défaut
            subscriptionColor,
            subscriptionStock,
            subscriptionDate: Date.now(),
            siteId,
            stripeCustomerId: customer.id,
            price: prixxx,
        });

        await newUser.save();

        // 🧠 Connexion automatique après inscription
        const jwt = require("jsonwebtoken");
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });

        // ✅ Réponse sans Stripe
        res.status(201).json({
            success: true,
            message: "Votre compte a bien été créé !",
            userId: newUser._id,
        });
    } catch (error) {
        console.error("Erreur dans /inscription :", error);
        res.status(500).json({ success: false, message: "Oops, une erreur est survenue de notre côté." });
    }
});


router.post("/create-customer", async (req, res) => {
    const { email, userId } = req.body;
  
    try {
        const customer = await stripe.customers.create({ email });
        await User.updateOne({ _id: userId }, { stripeCustomerId: customer.id });
        res.json({ success: true, customerId: customer.id });
    } catch (error) {
        console.error("Erreur Stripe :", error);
        res.status(500).json({ success: false, error: error.message || "Erreur lors de la création du client Stripe." });
    }
});





module.exports = router;
