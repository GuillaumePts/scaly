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
    origin: "http://192.168.1.69:9999", // Remplace par ton IP ou domaine exact
    credentials: true // Autorise les cookies
}));

app.use(cookieParser())




// async function connectDB() {
//     try {
//         const client = new MongoClient(process.env.MONGO_URI);
//         await client.connect();
//         console.log("🚀 Connecté à MongoDB Atlas !");
//     } catch (error) {
//         console.error("❌ Erreur de connexion :", error);
//     }
// }

// connectDB();


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

// app.use(cors());
app.use("/api", authRoutes); 
app.use("/api", clientRoutes); 










async function createFakeUser() {
  try {
      await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

      const email = "fakeuser@example.com";
      const existingUser = await User.findOne({ email });

      if (existingUser) {
          console.log("⚠️ L'utilisateur existe déjà.");
          return;
      }

      const hashedPassword = await bcrypt.hash("password123", 10);
      const fakeUser = new User({
          firstName: "John",
          lastName: "Doe",
          email,
          password: hashedPassword,
          address: "123 Rue du Test, Paris, France",
          phoneNumber: "+33123456789",
          birthDate: new Date("1995-06-15"),
          isVerified: true,

          // Infos abonnement
          subscriptionStatus: "actif",
          subscriptionProduct: "Scaly P'ics",
          subscriptionOption: "white",
          subscriptionDate: new Date(),

          // ID unique pour Scaly Pic’s
          siteId: crypto.randomBytes(8).toString("hex"),

          // Infos Stripe
          stripeCustomerId: "cus_fake123456",
          stripeSubscriptionId: "sub_fake78910",
          stripePaymentMethodId: "pm_fake54321"
      });

      await fakeUser.save();
      console.log("✅ Faux utilisateur créé avec succès !");
  } catch (err) {
      console.error("❌ Erreur lors de la création du faux utilisateur :", err);
  } finally {
      mongoose.connection.close();
  }
}





// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
