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

router.get("/user_client", async (req, res) => {
    const token = req.cookies.token; // Le token est dans le cookie

    if (!token) {
        return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    try {
        // Vérifier le token JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Trouver l'utilisateur par son ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        // Retirer le mot de passe avant de renvoyer l'utilisateur
        const { password, ...userWithoutPassword } = user.toObject();

        res.json({
            user: userWithoutPassword
        });

    } catch (err) {
        console.log(err);
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
