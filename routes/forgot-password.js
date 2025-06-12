const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const User = require('../models/Users');
const nodemailer = require('nodemailer'); // ou ton propre système
const path = require('path');

router.get('/reset-password', (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).send("Lien invalide ou expiré.");
  res.sendFile(path.resolve('views/reset-password.html'));
});

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email requis." });

    try {
        const user = await User.findOne({ email });

        if (!user) {
            // Réponse générique pour éviter d’indiquer si l’email existe
            return res.status(200).json({ message: "Lien envoyé si l'adresse existe." });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiry = Date.now() + 1000 * 60 * 60; // 1h

        user.resetToken = token;
        user.resetTokenExpiry = expiry;
        await user.save();

        // const resetLink = `https://scaly.com/reset-password?token=${token}`;
        const resetLink = `http://192.168.1.69:9999/api/reset-password?token=${token}`;

        // ✉️ Envoi de l’e-mail
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // ou Mailgun, SendGrid, etc.
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"Scaly Pic’s" <${process.env.GMAIL_USER}>`,
            to: user.email,
            subject: 'Réinitialisation de votre mot de passe',
            html: `
        <p>Bonjour,</p>
        <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
        <p>Cliquez ici pour le faire : <a href="${resetLink}">${resetLink}</a></p>
        <p>Ce lien est valable 1 heure.</p>
        <p>Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.</p>
      `,
        });

        return res.status(200).json({ message: "Lien envoyé si l'adresse existe." });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Erreur interne." });
    }
});


router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) return res.status(400).json({ message: "Données manquantes." });

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }, // Token encore valide
    });

    if (!user) return res.status(400).json({ message: "Lien invalide ou expiré." });

    // 💡 Tu peux ajouter une vraie logique de hash si ce n’est pas déjà géré dans un middleware
    const bcrypt = require('bcrypt');
    const hashed = await bcrypt.hash(password, 10);

    user.password = hashed;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    return res.status(200).json({ message: "Mot de passe modifié." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur." });
  }
});


module.exports = router;
