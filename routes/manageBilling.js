const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const path = require('path');


const jwt = require("jsonwebtoken");
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


router.post('/create-portal-session', verifyToken, async (req, res) => {
  try {
    const user = req.user; // récupéré depuis verifyToken
    if (!user.stripeCustomerId) {
      return res.status(400).json({ error: "Aucun client Stripe lié à ce compte." });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: 'http://192.168.1.69:9999/api/stripe-close', // ou ton domaine final
  });

    res.json({ url: portalSession.url });
  } catch (error) {
    console.error("Erreur création session portal Stripe :", error);
    res.status(500).json({ error: "Impossible de créer la session Stripe." });
  }
});

router.get('/stripe-close',(req,res) =>{
  res.sendFile(path.join(__dirname,'..' ,"views", "close-stripe.html"));
})

module.exports = router;
