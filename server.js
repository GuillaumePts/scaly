const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 9999;
app.use(express.json());
require('dotenv').config();
// Configurer Multer pour stocker les fichiers en mémoire
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const sharp = require('sharp');
// const sqlite3 = require('sqlite3').verbose();
// const db = new sqlite3.Database('/db.sqlite');

// Utiliser le dossier 'public' pour les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static('public', {
  setHeaders: (res, path) => {
      res.set("Cache-Control", "public, max-age=31536000, immutable");
  }
}));


// Route principale qui renvoie le fichier HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

const loadDatabase = (req, res, next) => {
  const dbPath = path.join(__dirname, 'bdd.json'); // Assure-toi que le fichier est dans le même dossier
  fs.readFile(dbPath, 'utf8', (err, data) => {
      if (err) {
          return res.status(500).json({ error: 'Erreur de lecture de la base de données' });
      }
      try {
          req.db = JSON.parse(data); // Stocke les données dans req.db pour l'utiliser dans les routes
          next();
      } catch (error) {
          return res.status(500).json({ error: 'Erreur de parsing JSON' });
      }
  });
};

app.get('/contactfooter', loadDatabase, (req, res) => {

  const contactMain = req.db.contact?.main || []; // Récupère les objets de "contact.main" ou un tableau vide
  res.json(contactMain);
});

app.get('/globale', loadDatabase, (req, res) => {

  const contactMain = req.db.global || []; // Récupère les objets de "contact.main" ou un tableau vide
  res.json(contactMain);
});

app.get('/getaccueil', loadDatabase, (req, res) => {

  const contactMain = req.db.accueil || []; // Récupère les objets de "contact.main" ou un tableau vide
  res.json(contactMain);
});




function getImagePaths() {
  const imagesDir = path.join(__dirname, 'public/imgMob');
  return fs.readdirSync(imagesDir)
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map(file => `/imgMob/${file}`);
}


app.get('/api/images', (req, res) => {
  const images = getImagePaths();
  res.json(images);
  
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
const session = require('express-session');
const password = process.env.PASS_WORD;
const id = process.env.ID;



app.use(session({
  secret: process.env.SESSION_SECRET, // Une clé secrète utilisée pour signer l'identifiant de la session
  resave: false, // Ne pas sauvegarder la session si elle n'a pas été modifiée
  saveUninitialized: true, // Sauvegarder une session même si elle n'a pas été initialisée
  cookie: { 
    secure: false,
    maxAge: 3600000
   } // Pour des raisons de développement, on peut le laisser à false
}));




const crypto = require('crypto'); // Pour générer une clé sécurisée

// Route POST pour gérer la connexion avec ticket ou admin
app.post('/connexion', (req, res) => {
  const response = req.body;

  if (response && response.pass && response.id) {

    // Vérification pour l'admin
    if (response.pass === password && response.id === id) {
      // Création de la session pour l'admin
      req.session.user = {
        id: response.id,
        pass: response.pass
      };

      
      
      // Chemin vers le fichier HTML du backoffice
      const filePath = path.join(__dirname, '/backoffice.html');

      // Lire le contenu du fichier
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          res.status(200).send({
            obj: 'not success',
            message: 'Connexion échouée'
          });
        } else {
          res.status(200).send({
            html: data,
            message: 'Connexion réussie',
            session:"admin"
          });
        }
      });

    // 🔑 Gestion des tickets
    } else if (tickets.ticket && 
               tickets.ticket.idl === response.id && 
               tickets.ticket.key === response.pass) {

      // Générer une clé temporaire unique pour le ticket
      const sessionKey = crypto.randomBytes(32).toString('hex');

      // Création de la session pour le ticket avec expiration dans 1 heure
      req.session.ticket = {
        key: sessionKey,
        expire: Date.now() + 3600000 // Expire dans 1 heure
      };

      // Chemin sécurisé vers ticket.html
      const filePath = path.join(__dirname, '/views/ticket.html');

      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          res.status(500).send({
            obj: 'not success',
            message: 'Erreur serveur lors du chargement de la page.'
          });
        } else {
          res.status(200).send({
            html: data,
            message: 'Connexion avec ticket réussie',
            session:"client" // On envoie la clé temporaire au client
          });
        }
      });

    } else {
      // Ni admin, ni ticket valide
      res.status(401).send({
        obj: 'not success',
        message: 'Identifiants ou ticket invalide'
      });
    }

  } else {
    res.status(400).send('Données invalides');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
      if (err) {
        console.log("session non détruite")
          return res.status(500).send('Erreur lors de la déconnexion');
          
      }
      console.log("session détruite")

      return res.redirect('/');
      
  });
});

function verifierSessionOuRediriger(redirection = '/') {
  return (req, res, next) => {
      console.log('Session actuelle :', req.session); // Ajoutez ce log
      if (req.session && req.session.user) {
          return next(); // La session existe, continuez
      } else {
          console.warn('Session invalide ou expirée.');
          return res.redirect(redirection);
      }
  };
}





app.get('/admin',verifierSessionOuRediriger('/'), (req, res) => {
  const filePath = path.join(__dirname, '/backoffice.html');

          // Lire le contenu du fichier
          fs.readFile(filePath, 'utf8', (err, data) => {
              if (err) {
                console.log(err);
                res.status(200).send({
                  obj : 'accès non autorisé',
                });
      
              } else {
            
                res.status(200).send({
                  html : data,
                });
      
              }
          });
});




// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
