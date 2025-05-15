const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 9999;
app.use(express.json());
require('dotenv').config();
// Configurer Multer pour stocker les fichiers en mémoire
const bcrypt = require('bcryptjs');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const sharp = require('sharp');
const { MongoClient } = require("mongodb");
const mongoose = require('mongoose');
const crypto = require("crypto");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// const sqlite3 = require('sqlite3').verbose();
// const db = new sqlite3.Database('/db.sqlite');

// Utiliser le dossier 'public' pour les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static('public', {
  setHeaders: (res, path) => {
      res.set("Cache-Control", "public, max-age=31536000, immutable");
  }
}));

const cors = require("cors");
const cookieParser = require("cookie-parser");

app.use(cors({
    origin: "*", // à restreindre si nécessaire
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true // Autorise les cookies
}));

app.use(cookieParser())



// Route principale qui renvoie le fichier HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Routes pour les différents contenus de la page
app.get('/content/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/contact.html'));
});

app.get('/content/accueil', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/accueil.html'));
});

app.get('/content/pics', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/pics.html'));
});

app.get('/content/lock', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/lock.html'));
});

const User = require("./models/User");

async function connect() {
  try {
      // Connexion à MongoDB sans les options obsolètes
      await mongoose.connect(process.env.MONGO_URI);
      console.log("🚀 Connecté à MongoDB");

  } catch (err) {
      console.error('Erreur de connexion à MongoDB:', err);
  }
}

// Appel de la fonction pour se connecter
connect();

// Appel de la fonction pour se connecter




// Appel de la fonction pour créer l'utilisateur admin


// CONTACT////////////////////////////////////////
const nodemailer = require('nodemailer');
app.post('/contact-message',(req,res)=>{
  const { nom, email, message } = req.body;
    
  // Vérification des données
  if(!nom || !email || !message){
      return res.status(400).json({ error: 'Tous les champs sont requis.' });
  }

  // Configuration de Nodemailer
  const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS
      }
  });

  // Mail de confirmation pour l'utilisateur
  const mailToUser = {
      from: `"Scaly" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Confirmation de votre message',
      text: `Bonjour ${nom},\n\n votre message a bien été envoyé à ${process.env.PRENOM_PRO} ${process.env.NOM_PRO}.\n\nCordialement,\nScaly.`
  };

  // Mail pour le propriétaire du site
  const mailToOwner = {
      from: `"Scaly" <${process.env.GMAIL_USER}>`,
      to: process.env.MAIL,
      subject: 'Nouveau message reçu',
      text: `Vous avez reçu un nouveau message de la part de ${nom} (${email}) :\n\n${message}`
  };

  // Envoi du mail à l'utilisateur
  transporter.sendMail(mailToUser, (err, info) => {
      if (err) {
          console.error('Erreur envoi utilisateur:', err);
          return res.status(500).json({ error: 'Erreur lors de l\'envoi du mail à l\'utilisateur.' });
      }

      // Envoi du mail au propriétaire du site
      transporter.sendMail(mailToOwner, (err, info) => {
          if (err) {
              console.error('Erreur envoi propriétaire:', err);
              return res.status(500).json({ error: 'Erreur lors de l\'envoi du mail au propriétaire.' });
          }

          
          res.status(200).json({ success: 'Message envoyé avec succès !' });
      });
  });
})



// ////////////////////////////////////////////////////
// GESTION BACKEND ///////////////////////////////////
/////////////////////////////////////////////////////
// MONGODB////////////////////////////



const authRoutes = require("./routes/auth.js");  // Assure-toi du bon chemin du fichier
const clientRoutes = require("./routes/dashboard.js")
const insRoutes = require("./routes/inscription.js")
const webhookRoutes = require("./routes/paiement.js")
const stripeRoutes = require("./routes/stripe.js")
const buildSiteRoute = require("./routes/buildSite");


// app.use(cors());
app.use("/api", authRoutes); 
app.use("/api", clientRoutes); 
app.use("/api", insRoutes); 
app.use("/api", webhookRoutes); 
app.use("/api", stripeRoutes); 
app.use("/api", buildSiteRoute);

// const createClientRouter = require('./routes/createClientRouter');
// const clientPath = path.join(__dirname, 'clients', 'scalypics_d0b91a8c3b7b405');
// const clientRouter = createClientRouter(clientPath);
// app.use('/scalypics_d0b91a8c3b7b405', clientRouter);


// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
