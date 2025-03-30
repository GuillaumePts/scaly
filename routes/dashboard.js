const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const path = require('path');

const router = express.Router();

const authenticateUser = (req, res, next) => {
    try {
        // Vérifie si le token est présent dans les cookies
        const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Accès non autorisé. Aucun token trouvé." });
        }

        // Vérifie le JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Stocke les infos de l'utilisateur dans req.user
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token invalide ou expiré." });
    }
};

router.get("/dashboard", authenticateUser , async (req, res) => {
    try {
        
        res.sendFile(path.join(__dirname, '../views/client.html'));
        
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: "Une erreur est survenu" });
    }
});

// Exemple de route de déconnexion
router.get("/logout", (req, res) => {
    // Supprimer le cookie du token
    res.clearCookie("token");

    // Renvoie une réponse de succès
    res.json({ message: "Déconnexion réussie" });
});


module.exports = router;