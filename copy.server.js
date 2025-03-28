const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const { MongoClient } = require("mongodb");
const nodemailer = require('nodemailer');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = 9999;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Middleware de protection JWT
function authenticateJWT(req, res, next) {
    const token = req.cookies.token || req.header("Authorization")?.split(" ")[1];
    if (!token) return res.status(403).json({ message: "Accès refusé, token manquant." });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Token invalide." });
        req.user = user;
        next();
    });
}

// Connexion à MongoDB
async function connectDB() {
    try {
        const client = new MongoClient(process.env.MONGO_URI);
        await client.connect();
        console.log("🚀 Connecté à MongoDB Atlas !");
        return client.db("scaly");
    } catch (error) {
        console.error("❌ Erreur de connexion :", error);
        throw error;
    }
}
const dbPromise = connectDB();

// Passport Google OAuth
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    const db = await dbPromise;
    const users = db.collection("users");
    let user = await users.findOne({ googleId: profile.id });
    if (!user) {
        user = await users.insertOne({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            verified: true
        });
    }
    return done(null, user);
}));

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
    const db = await dbPromise;
    const user = await db.collection("users").findOne({ _id: id });
    done(null, user);
});

// Routes d'authentification
app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const db = await dbPromise;
    const users = db.collection("users");

    const existingUser = await users.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Utilisateur déjà inscrit." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await users.insertOne({ email, password: hashedPassword, verified: false });

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const verificationLink = `http://localhost:${port}/verify-email?token=${token}`;

    await sendVerificationEmail(email, verificationLink);
    res.status(200).json({ message: "Vérifiez votre e-mail pour activer votre compte." });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const db = await dbPromise;
    const user = await db.collection("users").findOne({ email });
    if (!user) return res.status(400).json({ error: "Utilisateur non trouvé." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Mot de passe incorrect." });

    if (!user.verified) return res.status(403).json({ error: "E-mail non vérifié." });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({ token, message: "Connexion réussie." });
});

// Route pour Google OAuth
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/dashboard');
});

// Vérification du lien d'activation
app.get('/verify-email', async (req, res) => {
    const { token } = req.query;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const db = await dbPromise;
        await db.collection("users").updateOne({ email: decoded.email }, { $set: { verified: true } });
        res.status(200).send("Email vérifié. Vous pouvez maintenant vous connecter.");
    } catch (error) {
        res.status(400).send("Lien de vérification invalide ou expiré.");
    }
});

// Fonction d'envoi d'email de vérification
async function sendVerificationEmail(email, link) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS }
    });
    await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: "Vérifiez votre e-mail",
        text: `Cliquez sur le lien suivant pour valider votre compte : ${link}`
    });
}

// Lancement du serveur
app.listen(port, () => {
    console.log(`Serveur en ligne sur http://localhost:${port}`);
});
