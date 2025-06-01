const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const verifyToken = require('../utils/verifyToken');
const Users = require('../models/Users');
const updateClientTheme = require('../utils/updateClientTheme');


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
        return res.status(400).json({ message: 'Données invalides.' });
    }

    try {
        const user = await Users.findById(userId);
        if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

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
                return res.status(400).json({ message: "Le dossier portfolio n'existe pas." });
            }

            let portfolioSizeInBytes = 0;

            try {
                portfolioSizeInBytes = await getFolderSize(portfolioPath);
            } catch (err) {
                console.error("Erreur lors du calcul de la taille du portfolio :", err);
                return res.status(500).json({ message: "Impossible de vérifier le quota de stockage." });
            }

            const pics = require('../pics.json');
            const targetLimit = pics[targetPack].limit;

            if (portfolioSizeInBytes > targetLimit) {
                return res.status(400).json({
                    message: `Votre dossier "portfolio" dépasse la limite autorisée pour le pack ${targetPack}. Merci de réduire votre espace utilisé avant de changer de pack.`,
                    currentSize: portfolioSizeInBytes,
                    maxAllowed: targetLimit
                });
            }

            // ✅ Changement immédiat
            user.subscriptionStock = targetPack;
            user.subscriptionColor = newColor;
            user.price = pics[targetPack].price;


            try {
                await user.save();
                const clientPath = path.join(__dirname, '..', 'clients', user.siteId);
                const isPublished = fs.existsSync(clientPath);

                if (isPublished) {
                    await updateClientConfig(user.siteId, targetPack, packs);
                    await updateClientTheme(user.siteId, newColor);
                }

                return res.status(200).json({ message: `Pack changé pour ${targetPack}.Profitez maintenant de votre nouvel abonnement ! ` });
            } catch (err) {
                console.error("Erreur lors de l'enregistrement du changement :", err);
                return res.status(500).json({ message: "Erreur serveur lors du changement de pack." });
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
                success_url: `http://192.168.1.69:9999/api/success`,
                cancel_url: `http://192.168.1.69:9999/api/cancel`,
                // client_reference_id: user._id.toString(),
                metadata: {
                    userId: user._id.toString(),
                    fromPack: currentPack,
                    toPack: targetPack,
                    newColor: newColor
                }
            });

            return res.json({ url: session.url });
        }


    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erreur serveur.' });
    }
});

router.post("/stripe/upgrade-confirmation", verifyToken, async (req, res) => {
    try {
        const user = await Users.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: "Utilisateur non trouvé." });

        const { newPack, newColor } = req.body;
        if (!newPack || !newColor) {
            return res.status(400).json({ success: false, message: "Données manquantes." });
        }
        const pics = require('../pics.json');

        const now = new Date();
        const nextMonth = new Date(now);
        nextMonth.setMonth(now.getMonth() + 1);

        user.subscriptionStock = newPack;
        user.subscriptionColor = newColor;
        user.billingDate = now;
        user.nextBillingDate = nextMonth;
        user.price = pics[newPack].price;
        await user.save();

        const clientPath = path.join(__dirname, '..', 'clients', user.siteId);
        const isPublished = fs.existsSync(clientPath);

        if (isPublished) {
            await updateClientConfig(user.siteId, newPack, packs);
            await updateClientTheme(user.siteId, newColor);
        }
        return res.json({ success: true, message: "Upgrade effectué avec succès." });
    } catch (err) {
        console.error("Erreur /stripe/upgrade-confirmation :", err);
        return res.status(500).json({ success: false, message: "Erreur serveur." });
    }
});


const updateClientConfig = async (siteId, newPack, packs) => {
    const configPath = path.join(__dirname, '..', 'clients', siteId, 'config.json');

    if (!fs.existsSync(configPath)) {
        throw new Error("Le fichier config.json n'existe pas.");
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    config.PACK = newPack;
    config.LIMIT_STARTER = packs[newPack].limit;
    config.ALLOW_PAYMENT = packs[newPack].allowPayment;
    config.COMMISSION = packs[newPack].commission;

    await fs.promises.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
};



module.exports = router;
