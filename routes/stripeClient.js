const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/Users");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const fs = require("fs");
const path = require("path");


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




router.post("/stripe-connect-onboarding", verifyToken, async (req, res) => {
    try {
        const token = req.cookies.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        const siteId = decoded.pics;

        // 🚧 Vérifie que le dossier du site client existe
        const clientFolderPath = path.join(__dirname, "..", "clients", siteId);
        if (!fs.existsSync(clientFolderPath)) {
            return res.status(400).json({
                success: false,
                message: "Veuillez d'abord publier votre site avant d'activer les paiements.",
            });
        }

        // 🔍 Vérifie que l'utilisateur existe
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });

        // ✅ Vérifie le droit au paiement client selon son pack
        const isAllowed = ["Starter", "Pro", "Unlimited"].includes(user.subscriptionStock);
        if (!isAllowed) {
            return res.status(403).json({ message: "Fonctionnalité réservée aux offres Starter, Pro et Unlimited." });
        }

        let accountId = user.stripeAccountId;

        // 👤 Créer le compte Stripe s’il n’existe pas encore
        if (!accountId) {
            const account = await stripe.accounts.create({
                type: "express",
                email: user.email,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
            });

            accountId = account.id;

            // 📝 Enregistre dans MongoDB
            user.stripeAccountId = accountId;
            user.stripeActivated = true;
            user.stripeActivationDate = new Date();
            await user.save();

            // 📁 Enregistre aussi dans config.json du client
            const configPath = path.join(clientFolderPath, "config.json");
            if (fs.existsSync(configPath)) {
                const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
                config.STRIPE_ACCOUNT_ID = accountId;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
                console.log(`✅ STRIPE_ACCOUNT_ID ajouté à config.json de ${user.siteId}`);
            } else {
                console.warn(`⚠️ config.json introuvable pour ${user.siteId}`);
            }
        }

        // 🔗 Crée le lien d’onboarding Stripe
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: "https://ton-site.com/compte",
            return_url: "http://192.168.1.69:9999/api/success",
            type: "account_onboarding",
        });

        return res.status(200).json({ success: true, url: accountLink.url });

    } catch (err) {
        console.error("Erreur Stripe Connect onboarding :", err);
        res.status(500).json({ message: "Erreur serveur Stripe Connect. Veuillez d'abord publier votre site avant d'activer les paiements." });
    }
});




router.post("/stripe-connect-dashboard", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user || !user.stripeAccountId) {
            return res.status(404).json({ message: "Compte Stripe introuvable." });
            console.log('!user || !user.stripeAccountId');
        }

        const loginLink = await stripe.accounts.createLoginLink(user.stripeAccountId, {
            redirect_url: "http://192.168.1.69:9999/api/success" // facultatif : où Stripe redirige après logout
        });

        return res.status(200).json({ success: true, url: loginLink.url });

    } catch (err) {
        console.error("Erreur création login Stripe dashboard :", err);
        return res.status(500).json({ message: "Erreur serveur Stripe Connect." });
    }
});



module.exports = router;
