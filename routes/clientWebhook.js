// routes/clientWebhook.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const Stripe = require('stripe');
const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Utilise ta vraie clé Stripe Webhook
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post('/client-webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('❌ Erreur de vérification Stripe :', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ✔️ Étape validée : on a un event Stripe authentique
    console.log('✅ Webhook Stripe reçu :', event.type);

    // Étape suivante : on traite les paiements
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        // 👇 Important : récupère l'identifiant de dossier client que tu avais mis dans la session Stripe
        const clientFolder = session.client_reference_id;

        if (!clientFolder) {
            return res.status(400).json({ error: 'client_reference_id manquant' });
        }

        // 🔍 On construit le chemin de destination
        const ticketDir = path.join(__dirname, '..', 'clients', clientFolder, 'ticket');
        const ticketFile = path.join(ticketDir, 'ticket-valide.json');

        try {
            // On s'assure que le dossier ticket existe
            fs.mkdirSync(ticketDir, { recursive: true });

            // Données à enregistrer
            const data = {
                ok: true,
                email: session.customer_email || 'inconnu',
                paidAt: new Date().toISOString()
            };

            fs.writeFileSync(ticketFile, JSON.stringify(data, null, 2));
            console.log(`✅ Fichier ticket-valide.json créé pour ${clientFolder}`);
        } catch (err) {
            console.error('❌ Erreur lors de la création du fichier :', err);
            return res.status(500).json({ error: 'Erreur lors de l’écriture du fichier' });
        }
    }

    res.json({ received: true });
});

router.post('/simulate-client-webhook', (req, res) => {
  // 🔧 Simule une session Stripe avec les infos utiles
  const fakeSession = {
    client_reference_id: req.body.clientFolder || 'demo-client',
    customer_email: req.body.email || 'test@example.com'
  };

  const clientFolder = fakeSession.client_reference_id;

  if (!clientFolder) {
    return res.status(400).json({ error: 'client_reference_id manquant' });
  }

  const ticketDir = path.join(__dirname, '..', 'clients', clientFolder, 'ticket');
  const ticketFile = path.join(ticketDir, 'ticket-valide.json');

  try {
    fs.mkdirSync(ticketDir, { recursive: true });

    const data = {
      ok: true,
      email: fakeSession.customer_email,
      paidAt: new Date().toISOString()
    };

    fs.writeFileSync(ticketFile, JSON.stringify(data, null, 2));
    console.log(`✅ [Simulation] Fichier ticket-valide.json créé pour ${clientFolder}`);

    res.json({ success: true, message: 'Webhook simulé avec succès' });
  } catch (err) {
    console.error('❌ Erreur lors de la simulation :', err);
    res.status(500).json({ error: 'Erreur lors de l’écriture du fichier' });
  }
});


module.exports = router;
