const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const fse = require("fs-extra");
const crypto = require("crypto");
require("dotenv").config();
const verifyToken = require('../utils/verifyToken')

function generateSecretKey(length = 64) {
  return crypto.randomBytes(length).toString("hex");
}

function getLimitFromPack(pack) {
  const limits = {
    starter: 3221225472,
    pro: 16106127360,
    unlimited: 53687091200,
  };
  return limits[pack] || limits["starter"];
}

function getPaymentSettings(pack) {
  switch (pack.toLowerCase()) {
    case "starter":
      return { ALLOW_PAYMENT: true, COMMISSION: 6 };
    case "pro":
      return { ALLOW_PAYMENT: true, COMMISSION: 3 };
    case "unlimited":
      return { ALLOW_PAYMENT: true, COMMISSION: 0 };
    default:
      return { ALLOW_PAYMENT: false, COMMISSION: 0 };
  }
}

function generateConfigFile({ prenom, nom, email, siteId, pack }, targetDir) {
  const { ALLOW_PAYMENT, COMMISSION } = getPaymentSettings(pack);

  const config = {
    JWT_SECRET: generateSecretKey(32),
    JWT_SECRET_CLIENT: generateSecretKey(24),
    MAIL: email,
    GMAIL_USER: "scaly.bot.contact@gmail.com",
    GMAIL_PASS: "dhdj nbts lyjz ycus",
    PRENOM_PRO: prenom,
    NOM_PRO: nom,
    ID_PICS: siteId,
    PACK: pack,
    LIMIT_STARTER: getLimitFromPack(pack),
    ALLOW_PAYMENT,
    COMMISSION,
  };

  fs.writeFileSync(
    path.join(targetDir, "config.json"),
    JSON.stringify(config, null, 2),
    "utf8"
  );
  console.log(`✅ config.json généré pour ${prenom} ${nom}`);
}

const User = require("../models/Users");

router.post("/build-site", verifyToken, async (req, res) => {
  const { nom, prenom, email, siteId, color, pack } = req.body;

  if (!nom || !prenom || !email || !siteId || !color || !pack) {
    return res.status(400).json({ success: false, message: "Champs manquants." });
  }

  try {
    // 🔒 Vérifier l'abonnement en BDD
    const user = await User.findOne({ email, siteId });
    if (!user || user.subscriptionStatus !== "actif") {
      return res.status(402).json({
        success: false,
        code: "PAYMENT_REQUIRED",
        message: "Votre produit Pic’s n’a pas pu être créé en raison d’un problème de paiement."
      });
    }

    console.log("🔧 Création du site pour :", email);

    const cleanedColor = color.toLowerCase();
    const templateName = `pics-${cleanedColor}`;
    const sourceDir = path.join(__dirname, "..", "build", templateName);
    const targetDir = path.join(__dirname, "..", "clients", siteId);

    // 💥 Vérification que le template existe
    if (!fs.existsSync(sourceDir)) {
      return res.status(404).json({
        success: false,
        message: `Le produit "${templateName}" est introuvable dans /build.`,
      });
    }

    console.log(`📁 Copie depuis le modèle ${templateName} vers ${targetDir}...`);
    await fse.copy(sourceDir, targetDir);
    console.log("✅ Copie terminée.");

    // Génération du config.json
    generateConfigFile({ prenom, nom, email, siteId, pack }, targetDir);

    const siteUrl = `http://${siteId}.localhost:9999/`;
    await User.updateOne(
      { email, siteId },
      { $set: { http: siteUrl } }
    );

    res.json({ success: true, message: "Votre produit est prêt ! 🚀", url: siteUrl });

  } catch (err) {
    console.error("❌ Erreur :", err.message);
    res.status(500).json({ success: false, message: "Erreur lors de la création du site." });
  }
});

module.exports = router;
