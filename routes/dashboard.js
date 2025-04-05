const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const path = require('path');

const router = express.Router();

function requireAuth(req, res, next) {
    const token = req.cookies.token; // Récupérer le token JWT depuis les cookies
    if (!token) {
        return res.status(401).json({ message: "Non autorisé : Token manquant" });
    }
    
    try {
        // Vérifier et décoder le token JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Ajouter l'utilisateur décodé dans la requête
        next(); // Passer au middleware suivant
    } catch (err) {
        return res.status(401).json({ message: "Non autorisé : Token invalide" });
    }
}

router.get("/dashboard", requireAuth , async (req, res) => {
    try {
        
        res.sendFile(path.join(__dirname, '../views/client.html'));
        
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: "Une erreur est survenu" });
    }
});

// Exemple de route de déconnexion
router.get("/logout",requireAuth, (req, res) => {
    // Supprimer le cookie du token
    res.clearCookie("token");

    // Renvoie une réponse de succès
    res.json({ message: "Déconnexion réussie" });
});


module.exports = router;