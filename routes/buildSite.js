const express = require("express");
const router = express.Router();
const simpleGit = require("simple-git");
const path = require("path");
require("dotenv").config();

router.post("/build-site", async (req, res) => {
  const { nom, prenom, email, siteId, color, pack } = req.body;

  if (!nom || !prenom || !email || !siteId || !color || !pack) {
    return res.status(400).json({ success: false, message: "Champs manquants." });
  }

  try {
    console.log("🔧 Création du site pour :", email);

    // Convertir color en minuscule pour garantir une uniformité
    const cleanedColor = color.toLowerCase();

    const repoName = `${pack}-pics-${cleanedColor}`; // Exemple : "starter-pics-noir"
    const targetDir = path.join(__dirname, "..", "clients", siteId); // Dossier = siteId

    const repoUrl = `https://${process.env.GITHUB_TOKEN}@github.com/${process.env.GITHUB_USERNAME}/${repoName}.git`;

    const git = simpleGit();

    console.log(`📥 Clonage du dépôt ${repoName} dans ${targetDir}...`);
    await git.clone(repoUrl, targetDir);
    console.log("✅ Clonage terminé.");

    res.json({ success: true, message: "Clonage effectué dans le dossier du client." });
  } catch (err) {
    console.error("❌ Erreur clone dépôt :", err.message);
    res.status(500).json({ success: false, message: "Erreur lors du clonage du dépôt." });
  }
});

module.exports = router;
