const express = require("express");
const router = express.Router();
const simpleGit = require("simple-git");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
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

function generateEnvFile({ prenom, nom, email, siteId, pack }, targetDir) {
  const JWT_SECRET = generateSecretKey(32);
  const JWT_SECRET_CLIENT = generateSecretKey(24);
  const LIMIT_STARTER = getLimitFromPack(pack);

  const envContent = `
JWT_SECRET=${JWT_SECRET}
JWT_SECRET_CLIENT=${JWT_SECRET_CLIENT}
MAIL=${email}
GMAIL_USER=scaly.bot.contact@gmail.com
GMAIL_PASS=dhdj nbts lyjz ycus
PRENOM_PRO=${prenom}
NOM_PRO=${nom}
ID_PICS=${siteId}
LIMIT_STARTER=${LIMIT_STARTER}
`.trim();

  fs.writeFileSync(path.join(targetDir, ".env"), envContent);
  console.log(`✅ .env généré pour ${prenom} ${nom}`);
}

router.post("/build-site", async (req, res) => {
  const { nom, prenom, email, siteId, color, pack } = req.body;

  if (!nom || !prenom || !email || !siteId || !color || !pack) {
    return res.status(400).json({ success: false, message: "Champs manquants." });
  }

  try {
    console.log("🔧 Création du site pour :", email);

    const cleanedColor = color.toLowerCase();
    const repoName = `${pack}-pics-${cleanedColor}`;
    const targetDir = path.join(__dirname, "..", "clients", siteId);
    const repoUrl = `https://${process.env.GITHUB_TOKEN}@github.com/${process.env.GITHUB_USERNAME}/${repoName}.git`;

    const git = simpleGit();

    console.log(`📥 Clonage du dépôt ${repoName} dans ${targetDir}...`);
    await git.clone(repoUrl, targetDir);
    console.log("✅ Clonage terminé.");

    // Étape 2 : Générer le fichier .env
    generateEnvFile({ prenom, nom, email, siteId, pack }, targetDir);

    // Étape 3 : Répondre immédiatement
    res.json({ success: true, message: "Site en cours de création." });

    // Étape 4 : Lancer npm install en tâche de fond
    console.log("📦 Installation des dépendances en tâche de fond...");
    const npm = spawn("npm", ["install"], { cwd: targetDir, shell: true });

    npm.stdout.on("data", data => process.stdout.write(data));
    npm.stderr.on("data", data => process.stderr.write(data));

    npm.on("close", code => {
      if (code !== 0) {
        console.error("❌ npm install échoué (code", code, ")");
        return;
      }
      console.log("✅ Dépendances installées.");
      // Optionnel : lancer PM2 ou un autre processus ici
    });

  } catch (err) {
    console.error("❌ Erreur :", err.message);
    res.status(500).json({ success: false, message: "Erreur lors de la création du site." });
  }
});

module.exports = router;
