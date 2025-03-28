const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
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

// Connexion avec email + mot de passe
router.post("/login", [
    body("email").isEmail(),
    body("password").isLength({ min: 1 })
], async (req, res) => {

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Mot de passe incorrect" });

        if (!user.isVerified) return res.status(403).json({ message: "Veuillez vérifier votre e-mail." });

        // Générer un token JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        // Stocker le token en HttpOnly cookie
        res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });

        // Envoyer toutes les données de l'utilisateur
        res.json({
            message: "Connexion réussie",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                address: user.address,
                subscriptionDate: user.subscriptionDate,
                subscriptionEndDate: user.subscriptionEndDate,
                stripeCustomerId: user.stripeCustomerId,
                siteId: user.siteId,
                isVerified: user.isVerified,
                role: user.role,
                isActive: user.isActive,
                profilePicture: user.profilePicture,
                phoneNumber: user.phoneNumber
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur" });
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
