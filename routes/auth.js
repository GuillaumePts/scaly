const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/Users");
const nodemailer = require("nodemailer");

const router = express.Router();

// Configuration de l'envoi d'email
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});


function requireAuth(req, res, next) {
    const token = req.cookies.token; // Récupérer le token JWT depuis les cookies
    if (!token) {
        return res.status(401).json({ message: "Non autorisé : Token manquant" });
    }
    
    try {
        // Vérifier et décoder le token JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id; // Récupérer l'ID de l'utilisateur à partir du token

        // Récupérer l'utilisateur complet depuis la base de données
        User.findById(userId).then(user => {
            if (!user) {
                return res.status(404).json({ message: "Utilisateur introuvable" });
            }

            req.user = user; // Ajouter l'utilisateur complet dans la requête
            next(); // Passer au middleware suivant
        }).catch(err => {
            console.log(err);
            return res.status(500).json({ message: "Erreur serveur" });
        });

    } catch (err) {
        return res.status(401).json({ message: "Non autorisé : Token invalide" });
    }
}




router.post("/login", [
    body("email").isEmail(),
    body("password").isLength({ min: 1 })
], async (req, res) => {

    const { email, password } = req.body;  
    
    try {
        // Ne pas exclure le mot de passe ici, sinon impossible de le comparer
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

        // Vérification du mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Mot de passe incorrect" });

        if (!user.isVerified) return res.status(403).json({ message: "Veuillez vérifier votre e-mail." });

        // Générer un token JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        // Stocker le token en HttpOnly cookie
        res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });

        // Convertir l'utilisateur en objet et supprimer le mot de passe

        res.json({
            message: "Connexion réussie",
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
    
});

router.get("/user_client",requireAuth, async (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        const userObj = user.toObject();

        // Champs à ne pas renvoyer côté client
        const champsAExclure = [
            "password",
            "stripeSubscriptionId",
            "stripeCustomerId",
            "resetPasswordToken",
            "resetPasswordExpires",
            "roles", // si tu as des rôles admin, etc.
        ];

        champsAExclure.forEach(champ => delete userObj[champ]);

        res.json({ user: userObj });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});


// Exemple avec Express
router.post("/create-portal-session", requireAuth, async (req, res) => {
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


    // Récupérer l'utilisateur depuis le middleware (req.user est défini dans requireAuth)
    const user = req.user;
    console.log("Utilisateur trouvé :", user);
    if (!user.stripeCustomerId) {
        console.log("Erreur : ID Stripe manquant pour cet utilisateur.");
        return res.status(401).json({ error: "Stripe ID manquant." });
    }

    // Vérifier si l'utilisateur a un customerId Stripe
    if (!user || !user.stripeCustomerId) {
        return res.status(401).json({ error: "Utilisateur non authentifié ou Stripe ID manquant." });
    }

    try {
        // Créer une session Stripe pour le portail de gestion de l'abonnement
        const session = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: "http://192.168.1.69:9999/" // URL de redirection après la gestion du paiement
        });

        // Renvoi de l'URL pour accéder au portail
        res.json({ url: session.url });
    } catch (error) {
        console.error("Erreur portail Stripe :", error);
        res.status(500).json({ error: "Impossible de créer une session de gestion." });
    }
});

// Envoi d'un e-mail de vérification
router.post("/send-verification", async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        const url = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Vérification de votre email",
            html: `<p>Cliquez sur le lien suivant pour vérifier votre compte : <a href="${url}">Vérifier mon compte</a></p>`,
        });

        res.json({ message: "E-mail de vérification envoyé." });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur" });
        console.log(err);
    }
});

// Vérification de l'e-mail
router.get("/verify-email", async (req, res) => {
    try {
        const { token } = req.query;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        await User.findByIdAndUpdate(decoded.id, { isVerified: true });

        res.json({ message: "Email vérifié avec succès !" });
    } catch (err) {
        res.status(400).json({ message: "Lien invalide ou expiré" });
    }
});

module.exports = router;
