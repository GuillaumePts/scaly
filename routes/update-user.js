const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const jwt = require("jsonwebtoken");

// Middleware de vérification du token
function verifyToken(req, res, next) {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ success: false, message: "Accès refusé. Aucun token fourni." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Token invalide ou expiré." });
  }
}

const allowedFields = ['firstName', 'lastName', 'birthDate', 'address', 'phoneNumber'];

router.post('/update-user', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { field, value } = req.body;

  // Vérification de la validité du champ
  if (!field || typeof field !== 'string' || typeof value === 'undefined') {
    return res.status(400).json({ success: false, message: 'Requête invalide. Veuillez spécifier un champ et une valeur.' });
  }

  if (!allowedFields.includes(field)) {
    return res.status(403).json({
      success: false,
      message: `Modification du champ non autorisée.`
    });
  }

  // Validation spéciale pour le numéro de téléphone
  if (field === 'phoneNumber') {
    // On vérifie que value est une chaîne de 10 chiffres
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(value)) {
      return res.status(400).json({
        success: false,
        message: 'Le numéro de téléphone doit contenir exactement 10 chiffres.'
      });
    }
  }

  try {
    await User.findByIdAndUpdate(userId, { [field]: value });
    res.json({ success: true, message: "La modification a bien été réalisée ✅", field, value });

  } catch (err) {
    console.error("Erreur lors de la mise à jour du champ :", err);
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la mise à jour.' });
  }
});

module.exports = router;

