// routes/account.js (ou ton fichier de routes utilisateur)
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/Users');

// Middleware pour vérifier le token
function verifyToken(req, res, next) {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ success: false, message: "Token manquant." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Token invalide." });
  }
}

router.post('/verify-password', verifyToken, async (req, res) => {
  const { currentPassword } = req.body;
  if (!currentPassword) {
    return res.status(400).json({ success: false, message: "Mot de passe requis." });
  }

  try {
    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Mot de passe incorrect." });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Erreur vérification mot de passe :", err);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});


module.exports = router;