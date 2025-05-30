const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const verifyToken = require('../utils/verifyToken');
const User = require('../models/User');

// Charger les packs
const packsPath = path.join(__dirname, '../pics.json');
const packs = JSON.parse(fs.readFileSync(packsPath, 'utf-8'));

// Fonction utilitaire pour calculer la taille d’un dossier récursivement
const getFolderSize = async (folderPath) => {
    let totalSize = 0;

    const items = await fs.promises.readdir(folderPath, { withFileTypes: true });

    for (const item of items) {
        const itemPath = path.join(folderPath, item.name);

        if (item.isDirectory()) {
            totalSize += await getFolderSize(itemPath);
        } else if (item.isFile()) {
            const stats = await fs.promises.stat(itemPath);
            totalSize += stats.size;
        }
    }

    return totalSize;
};

router.post('/changePack', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const { newPack, newColor } = req.body;

    if (!newPack || !newColor || !packs[newPack]) {
        return res.status(400).json({ error: 'Données invalides.' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });

        const currentPack = user.subscriptionStock;
        const targetPack = newPack;

        if (!packs[currentPack]) {
            return res.status(400).json({ message: 'Pack actuel inconnu.' });
        }

        const planPriority = {
            Starter: 1,
            Pro: 2,
            Unlimited: 3
        };

        const isUpgrade = planPriority[targetPack] > planPriority[currentPack];
        const isDowngrade = planPriority[targetPack] < planPriority[currentPack];
        const samePack = currentPack === targetPack;

        // Si downgrade, vérifier l'espace utilisé dans /clients/<siteId>/public/portfolio
        if (isDowngrade) {
            const siteId = user.siteId;
            const portfolioPath = path.join(__dirname, '..', 'clients', siteId, 'public', 'portfolio');

            if (!fs.existsSync(portfolioPath)) {
                return res.status(400).json({ error: "Le dossier portfolio n'existe pas." });
            }

            let portfolioSizeInBytes = 0;

            try {
                portfolioSizeInBytes = await getFolderSize(portfolioPath);
            } catch (err) {
                console.error("Erreur lors du calcul de la taille du portfolio :", err);
                return res.status(500).json({ error: "Impossible de vérifier le quota de stockage." });
            }

            const targetLimit = packs[targetPack].limit;

            if (portfolioSizeInBytes > targetLimit) {
                return res.status(403).json({
                    error: "Impossible de changer vers ce pack : vous dépassez la limite de stockage autorisée."
                });
            }
        }

        // Même pack → mise à jour couleur uniquement
        if (samePack) {
            user.subscriptionColor = newColor;
            await user.save();
            return res.json({ message: "Couleur mise à jour avec succès." });
        }

        // Upgrade → session Stripe Checkout
        if (isUpgrade) {
            const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
            const currentPrice = packs[currentPack].price;
            const targetPrice = packs[targetPack].price;
            const priceDiff = targetPrice - currentPrice;

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: `Upgrade vers ${targetPack}`,
                        },
                        unit_amount: priceDiff * 100,
                    },
                    quantity: 1,
                }],
                mode: 'payment',
                success_url: `${process.env.FRONTEND_URL}/successUpgrade?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL}/cancelUpgrade`,
                metadata: {
                    userId: user._id.toString(),
                    fromPack: currentPack,
                    toPack: targetPack,
                    newColor: newColor
                }
            });

            return res.json({ url: session.url });
        }

        // Downgrade → planifié pour la fin du mois
        if (isDowngrade) {
            const endOfSubscription = new Date(user.subscriptionDate);
            endOfSubscription.setMonth(endOfSubscription.getMonth() + 1);

            user.deletionRequested = true;
            user.deletionDate = endOfSubscription;
            user.futurePack = targetPack;
            user.futureColor = newColor;
            await user.save();

            return res.json({
                message: `Le changement vers ${targetPack} est programmé pour la fin de votre période actuelle.`,
                effectiveDate: endOfSubscription
            });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erreur serveur.' });
    }
});

router.post("/stripe/upgrade-confirmation", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: "Utilisateur non trouvé." });

        const { newPack, newColor } = req.body;
        if (!newPack || !newColor) {
            return res.status(400).json({ success: false, message: "Données manquantes." });
        }

        user.subscriptionStock = newPack;
        user.subscriptionColor = newColor;
        await user.save();

        return res.json({ success: true, message: "Upgrade effectué avec succès." });
    } catch (err) {
        console.error("Erreur /stripe/upgrade-confirmation :", err);
        return res.status(500).json({ success: false, message: "Erreur serveur." });
    }
});


module.exports = router;
