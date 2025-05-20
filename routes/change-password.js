
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/Users');
const nodemailer = require('nodemailer');

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

router.post('/change-password', verifyToken, async (req, res) => {
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Le mot de passe doit contenir au moins 8 caractères."
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await User.findByIdAndUpdate(req.user.id, {
      password: hashedPassword
    });

    // Envoi d'un mail de notification (exemple simple)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, 
        pass: process.env.GMAIL_PASS  
      }
    });

    const mailOptions = {
      from: `"Scaly Pic's" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Votre mot de passe a été modifié",
      html: `
        <p>Bonjour ${user.firstName || ''},</p>
        <p>Votre mot de passe a bien été modifié.</p>
        <p>Si vous n'êtes pas à l'origine de cette modification, veuillez immédiatement contacter notre support.</p>
        <p>guillaume.pitois@proton.me</p>
        <p>Merci,<br>L’équipe Scaly</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Mot de passe modifié avec succès." });
  } catch (err) {
    console.error("Erreur changement mot de passe :", err);
    res.status(500).json({ success: false, message: "Erreur serveur lors du changement." });
  }
});

module.exports = router;
