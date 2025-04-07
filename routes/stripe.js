const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Ton modèle mongoose
const jwt = require("jsonwebtoken");
const path = require('path');

// Middleware simple pour authentifier via cookie JWT
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ success: false, message: "Non authentifié." });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Token invalide." });
    }
};

router.get("/success", (req, res) => {
    
    res.sendFile(path.join(__dirname, '../views', 'payment-success.html'));
});

router.get("/cancel", (req, res) => {
    
    res.sendFile(path.join(__dirname, '../views', 'payment-cancel.html'));
});

// 📩 Route à appeler depuis le front après succès Stripe
router.post("/stripe/confirmation", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "Utilisateur non trouvé." });
        }

        user.subscriptionStatus = "actif";
        await user.save();

        res.json({ success: true, message: "Abonnement activé." });
    } catch (error) {
        console.error("Erreur /stripe/confirmation :", error);
        res.status(500).json({ success: false, message: "Erreur serveur." });
        
    }
});

module.exports = router;
