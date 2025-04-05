const express = require("express");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/User"); // Ajuste le chemin si besoin

const router = express.Router();

router.post("/inscription", async (req, res) => {
    console.log("req.body :", req.body);

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
        subscriptionOption,
        subscriptionProduct
    } = req.body;

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
                country: "FR", // ou adapte si nécessaire
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
            isVerified: true, // pour l'instant pas de vérif mail
            address: `${adresse}, ${code_postal} ${ville}`,
            phoneNumber: tel,
            birthDate: new Date(date),
            subscriptionStatus: "actif",
            subscriptionProduct: "Pic's",
            subscriptionOption,
            siteId,
            stripeCustomerId: customer.id,
        });

        await newUser.save();

        // 🧠 Connexion automatique après inscription
        const jwt = require("jsonwebtoken");
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });

        res.status(201).json({ success: true, message: "Inscription réussie et utilisateur connecté.", userId: newUser._id });

    } catch (error) {
        console.error("Erreur dans /inscription :", error);
        res.status(500).json({ success: false, message: "Erreur serveur." });
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
