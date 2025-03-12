const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 9999;
app.use(express.json());
require('dotenv').config();
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

app.get('/content/portfolio', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/portfolio.html'));
});

app.get('/content/lock', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/lock.html'));
});

app.get('/portfolio', (req, res) => {
  const directoryPath = path.join(__dirname, 'public/portfolio');

    // Lecture du contenu du dossier
    fs.readdir(directoryPath, { withFileTypes: true }, (err, files) => {
      if (err) {
        console.error('Erreur lors de la lecture du dossier :', err);
        return res.status(500).json({ error: 'Erreur lors de la lecture du dossier' });
      }
  
      // Création d'un tableau avec les informations des fichiers/dossiers
      const result = files.map(file => ({
        name: file.name,
      }));
  
      // Envoi de la réponse en JSON
      res.json(result);
    });
});

app.get('/portfolio/dossierimg/:el', (req,res) =>{

  const img = req.params.el
  const directoryPath = path.join(__dirname, `public/portfolio/${img}`);

  fs.readdir(directoryPath, (err, files) => {
    console.log(files);
    if(err){
      console.log('ça va pas');
    }else if(files.length ===0){
      res.json({src:"noimg"})
    }else{
      let chemin = `portfolio/${img}/${files[0]}`
      res.json({src:chemin})
    }

  });

})

app.get('/portfolio/img/:el', (req,res) =>{

  const img = req.params.el
  const directoryPath = path.join(__dirname, `public/portfolio/${img}`);

  fs.readdir(directoryPath, (err, files) => {

    if(err){
      console.log('ça va pas');
    }else if(files === 0){
      console.log("y'a rien");
    }else{
      
      res.json(files)
    }

  });

})



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



app.get('/views/ticket.html', verifierTicketOuRedirige('/'), (req, res) => {
  res.sendFile(path.join(__dirname, '/views/ticket.html'));
});


function verifierTicketOuRedirige(redirection = null) {
  return (req, res, next) => {
      console.log('Vérification du ticket - Session actuelle:', req.session?.ticket);

      if (req.session?.ticket && req.session.ticket.expire > Date.now()) {
          return next(); // ✅ Ticket valide, on continue
      } 

      console.warn('Accès refusé : ticket invalide ou expiré.');

      if (redirection) {
          return res.redirect(redirection); // 🔄 Redirection si spécifiée
      } else {
          return res.status(401).json({ success: false, message: 'Accès interdit, ticket invalide ou expiré.' });
      }
  };
}

const crypto = require('crypto'); // Pour générer une clé sécurisée


let tickets = {}; 
try {
    tickets = require('./ticket/ticket.json'); // Chargement sécurisé du fichier ticket.json
} catch (err) {
    console.warn('⚠️ Impossible de charger ticket.json, vérifiez le fichier.');
}

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



app.put('/edit-signature',verifierSessionOuRediriger('/'), (req, res) => {
  const { newS } = req.body;
  const dbPath = path.join(__dirname, 'bdd.json');

  if (!newS) {
      return res.status(400).json({ success: false, message: 'Nouvelle signature manquante' });
  }

  fs.readFile(dbPath, 'utf8', (err, data) => {
      if (err) {
          console.error('Erreur lecture fichier JSON:', err);
          return res.status(500).json({ success: false, message: 'Erreur serveur' });
      }

      let jsonData;
      try {
          jsonData = JSON.parse(data);
      } catch (parseErr) {
          console.error('Erreur parsing JSON:', parseErr);
          return res.status(500).json({ success: false, message: 'Erreur parsing JSON' });
      }

      // Modifier la signature
      jsonData.global.signature = newS;

      fs.writeFile(dbPath, JSON.stringify(jsonData, null, 2), 'utf8', (writeErr) => {
          if (writeErr) {
              console.error('Erreur écriture fichier JSON:', writeErr);
              return res.status(500).json({ success: false, message: 'Erreur sauvegarde' });
          }

          res.json({ success: true, message: 'Signature mise à jour', global: jsonData.global });
      });
  });
});

app.put('/edit-h1',verifierSessionOuRediriger('/'), (req, res) => {
  const { newS } = req.body;
  const dbPath = path.join(__dirname, 'bdd.json');

  if (!newS) {
      return res.status(400).json({ success: false, message: 'Nouvelle signature manquante' });
  }

  fs.readFile(dbPath, 'utf8', (err, data) => {
      if (err) {
          console.error('Erreur lecture fichier JSON:', err);
          return res.status(500).json({ success: false, message: 'Erreur serveur' });
      }

      let jsonData;
      try {
          jsonData = JSON.parse(data);
      } catch (parseErr) {
          console.error('Erreur parsing JSON:', parseErr);
          return res.status(500).json({ success: false, message: 'Erreur parsing JSON' });
      }

      // Modifier le titre
      jsonData.global.titre = newS;

      fs.writeFile(dbPath, JSON.stringify(jsonData, null, 2), 'utf8', (writeErr) => {
          if (writeErr) {
              console.error('Erreur écriture fichier JSON:', writeErr);
              return res.status(500).json({ success: false, message: 'Erreur sauvegarde' });
          }

          res.json({ success: true, message: 'Signature mise à jour', global: jsonData.global });
      });
  });
});



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

// ::::::::::::::::::::::::::::
// gestion carrou::::::::::::::
// ::::::::::::::::::::::::::::

// Route pour récupérer les images en fonction du dossier
app.get('/imagecarrou',verifierSessionOuRediriger('/') ,(req, res) => {
  const folder = req.query.folder;
  
  // Validation des entrées
  if (!folder || (folder !== 'imgMob' && folder !== 'imgPc')) {
      return res.status(400).json({ message: 'Dossier invalide.', erreur: true });
  }

  // Construire le chemin du dossier
  const directoryPath = path.join(__dirname, 'public', folder);

  // Vérifier si le dossier existe
  fs.access(directoryPath, fs.constants.R_OK, (err) => {
      if (err) {
          return res.status(404).json({ message: 'Dossier introuvable.', erreur: true });
      }

      // Lire les fichiers du dossier
      fs.readdir(directoryPath, (err, files) => {
          if (err) {
              return res.status(500).json({ message: 'Erreur lors de la lecture du dossier.', erreur: true });
          }

          // Filtrer uniquement les fichiers d'image (par exemple, jpg, png)
          const images = files.filter(file => /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(file));

          // Construire les chemins relatifs des images
          const imagePaths = images.map(image => `/${folder}/${image}`);

          res.json({ images: imagePaths });
      });
  });
});

// Route pour supprimer une image
app.post('/delete-image', verifierSessionOuRediriger('/') ,(req, res) => {
  const { imagePath } = req.body;

  if (!imagePath) {
      return res.status(400).json({ message: 'Chemin de l\'image non fourni.' });
  }

  // Convertir le chemin relatif en chemin absolu
  const fullPath = `public/${imagePath}`

  // Vérifier si le fichier existe
  fs.access(fullPath, fs.constants.F_OK, (err) => {
      if (err) {
          return res.status(404).json({ message: 'Fichier introuvable.' });
      }

      // Supprimer le fichier
      fs.unlink(fullPath, (err) => {
          if (err) {
              return res.status(500).json({ message: 'Erreur lors de la suppression du fichier.' });
          }

          res.json({ message: 'Image supprimée avec succès.' });
      });
  });
});



// Configurer Multer pour stocker les fichiers en mémoire
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const sharp = require('sharp');

app.post('/download-image-carrou',verifierSessionOuRediriger('/'), upload.single('image'), (req, res) => {
  const { description } = req.body;

  if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier reçu.', erreur: true });
  }

  // Déterminer le chemin du dossier en fonction de la description
  let folderPath = '';
  if (description === 'mobile') {
      folderPath = path.join(__dirname, 'public/imgMob');
  } else if (description === 'pc') {
      folderPath = path.join(__dirname, 'public/imgPc');
  } else {
      return res.status(400).json({ message: 'Description invalide.', erreur: true });
  }

  // Assurez-vous que le dossier existe, sinon créez-le
  if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
  }

  // Définir le chemin complet pour enregistrer le fichier
  const filePath = path.join(folderPath, req.file.originalname);

  // Écrire le fichier dans le dossier
  fs.writeFile(filePath, req.file.buffer, (err) => {
      if (err) {
          console.error('Erreur lors de l\'enregistrement du fichier :', err);
          return res.status(500).json({ message: 'Erreur serveur lors de l\'enregistrement du fichier.', erreur: true });
      }

      // Répondre au client
      res.json({
          message: 'Fichier téléchargé et enregistré avec succès.',
          fileName: req.file.originalname,
          folder: folderPath,
          erreur: false
      });
  });
});

////////////////////////////////////////////////
// //////////////GESTION DU TEXT DE PRESENTATION
////////////////////////////////////////////////


app.get('/envoi-text-profile',(req,res)=>{
  const filePath = path.join(__dirname, 'bdd.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erreur lors de la lecture du fichier JSON :', err);
            return res.status(500).json({ message: 'Erreur serveur.', erreur: true });
        }

        try {
            const jsonData = JSON.parse(data);
            const textProfile = jsonData.accueil["textprofile"]; // Extraire la donnée nécessaire

            if (!textProfile) {
                return res.status(200).json({ message: 'Texte non trouvé.', erreur: true });
            }

            res.json({ textProfile }); // Retourner la donnée au client
        } catch (parseError) {
            console.error('Erreur lors de l\'analyse du JSON :', parseError);
            return res.status(500).json({ message: 'Erreur serveur.' });
        }
    });
})



app.post('/edit-text-profil', verifierSessionOuRediriger('/'), (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ message: 'Aucun texte fourni.' , erreur: true });
    }

    const filePath = path.join(__dirname, 'bdd.json');

    // Lire le fichier JSON existant
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erreur lors de la lecture du fichier JSON :', err);
            return res.status(500).json({ message: 'Erreur serveur.', erreur: true });
        }

        try {
            const jsonData = JSON.parse(data);

            // Modifier la valeur de "accueil.text-profile"
            jsonData.accueil["textprofile"] = text;

            // Réécrire le fichier avec les modifications
            fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8', (writeErr) => {
                if (writeErr) {
                    console.error('Erreur lors de l\'écriture du fichier JSON :', writeErr);
                    return res.status(500).json({ message: 'Erreur serveur lors de la mise à jour.', erreur: true });
                }

                res.json({ message: 'Texte mis à jour avec succès.', erreur: false });
            });
        } catch (parseErr) {
            console.error('Erreur lors de l\'analyse du fichier JSON :', parseErr);
            return res.status(500).json({ message: 'Erreur serveur.' , erreur: true });
        }
    });
});


////////////////////////////////////
//////////GESTION SERVICES/////////
//////////////////////////////////

app.get('/envoi-services', (req,res)=>{
  const filePath = path.join(__dirname, 'bdd.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erreur lors de la lecture du fichier JSON :', err);
            return res.status(500).json({ message: 'Erreur serveur.' });
        }

        try {
            const jsonData = JSON.parse(data);
            const textProfile = jsonData.accueil["prestations"]; // Extraire la donnée nécessaire

            if (!textProfile) {
                return res.status(200).json({ message: 'Texte non trouvé.' });
            }

            res.json({ textProfile }); // Retourner la donnée au client
        } catch (parseError) {
            console.error('Erreur lors de l\'analyse du JSON :', parseError);
            return res.status(500).json({ message: 'Erreur serveur.' });
        }
    });
})

// Route pour supprimer une image
app.delete('/remove-service', (req, res) => {
  const serviceToDelete = req.query.service; // Récupérer la donnée depuis l'URL

  if (!serviceToDelete) {
      return res.status(400).json({ error: 'Le service à supprimer est manquant.', erreur: true });
  }

  // Lire la BDD
  fs.readFile('./bdd.json', 'utf8', (err, data) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Erreur lors de la lecture de la base de données.', erreur: true });
      }

      const db = JSON.parse(data);

      // Vérifier et supprimer le service
      const prestations = db.accueil.prestations;
      const index = prestations.indexOf(serviceToDelete);

      if (index === -1) {
          return res.status(200).json({ message: 'Service introuvable.', erreur: true });
      }

      prestations.splice(index, 1); // Supprimer le service

      // Écrire la mise à jour dans la BDD
      fs.writeFile('./bdd.json', JSON.stringify(db, null, 2), (err) => {
          if (err) {
              console.error(err);
              return res.status(500).json({ error: 'Erreur lors de la mise à jour de la base de données.' });
          }

          return res.status(200).json({ message: 'Service supprimé avec succès.', erreur: false });
      });
  });
});

// Route pour créer une prestation
app.post('/creat-prestation', (req, res) => {
  const newService = req.body.service;

  if (!newService || newService.trim() === '') {
      return res.status(200).json({ error: 'Le service à ajouter est vide ou invalide.' });
  }

  // Lire la base de données
  fs.readFile('./bdd.json', 'utf8', (err, data) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Erreur lors de la lecture de la base de données.' });
      }

      const db = JSON.parse(data);

      // Vérifier si le service existe déjà
      if (db.accueil.prestations.includes(newService)) {
          return res.status(200).json({ message: 'Le service existe déjà dans la liste, il n\'a pas été ajouté à nouveau.', erreur: true });
      }

      // Ajouter le nouveau service
      db.accueil.prestations.push(newService);

      // Écrire les modifications dans le fichier
      fs.writeFile('./bdd.json', JSON.stringify(db, null, 2), (err) => {
          if (err) {
              console.error(err);
              return res.status(500).json({ error: 'Erreur lors de la mise à jour de la base de données.' });
          }

          res.status(201).json({ message: 'Service ajouté avec succès.', erreur: false });
      });
  });
});












// /////////////////////////////////////////////
////////////GESTION DOSSIER/////////////////////
////////////////////////////////////////////////


app.get('/backcontent/photo', (req, res) => {
  res.sendFile(path.join(__dirname, 'views-back/photo.html'));
});

app.get('/backcontent/video', (req, res) => {
  res.sendFile(path.join(__dirname, 'views-back/video.html'));
});

const util = require('util');

// Convertit les méthodes basées sur des callbacks en Promises
const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);

async function getFolderContent(folderPath) {
  const result = {}; // Pour les dossiers
  const images = []; // Pour les fichiers image directement dans le dossier courant

  try {
      const items = await readdir(folderPath);

      for (const item of items) {
          const itemPath = path.join(folderPath, item);
          const itemStats = await stat(itemPath);

          if (itemStats.isDirectory()) {
              // Si c'est un dossier, appelle récursivement la fonction
              result[item] = await getFolderContent(itemPath);
          } else if (itemStats.isFile()) {
              // Si c'est un fichier, ajoute son chemin relatif dans le tableau d'images
              const relativePath = path.relative(path.join(__dirname, 'public'), itemPath);
              images.push(`/${relativePath.replace(/\\/g, '/')}`);
          }
      }

      // Si des images existent dans le dossier courant, ajoute-les au résultat sous forme de tableau
      if (images.length > 0) {
          result.images = images;
      }
  } catch (error) {
      console.error('Erreur lors de la lecture des fichiers :', error);
  }

  return result;
}

// Route pour renvoyer le contenu des dossiers
app.get('/getcontenuphoto', async (req, res) => {
  try {
      const folderPath = path.join(__dirname, 'public', 'portfolio', 'photo');
      const folderContent = await getFolderContent(folderPath);
      res.json(folderContent); // Renvoie le contenu structuré au front-end
  } catch (error) {
      console.error('Erreur lors de la récupération du contenu :', error);
      res.status(500).send('Erreur lors de la récupération du contenu');
  }
});






app.post('/creat-image-portfolio', verifierSessionOuRediriger('/'), upload.array('photos', 10), (req, res) => {
  // Vérifier que des fichiers sont envoyés
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Aucun fichier n\'a été téléchargé.' });
  }

  // Récupérer les informations envoyées par le frontend
  const dossier = req.body.dossier; // Dossier principal
  const sub = req.body.sub || ''; // Dossier secondaire, par défaut vide si non défini

  // Vérification des informations
  if (!dossier) {
    return res.status(400).json({ error: 'Le dossier principal est manquant.' });
  }

  // Si 'sub' est vide, on utilise seulement 'dossier'
  const uploadPath = path.join(__dirname, `public/portfolio/photo/${dossier}/${sub ? sub : ''}`);

  // Créer le dossier si il n'existe pas
  fs.mkdirSync(uploadPath, { recursive: true });

  // Sauvegarder les fichiers dans le dossier après traitement
  const promises = req.files.map(file => {
    const uniqueFileName = Date.now() + '-' + Math.floor(Math.random() * 1000) + '.webp'; // Générer un nom unique avec extension WebP
    const filePath = path.join(uploadPath, uniqueFileName); // Nom final du fichier

    return new Promise((resolve, reject) => {
      sharp(file.buffer)
        .webp({ quality: 80 }) // Convertir en WebP avec une qualité de 80 (ajuste selon tes besoins)
        .resize(1500) // Redimensionner l'image à une largeur de 1500px, ajustable
        .toFile(filePath, (err, info) => {
          if (err) {
            return reject(err);
          }
          resolve(filePath); // Renvoie le chemin du fichier sauvegardé
        });
    });
  });

  Promise.all(promises)
    .then((filePaths) => {
      res.json({ message: 'Images téléchargées et optimisées avec succès', files: filePaths });
    })
    .catch((err) => {
      res.status(500).json({ error: 'Erreur lors de l\'enregistrement des fichiers', details: err });
    });
});



app.delete('/delete-img-portfolio',verifierSessionOuRediriger('/'), (req, res) => {
  const { src } = req.body;

  if (!src) {
      return res.status(400).json({ error: 'Chemin du fichier non fourni.' });
  }

  // Résolution du chemin absolu
  const filePath = path.join(__dirname, 'public', src.replace(/^\/+/, '')); // Suppression éventuelle des "/"

  // Vérification et suppression du fichier
  fs.stat(filePath, (err, stats) => {
      if (err) {
          console.error('Fichier introuvable :', filePath);
          return res.status(404).json({ error: 'Fichier introuvable.' });
      }

      fs.unlink(filePath, (err) => {
          if (err) {
              console.error('Erreur lors de la suppression :', err);
              return res.status(500).json({ error: 'Erreur lors de la suppression du fichier.' });
          }

          console.log('Fichier supprimé avec succès :', filePath);
          res.status(200).json({ message: 'Fichier supprimé avec succès.' });
      });
  });
});


///////SOUSDOSSIER/////////////////////////////////
app.post('/add-sub-folder',verifierSessionOuRediriger('/'), (req, res) => {
  const { folder, subFolder } = req.body;

  if (!folder || !subFolder) {
      return res.status(400).json({ success: false, message: 'Dossier parent ou sous-dossier manquant.' });
  }

  const basePath = path.join(__dirname, 'public', 'portfolio', 'photo');
  const parentFolderPath = path.join(basePath, folder);
  const subFolderPath = path.join(parentFolderPath, subFolder);

  // Check if parent folder exists
  if (!fs.existsSync(parentFolderPath)) {
      return res.status(400).json({ success: false, message: `Le dossier parent ${folder} n'existe pas.` });
  }

  // Check if subfolder already exists
  if (fs.existsSync(subFolderPath)) {
      return res.status(400).json({ success: false, message: `Le sous-dossier ${subFolder} existe déjà dans ${folder}.` });
  }

  // Create the subfolder
  try {
      fs.mkdirSync(subFolderPath);
      return res.json({ success: true, message: `Sous-dossier ${subFolder} créé avec succès dans ${folder}.` });
  } catch (error) {
      console.error('Erreur lors de la création du sous-dossier:', error);
      return res.status(500).json({ success: false, message: 'Erreur lors de la création du sous-dossier.' });
  }
});




// DELETE SUB FOLDER ////////////////////////////////

app.delete('/remove-sub-folder',verifierSessionOuRediriger('/'), (req, res) => {
  const { folder, subFolder } = req.body;

  if (!folder || !subFolder) {
      return res.status(400).json({ success: false, message: 'Dossier parent ou sous-dossier manquant pour suppression.' });
  }

  const basePath = path.join(__dirname, 'public', 'portfolio', 'photo');
  const subFolderPath = path.join(basePath, folder, subFolder);

  // Check if subfolder exists
  if (!fs.existsSync(subFolderPath)) {
      return res.status(400).json({ success: false, message: `Le sous-dossier ${subFolder} n'existe pas dans ${folder}.` });
  }

  // Remove the subfolder
  try {
      fs.rmdirSync(subFolderPath, { recursive: true });
      return res.json({ success: true, message: `Sous-dossier ${subFolder} supprimé avec succès de ${folder}.` });
  } catch (error) {
      console.error('Erreur lors de la suppression du sous-dossier:', error);
      return res.status(500).json({ success: false, message: 'Erreur lors de la suppression du sous-dossier.' });
  }
});


// //// PUT SUBFOLDER///////////////////////////////////////

app.put('/edit-sub-folder',verifierSessionOuRediriger('/'), (req, res) => {
  const { folder, oldSubFolder, newSubFolder } = req.body;

  if (!folder || !oldSubFolder || !newSubFolder) {
      return res.status(400).json({ success: false, message: 'Données manquantes pour renommer le sous-dossier.' });
  }

  const basePath = path.join(__dirname, 'public', 'portfolio', 'photo');
  const oldSubFolderPath = path.join(basePath, folder, oldSubFolder);
  const newSubFolderPath = path.join(basePath, folder, newSubFolder);

  if (!fs.existsSync(oldSubFolderPath)) {
      return res.status(400).json({ success: false, message: `Le sous-dossier ${oldSubFolder} n'existe pas dans ${folder}.` });
  }

  if (fs.existsSync(newSubFolderPath)) {
      return res.status(400).json({ success: false, message: `Un sous-dossier nommé ${newSubFolder} existe déjà dans ${folder}.` });
  }

  try {
      fs.renameSync(oldSubFolderPath, newSubFolderPath);
      return res.json({ success: true, message: `Sous-dossier ${oldSubFolder} renommé en ${newSubFolder} avec succès.` });
  } catch (error) {
      console.error('Erreur lors du renommage du sous-dossier:', error);
      return res.status(500).json({ success: false, message: 'Erreur lors du renommage du sous-dossier.' });
  }
});


//////////////////////////////////////////////////////////////////////////
///////////FOLDER PRINCIPAL///////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
app.post('/add-folder', (req, res) => {
  let { folderName } = req.body;

  if (!folderName) {
      return res.status(400).json({ success: false, message: 'Nom du dossier requis.' });
  }

  // Remplace les espaces par des underscores (_) sans toucher aux autres caractères
  folderName = folderName.trim().replace(/\s+/g, '_');

  const basePath = path.join(__dirname, 'public', 'portfolio', 'photo');
  const folderPath = path.join(basePath, folderName);

  if (fs.existsSync(folderPath)) {
      return res.status(400).json({ success: false, message: 'Ce dossier existe déjà.' });
  }

  fs.mkdir(folderPath, { recursive: true }, (err) => {
      if (err) {
          console.error('Erreur lors de la création du dossier:', err);
          return res.status(500).json({ success: false, message: 'Erreur serveur lors de la création du dossier.' });
      }

      res.status(200).json({ success: true, message: `Dossier ${folderName} créé avec succès.`, folderName });
  });
});


app.post('/remove-folder',verifierSessionOuRediriger('/'), (req, res) => {
  const { folderName } = req.body;

  if (!folderName) {
      return res.status(400).json({ success: false, message: 'Nom du dossier requis.' });
  }

  const basePath = path.join(__dirname, 'public', 'portfolio', 'photo');
  const folderPath = path.join(basePath, folderName);

  if (!fs.existsSync(folderPath)) {
      return res.status(400).json({ success: false, message: 'Le dossier n\'existe pas.' });
  }

  fs.rmdir(folderPath, { recursive: true }, (err) => {
      if (err) {
          console.error('Erreur lors de la suppression du dossier:', err);
          return res.status(500).json({ success: false, message: 'Erreur serveur lors de la suppression du dossier.' });
      }

      res.status(200).json({ success: true, message: `Dossier ${folderName} supprimé avec succès.` });
  });
});



app.put('/edit-folder', verifierSessionOuRediriger('/'), async (req, res) => {
  const { oldFolderName, newFolderName } = req.body;

  if (!oldFolderName || !newFolderName) {
      return res.status(400).json({ success: false, message: 'Données manquantes pour renommer le dossier.' });
  }

  const basePath = path.join(__dirname, 'public', 'portfolio', 'photo');
  const oldFolderPath = path.join(basePath, oldFolderName);
  const newFolderPath = path.join(basePath, newFolderName);

  if (!fs.existsSync(oldFolderPath)) {
      return res.status(400).json({ success: false, message: `Le dossier ${oldFolderName} n'existe pas.` });
  }

  if (fs.existsSync(newFolderPath)) {
      return res.status(400).json({ success: false, message: `Un dossier nommé ${newFolderName} existe déjà.` });
  }

  try {
    console.log('Renommage du dossier:', oldFolderPath, '->', newFolderPath);
    await fs.promises.rename(oldFolderPath, newFolderPath);
    console.log('Renommage réussi');
    return res.json({ success: true, message: `Dossier ${oldFolderName} renommé en ${newFolderName} avec succès.` });
} catch (error) {
    console.error('Erreur lors du renommage du dossier:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors du renommage du dossier.', error });
}
});


////////////////////////////////////////////////////////////////
//////GESTION VIDEOS///////////////////////////////////////////
//////////////////////////////////////////////////////////////

const videosPath = path.join(__dirname, 'public/portfolio/video/videos.json');

app.get('/get-videos', (req, res) => {
  fs.readFile(videosPath, 'utf8', (err, data) => {
      if (err) {
          return res.status(500).json({ error: 'Erreur lors de la lecture des vidéos.' });
      }
      try {
          const videos = JSON.parse(data).liens || [];
          res.json(videos);
      } catch (parseErr) {
          res.status(500).json({ error: 'Erreur lors de l\'analyse du fichier JSON.' });
      }
  });
});


app.post('/add-video', (req, res) => {
  const { url, titre, description } = req.body;

  if (!url || !titre || !description) {
      return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });
  }

  fs.readFile(path.join(__dirname, 'public/portfolio/video/videos.json'), 'utf8', (err, data) => {
      if (err) {
          return res.status(500).json({ error: 'Erreur de lecture du fichier.' });
      }

      try {
          const jsonData = JSON.parse(data);
          const videos = jsonData.liens || [];

          // Vérifie si la vidéo existe déjà
          if (videos.some(video => video.url === url)) {
              return res.status(400).json({ error: 'Cette vidéo existe déjà.' });
          }

          // Ajoute la nouvelle vidéo
          videos.push({ titre, description, url });
          jsonData.liens = videos;

          // Sauvegarde le fichier JSON mis à jour
          fs.writeFile(videosPath, JSON.stringify(jsonData, null, 4), (writeErr) => {
              if (writeErr) {
                  return res.status(500).json({ error: 'Erreur lors de l\'enregistrement.' });
              }
              res.json({ message: 'Vidéo ajoutée avec succès.' });
          });

      } catch (parseErr) {
          res.status(500).json({ error: 'Erreur de parsing du fichier JSON.' });
      }
  });
});

app.put('/edit-video', (req, res) => {
  const { oldUrl, url, titre, description } = req.body;

  if (!oldUrl || !url || !titre || !description) {
      return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });
  }

  fs.readFile(videosPath, 'utf8', (err, data) => {
      if (err) {
          return res.status(500).json({ error: 'Erreur de lecture du fichier.' });
      }

      try {
          const jsonData = JSON.parse(data);
          let videos = jsonData.liens || [];

          const videoIndex = videos.findIndex(video => video.url === oldUrl);
          if (videoIndex === -1) {
              return res.status(404).json({ error: 'Vidéo introuvable.' });
          }

          // Vérifie si la nouvelle URL existe déjà (sauf si c'est la même que l'ancienne)
          if (url !== oldUrl && videos.some(video => video.url === url)) {
              return res.status(400).json({ error: 'Une vidéo avec cette URL existe déjà.' });
          }

          // Mise à jour de la vidéo
          videos[videoIndex] = { titre, description, url };
          jsonData.liens = videos;

          fs.writeFile(videosPath, JSON.stringify(jsonData, null, 4), (writeErr) => {
              if (writeErr) {
                  return res.status(500).json({ error: 'Erreur lors de l\'enregistrement.' });
              }
              res.json({ message: 'Vidéo mise à jour avec succès.' });
          });

      } catch (parseErr) {
          res.status(500).json({ error: 'Erreur de parsing du fichier JSON.' });
      }
  });
});




app.delete('/remove-video', (req, res) => {
  const { url } = req.body;

  fs.readFile('./public/portfolio/video/videos.json', 'utf8', (err, data) => {
      if (err) {
          console.error('Erreur de lecture du fichier:', err);
          return res.status(500).json({ error: 'Erreur de lecture du fichier' });
      }

      let parsedData;
      try {
          parsedData = JSON.parse(data);
          if (!parsedData.liens || !Array.isArray(parsedData.liens)) {
              throw new Error('Le fichier JSON ne contient pas un tableau de vidéos valide');
          }
      } catch (parseError) {
          console.error('Erreur de parsing JSON:', parseError);
          return res.status(500).json({ error: 'Données JSON invalides' });
      }

      let videos = parsedData.liens;
      const updatedVideos = videos.filter(video => video.url !== url);

      if (videos.length === updatedVideos.length) {
          return res.status(404).json({ error: 'Vidéo non trouvée' });
      }

      parsedData.liens = updatedVideos;

      fs.writeFile('./public/portfolio/video/videos.json', JSON.stringify(parsedData, null, 2), (err) => {
          if (err) {
              console.error('Erreur lors de la suppression:', err);
              return res.status(500).json({ error: 'Erreur lors de la suppression de la vidéo' });
          }

          res.json({ success: true, message: 'Vidéo supprimée avec succès' });
      });
  });
});



// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::








app.get('/envoi-photo-profile', (req,res)=>{
  const folderPath = path.join(__dirname, 'public/imgprofile');
    
  // Lire le contenu du dossier
  fs.readdir(folderPath, (err, files) => {
      if (err) {
          console.error('Erreur lors de la lecture du dossier :', err);
          return res.status(500).json({ message: 'Erreur serveur lors de la récupération de l\'image.' });
      }

      // Vérifier s'il y a au moins un fichier
      if (files.length === 0) {
          return res.status(200).json({ message: false });
      }

      // Renvoyer le chemin du premier fichier trouvé (il ne doit y en avoir qu'un)
      const filePath = files[0]
      res.json({ source: filePath, message: true });
  });
})


app.post('/upload-profile-image', verifierSessionOuRediriger('/'), upload.single('profileImage'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Aucun fichier reçu.' });
  }

  const folderPath = 'public/imgprofile';
  const newFileName = 'profile.png'; // Nouveau nom du fichier
  const filePath = path.join(folderPath, newFileName);

  // Supprimer tout le contenu du dossier avant de sauvegarder le nouveau fichier
  try {
    if (fs.existsSync(folderPath)) {
      const files = fs.readdirSync(folderPath);

      // Supprimer chaque fichier dans le dossier
      files.forEach(file => {
        const fileToDelete = path.join(folderPath, file);
        fs.unlinkSync(fileToDelete);
      });
    } else {
      // Créer le dossier s'il n'existe pas
      fs.mkdirSync(folderPath, { recursive: true });
    }
  } catch (err) {
    console.error('Erreur lors de la suppression des fichiers dans le dossier :', err);
    return res.status(500).json({ message: 'Erreur serveur lors de la gestion du dossier.' });
  }

  // Enregistrer le fichier avec le nom "profile.png"
  fs.writeFile(filePath, req.file.buffer, (err) => {
    if (err) {
      console.error('Erreur lors de l\'enregistrement du fichier :', err);
      return res.status(500).json({ message: 'Erreur serveur lors de l\'enregistrement du fichier.' });
    }

    // Répondre au client
    res.json({
      message: 'Fichier téléchargé et enregistré avec succès.',
      fileName: newFileName,
      folder: folderPath,
    });
  });
});


app.get('/getillustration', (req,res)=>{

  const folderPath = path.join(__dirname, 'public/imgaccueil');
    
  // Lire le contenu du dossier
  fs.readdir(folderPath, (err, files) => {
      if (err) {
          console.error('Erreur lors de la lecture du dossier :', err);
          return res.status(500).json({ message: 'Erreur serveur lors de la récupération de l\'image.' });
      }

      // Vérifier s'il y a au moins un fichier
      if (files.length === 0) {
          return res.status(200).json({ message: 'pas d\image' });
      }

      // Renvoyer le chemin du premier fichier trouvé (il ne doit y en avoir qu'un)
      const filePath = files[0]
      res.json({ src: filePath });
  });
})

app.get('/getillustration-contact', (req,res)=>{

  const folderPath = path.join(__dirname, 'public/imgcontact');
    
  // Lire le contenu du dossier
  fs.readdir(folderPath, (err, files) => {
      if (err) {
          console.error('Erreur lors de la lecture du dossier :', err);
          return res.status(500).json({ message: 'Erreur serveur lors de la récupération de l\'image.' });
      }

      // Vérifier s'il y a au moins un fichier
      if (files.length === 0) {
          return res.status(200).json({ message: 'pas d\image' });
      }

      // Renvoyer le chemin du premier fichier trouvé (il ne doit y en avoir qu'un)
      const filePath = files[0]
      res.json({ src: filePath });
  });
})



app.post('/changeillustration',verifierSessionOuRediriger('/') ,upload.single('illustration'), (req, res) => {
  const targetDir = path.join(__dirname, 'public', 'imgaccueil');
  const fileName = 'illustration.png'; // Nom par défaut pour l'image

  // Vérifier que le fichier est bien uploadé
  if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier uploadé.', erreur: true });
  }

  // Supprimer toutes les images existantes dans le dossier
  fs.readdir(targetDir, (err, files) => {
      if (err) {
          console.error('Erreur lors de la lecture du dossier:', err);
          return res.status(500).json({ message: 'Erreur serveur.', erreur: true });
      }

      // Supprimer les fichiers existants
      files.forEach((file) => {
          const filePath = path.join(targetDir, file);
          fs.unlink(filePath, (err) => {
              if (err) console.error('Erreur suppression ancienne image:', err);
          });
      });

      // Écrire la nouvelle image dans le dossier
      const filePath = path.join(targetDir, fileName);
      fs.writeFile(filePath, req.file.buffer, (err) => {
          if (err) {
              console.error('Erreur lors de l\'écriture du fichier:', err);
              return res.status(500).json({ message: 'Erreur lors de l\'enregistrement du fichier.', erreur: true });
          }

          // Réponse réussie
          res.json({ message: 'Image mise à jour avec succès.', erreur: false });
      });
  });
});



app.post('/changeillustrationContact',verifierSessionOuRediriger('/') ,upload.single('illustration'), (req, res) => {
  const targetDir = path.join(__dirname, 'public', 'imgcontact');
  const fileName = 'illustration-contact.jpg'; // Nom par défaut pour l'image

  // Vérifier que le fichier est bien uploadé
  if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier uploadé.', erreur: true });
  }

  // Supprimer toutes les images existantes dans le dossier
  fs.readdir(targetDir, (err, files) => {
      if (err) {
          console.error('Erreur lors de la lecture du dossier:', err);
          return res.status(500).json({ message: 'Erreur serveur.', erreur: true });
      }

      // Supprimer les fichiers existants
      files.forEach((file) => {
          const filePath = path.join(targetDir, file);
          fs.unlink(filePath, (err) => {
              if (err) console.error('Erreur suppression ancienne image:', err);
          });
      });

      // Écrire la nouvelle image dans le dossier
      const filePath = path.join(targetDir, fileName);
      fs.writeFile(filePath, req.file.buffer, (err) => {
          if (err) {
              console.error('Erreur lors de l\'écriture du fichier:', err);
              return res.status(500).json({ message: 'Erreur lors de l\'enregistrement du fichier.', erreur: true });
          }

          // Réponse réussie
          res.json({ message: 'Image mise à jour avec succès.', erreur: false });
      });
  });
});




/////////////////////////////////////////////////////////////////////////////////
//GESTION CONTACT BACK//////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

app.get('/send-link', (req,res)=>{
  const filePath = path.join(__dirname, 'bdd.json'); // Chemin vers le fichier JSON

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Erreur lors de la lecture du fichier JSON :', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    try {
      const jsonData = JSON.parse(data); // Parse du fichier JSON
      res.json(jsonData.contact.main); // Envoi des données "main" au client
    } catch (parseError) {
      console.error('Erreur de parsing JSON :', parseError);
      res.status(500).json({ error: 'Erreur de parsing JSON' });
    }
  });
})



// Route DELETE pour supprimer une prestation
app.delete('/delete-prestation',verifierSessionOuRediriger('/'), (req, res) => {

  const filePath = path.join(__dirname, 'bdd.json');
  const { key } = req.body;

  if (!key) {
    return res.status(400).json({ error: 'Clé non spécifiée' });
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Erreur lors de la lecture du fichier:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    let database;
    try {
      database = JSON.parse(data);
    } catch (parseError) {
      console.error('Erreur de parsing JSON:', parseError);
      return res.status(500).json({ error: 'Erreur de parsing JSON' });
    }

    if (!Array.isArray(database.contact?.main)) {
      return res.status(400).json({ error: 'La structure de données est invalide.' });
    }

    const index = database.contact.main.findIndex(item => Object.keys(item)[0] === key);
    if (index === -1) {
      return res.status(404).json({ error: 'Clé non trouvée.' });
    }

    database.contact.main.splice(index, 1);

    fs.writeFile(filePath, JSON.stringify(                                                                                                                                                                                                                                                                                                                                                                              database, null, 2), writeErr => {
      if (writeErr) {
        console.error('Erreur lors de l\'écriture du fichier:', writeErr);
        return res.status(500).json({ error: 'Erreur serveur' });
      }

      res.status(200).json({ message: 'Contact supprimé avec succès' });
    });
  });
});


app.post('/add-reseau',verifierSessionOuRediriger('/'), (req, res) => {
  const filePath = path.join(__dirname, 'bdd.json');
  const { key, link, text } = req.body;

  if (!key || !link || !text) {
    return res.status(400).json({ error: 'Tous les champs doivent être remplis.' });
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Erreur lors de la lecture du fichier:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    let database;
    try {
      database = JSON.parse(data);
    } catch (parseError) {
      console.error('Erreur de parsing JSON:', parseError);
      return res.status(500).json({ error: 'Erreur de parsing JSON' });
    }

    if (!Array.isArray(database.contact?.main)) {
      database.contact.main = []; // Initialiser le tableau si nécessaire
    }

    const existingIndex = database.contact.main.findIndex(item => Object.keys(item)[0] === key);
    if (existingIndex !== -1) {
      return res.status(400).json({ error: 'Un contact avec cette clé existe déjà.' });
    }

    const newEntry = {
      [key]: {
        link,
        text,
      },
    };
    database.contact.main.push(newEntry);

    fs.writeFile(filePath, JSON.stringify(database, null, 2), writeErr => {
      if (writeErr) {
        console.error('Erreur lors de l\'écriture du fichier:', writeErr);
        return res.status(500).json({ error: 'Erreur serveur' });
      }

      res.status(200).json({ message: 'Contact ajouté avec succès', data: newEntry });
    });
  });
});

///////////////////////////////////////////////:
/////////TICKET//////////////////////////////:::::::
//////////////////////////////////////////////////
app.post('/creat-ticket', upload.array('files'),verifierSessionOuRediriger('/'), (req, res) => {
  const { idl, key, nom, prenom } = req.body;
  const files = req.files;

  // Vérification des champs
  if (!idl || !key || !nom || !prenom || files.length === 0) {
      return res.status(400).json({ success: false, message: 'Données manquantes' });
  }

  // Chemin du dossier de stockage
  const ticketDir = path.join(__dirname, 'ticket');
  const ticketFolder = path.join(ticketDir, 'scaly-photos'); // Renommé ici

  // Suppression des anciens dossiers sauf ticket.json
  const items = fs.readdirSync(ticketDir);
  items.forEach(item => {
      const itemPath = path.join(ticketDir, item);
      if (fs.lstatSync(itemPath).isDirectory()) {
          fs.rmSync(itemPath, { recursive: true, force: true });
      }
  });

  // Création du dossier s'il n'existe pas
  if (!fs.existsSync(ticketFolder)) {
      fs.mkdirSync(ticketFolder, { recursive: true });
  }

  // Enregistrement des fichiers
  files.forEach(file => {
      const filePath = path.join(ticketFolder, file.originalname);
      fs.writeFileSync(filePath, file.buffer);
  });

  // Calcul de la taille totale en Mo ou Go
  const taille = files.reduce((acc, file) => acc + file.size, 0);
  const tailleMo = (taille / (1024 * 1024)).toFixed(2);
  const tailleGo = (taille / (1024 * 1024 * 1024)).toFixed(2);
  const tailleFinale = tailleGo > 1 ? `${tailleGo} Go` : `${tailleMo} Mo`;

  // Chemin du fichier ticket.json
  const ticketJsonPath = path.join(ticketDir, 'ticket.json');

  // Création du JSON du ticket
  const ticketData = {
      ticket: {
          idl,
          key,
          nom,
          prenom,
          dossier: 'scaly-photos', // On force ici aussi
          nombrel: files.length,
          taille: tailleFinale
      }
  };

  // Écriture (ou écrasement) du fichier JSON
  fs.writeFileSync(ticketJsonPath, JSON.stringify(ticketData, null, 4));

  res.json({ success: true, message: 'Ticket créé avec succès.' });
});




app.get('/get-ticket',verifierSessionOuRediriger('/'), (req, res) => {
  const ticketPath = path.join(__dirname, 'ticket/ticket.json');

  if (fs.existsSync(ticketPath)) {
      fs.readFile(ticketPath, 'utf8', (err, data) => {
          if (err) {
              console.error('Erreur de lecture du fichier:', err);
              return res.status(500).json({ error: 'Erreur serveur' });
          }
          res.json(JSON.parse(data));
      });
  } else {
      res.status(404).json({ message: 'Aucun ticket trouvé' });
  }
});


app.delete('/reset-ticket',verifierSessionOuRediriger('/'), (req, res) => {
  const ticketPath = path.join(__dirname, 'ticket', 'ticket.json');

  // Lecture du fichier ticket.json
  fs.readFile(ticketPath, 'utf8', (err, data) => {
      if (err) {
          console.error('Erreur lecture JSON :', err);
          return res.status(500).json({ success: false, message: 'Erreur serveur' });
      }

      let ticketData;
      try {
          ticketData = JSON.parse(data);
      } catch (parseErr) {
          console.error('Erreur parsing JSON :', parseErr);
          return res.status(500).json({ success: false, message: 'Erreur parsing JSON' });
      }

      // Si un dossier est attribué, on le supprime
      if (ticketData.ticket.dossier) {
          const dossierPath = path.join(__dirname, 'ticket', ticketData.ticket.dossier);

          fs.rm(dossierPath, { recursive: true, force: true }, (err) => {
              if (err) {
                  console.error('Erreur suppression dossier :', err);
                  return res.status(500).json({ success: false, message: 'Erreur suppression dossier' });
              }

              console.log('Dossier supprimé avec succès');
          });
      }

      // Réinitialisation des données du ticket
      ticketData.ticket = {
          "idl": "",
          "key": "",
          "nom":"",
          "prenom":"",
          "dossier": "",
          "nombrel": "",
          "taille": ""
      };

      // Écriture des nouvelles données dans ticket.json
      fs.writeFile(ticketPath, JSON.stringify(ticketData, null, 4), (err) => {
          if (err) {
              console.error('Erreur écriture JSON :', err);
              return res.status(500).json({ success: false, message: 'Erreur écriture JSON' });
          }

          res.json({ success: true });
      });
  });
});

app.get('/get-ticket-folder',verifierTicketOuRedirige('/'), (req, res) => {
  const ticketPath = path.join(__dirname, 'ticket', 'ticket.json');

  try {
      if (!fs.existsSync(ticketPath)) {
          return res.status(404).json({ error: "Le fichier ticket.json est introuvable." });
      }

      const ticketData = JSON.parse(fs.readFileSync(ticketPath, 'utf8'));

      if (!ticketData.ticket || !ticketData.ticket.nom || !ticketData.ticket.prenom) {
          return res.status(400).json({ error: "Informations du ticket incomplètes." });
      }

      res.json({
          nom: ticketData.ticket.nom,
          prenom: ticketData.ticket.prenom
      });
  } catch (error) {
      console.error("Erreur lors de la lecture du ticket.json :", error);
      res.status(500).json({ error: "Erreur serveur lors de la récupération des informations." });
  }
  
});


app.use('/ticket', express.static(path.join(__dirname, 'ticket')));
app.get('/photo-ticket-folder',verifierTicketOuRedirige('/'), (req, res) => {
  const ticketFolder = path.join(__dirname, 'ticket', 'scaly-photos');
  let images = [];

  function parcourirDossier(dossier) {
      const items = fs.readdirSync(dossier);

      for (const item of items) {
          const itemPath = path.join(dossier, item);
          const stat = fs.lstatSync(itemPath);

          if (stat.isDirectory()) {
              parcourirDossier(itemPath); // Exploration récursive des sous-dossiers
          } else if (/\.(jpg|jpeg|png|gif|webp)$/i.test(item) && images.length < 3) {
              images.push(itemPath.replace(__dirname, '').replace(/\\/g, '/')); // 🔥 Correction ici
          }

          if (images.length >= 3) break; // Stop si on a 3 images
      }
  }

  if (fs.existsSync(ticketFolder)) {
      parcourirDossier(ticketFolder);
  }

  if (images.length === 0) {
      return res.json({ message: 'Aucune photo présente dans le dossier' });
  }

  res.json({ images });
});



const archiver = require('archiver');

app.get('/download-photos', verifierTicketOuRedirige('/'), async (req, res) => {
  const folderPath = path.join(__dirname, 'ticket', 'scaly-photos');

  // Vérifie que le dossier existe et contient des fichiers
  if (!fs.existsSync(folderPath)) {
      return res.status(404).json({ error: 'Dossier introuvable' });
  }

  // Crée un archive ZIP en mémoire
  const archive = archiver('zip', { zlib: { level: 9 } });

  // Configure l’envoi du fichier ZIP avec un bon type MIME
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="photos.zip"');

  archive.pipe(res);

  function addFilesFromDir(dir, subfolder = '') {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
          const filePath = path.join(dir, file);
          if (fs.lstatSync(filePath).isDirectory()) {
              addFilesFromDir(filePath, path.join(subfolder, file)); // Explorer récursivement
          } else {
              archive.file(filePath, { name: path.join(subfolder, file) });
          }
      });
  }

  addFilesFromDir(folderPath);

  // Attendre la fin de l'archivage avant de finaliser la réponse
  archive.finalize().then(() => console.log("ZIP généré avec succès"));
});


app.post('/download-complete', (req, res) => {
  console.log('Un client a terminé son téléchargement.');

  // Exemple d'envoi d'un mail avec Nodemailer
  const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
  });

  const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.MAIL,
      subject: 'Un client a téléchargé ses photos',
      text: `Bonjours ${process.env.PRENOM_PRO}, votre client vient de finaliser le téléchargement de ses photos.`
  };

  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.error('Erreur lors de l\'envoi de l\'email:', error);
          return res.status(500).json({ success: false, message: "Échec de l'envoi du mail" });
      }
      console.log('Email envoyé: ' + info.response);
      res.json({ success: true, message: "Notification envoyée avec succès" });
  });
});



// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
