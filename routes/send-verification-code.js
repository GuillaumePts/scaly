const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

function verifyToken(req, res, next) {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, message: "Accès refusé." });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Token invalide ou expiré." });
    }
};
// Stock temporaire en mémoire : userId => { code, expiresAt }
const codes = new Map();

// Envoi du code par email
router.post("/send-verification-code", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const email = req.user.email;

        console.log(userId + ' 888888888 ' + email);

        const code = crypto.randomInt(100000, 999999).toString(); // 6 chiffres
        const expiresAt = Date.now() + 60 * 1000; // 1 minute

        codes.set(userId, { code, expiresAt });

        await sendEmail(
            email,
            `Votre code de vérification : ${code}`,
            `
    <p><strong>Votre code de vérification est : <span style="font-size: 22px;">${code}</span></strong></p>
    <hr>
    <p>Bonjour,</p>
    <p>Voici votre code de vérification à usage unique :</p>
    <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; background-color: #f7f7f7; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0;">
      ${code}
    </div>
    <p>Ce code expirera dans 1 minute.</p>
  `
        );


        res.status(200).json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur lors de l'envoi du code" });
    }
});

// Vérification du code entré
router.post("/verify-code", verifyToken, (req, res) => {
    const userId = req.user.id;
    const userCode = req.body.code;

    const stored = codes.get(userId);
    if (!stored) {
        return res.status(400).json({ error: "Aucun code trouvé." });
    }

    if (Date.now() > stored.expiresAt) {
        codes.delete(userId);
        return res.status(400).json({ error: "Code expiré." });
    }

    if (stored.code !== userCode) {
        return res.status(400).json({ error: "Code incorrect." });
    }

    codes.delete(userId); // usage unique

    res.status(200).json({ success: true });
});

module.exports = router;
