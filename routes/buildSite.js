const express = require("express");
const router = express.Router();
const simpleGit = require("simple-git");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
require("dotenv").config();

function generateSecretKey(length = 64) {
  return crypto.randomBytes(length).toString("hex");
}

function getLimitFromPack(pack) {
  const limits = {
    starter: 1073741824,
    pro: 5368709120,
    unlimited: 107374182400,
  };
  return limits[pack] || limits["starter"];
}

function generateConfigFile({ prenom, nom, email, siteId, pack }, targetDir) {
  const config = {
    JWT_SECRET: generateSecretKey(32),
    JWT_SECRET_CLIENT: generateSecretKey(24),
    MAIL: email,
    GMAIL_USER: "scaly.bot.contact@gmail.com",
    GMAIL_PASS: "dhdj nbts lyjz ycus",
    PRENOM_PRO: prenom,
    NOM_PRO: nom,
    ID_PICS: siteId,
    LIMIT_STARTER: getLimitFromPack(pack)
  };

  fs.writeFileSync(
    path.join(targetDir, "config.json"),
    JSON.stringify(config, null, 2),
    "utf8"
  );
  console.log(`✅ config.json généré pour ${prenom} ${nom}`);
}


const User = require("../models/Users"); // adapte le chemin si besoin

router.post("/build-site", async (req, res) => {
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
    const repoName = `${pack}-pics-${cleanedColor}`;
    const targetDir = path.join(__dirname, "..", "clients", siteId);
    const repoUrl = `https://${process.env.GITHUB_TOKEN}@github.com/${process.env.GITHUB_USERNAME}/${repoName}.git`;

    const git = simpleGit();

    console.log(`📥 Clonage du dépôt ${repoName} dans ${targetDir}...`);
    await git.clone(repoUrl, targetDir);
    console.log("✅ Clonage terminé.");

    // Suppression du dossier .git
    const gitDir = path.join(targetDir, ".git");
    if (fs.existsSync(gitDir)) {
      fs.rmSync(gitDir, { recursive: true, force: true });
      console.log("🗑️ Dossier .git supprimé.");
    }

    // Suppression de server.js
    const serverFile = path.join(targetDir, "server.js");
    if (fs.existsSync(serverFile)) {
      fs.unlinkSync(serverFile);
      console.log("🗑️ Fichier server.js supprimé.");
    }

    // Suppression du dossier models
    const modelsDir = path.join(targetDir, "models");
    if (fs.existsSync(modelsDir)) {
      fs.rmSync(modelsDir, { recursive: true, force: true });
      console.log("🗑️ Dossier models supprimé.");
    }

    // Suppression des fichiers package.json, package-lock.json, .gitignore
    const filesToRemove = ["package.json", "package-lock.json", ".gitignore"];
    for (const file of filesToRemove) {
      const filePath = path.join(targetDir, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Fichier ${file} supprimé.`);
      }
    }

    // Génération du config.json
    generateConfigFile({ prenom, nom, email, siteId, pack }, targetDir);

    res.json({ success: true, message: "Votre produit est prêt ! 🚀" });

  } catch (err) {
    console.error("❌ Erreur :", err.message);
    res.status(500).json({ success: false, message: "Erreur lors de la création du site." });
  }
});


module.exports = router;
