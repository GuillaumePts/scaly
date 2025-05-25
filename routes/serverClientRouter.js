// routes/createClientRouter.js






module.exports = function createClientRouter(baseDir) {
  const express = require("express");
  const compression = require("compression");
  const router = express.Router();
  const path = require("path");
  const fs = require("fs");
  const jwt = require("jsonwebtoken");
  const bcrypt = require("bcrypt");
  const cookieParser = require("cookie-parser");
  const { randomUUID } = require('crypto');
  const configPath = path.join(baseDir, 'config.json');
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  router.use(compression());
  router.use(express.static(baseDir));

  const User = require('../models/User');






  const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');  // Le token est envoyé dans l'en-tête "Authorization"

    if (!token) {
      return res.status(403).send({ message: 'Accès interdit. Token requis.' });
    }

    jwt.verify(token, config.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).send({ message: 'Token invalide.' });
      }
      req.user = user;
      next();
    });
  };

  router.use(express.json());

  router.use(cookieParser());
  const { v4: uuidv4 } = require('uuid');

  // Utiliser le dossier 'public' pour les fichiers statiques
  router.use(express.static(path.join(baseDir, 'public')));



  router.use(express.static('public', {
    setHeaders: (res, path) => {
      res.set("Cache-Control", "public, max-age=31536000, immutable");
    }
  }));

  router.use('/imgprofile', express.static('public/imgprofile', {
    setHeaders: (res, path) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Expires', '0');
      res.setHeader('Pragma', 'no-cache');
    }
  }));


  function getFolderSize(folderPath) {
    let totalSize = 0;

    function recurse(folder) {
      const files = fs.readdirSync(folder);

      files.forEach(file => {
        const filePath = path.join(folder, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          recurse(filePath);
        } else {
          totalSize += stat.size;
        }
      });
    }

    recurse(folderPath);
    return totalSize;
  }

  const storageLimits = {
    Starter: parseInt(config.LIMIT_STARTER),
    // Pro: parseInt(process.env.LIMIT_PRO),
    // Unlimited: Infinity,
  };



  const checkStorageLimit = (req, res, next) => {
    const limit = config.LIMIT_STARTER;

    if (!limit) {
      return res.status(500).json({ error: "Aucune limite de stockage définie" });
    }

    const maxSize = parseInt(limit);
    const folderPath = path.join(baseDir, 'public', 'portfolio', 'photo');

    try {
      const currentSize = getFolderSize(folderPath);

      if (currentSize >= maxSize) {
        return res.status(403).json({ error: "Espace de stockage plein selon votre pack" });
      }

      next();
    } catch (err) {
      console.error('Erreur lors du calcul du dossier:', err);
      res.status(500).json({ error: "Erreur serveur lors de la vérification du stockage" });
    }
  };


  // Route principale qui renvoie le fichier HTML
  router.get('/', (req, res) => {
    res.sendFile(path.join(baseDir, 'views', 'index.html'));
  });

  const loadDatabase = (req, res, next) => {
    const dbPath = path.join(baseDir, 'bdd.json'); // Assure-toi que le fichier est dans le même dossier
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

  router.get('/contactfooter', loadDatabase, (req, res) => {

    const contactMain = req.db.contact?.main || []; // Récupère les objets de "contact.main" ou un tableau vide
    res.json(contactMain);
  });

  router.get('/globale', loadDatabase, (req, res) => {

    const contactMain = req.db.global || []; // Récupère les objets de "contact.main" ou un tableau vide
    res.json(contactMain);
  });

  router.get('/getaccueil', loadDatabase, (req, res) => {

    const contactMain = req.db.accueil || []; // Récupère les objets de "contact.main" ou un tableau vide
    res.json(contactMain);
  });

  router.get('/get-imgaccueil', (req, res) => {
    const dirPath = path.join(baseDir, 'public', 'imgaccueil');

    fs.readdir(dirPath, (err, files) => {
      if (err) {
        console.error('Erreur lors de la lecture du dossier imgaccueil:', err);
        return res.status(500).json({ success: false, message: 'Erreur serveur lors de la lecture des images.' });
      }

      // Optionnel : ne garder que les fichiers (pas les dossiers) si besoin
      const fileList = files.filter(file => {
        const filePath = path.join(dirPath, file);
        return fs.statSync(filePath).isFile();
      });

      res.json({ success: true, files: fileList });
    });
  });



  function getImagePaths() {
    const imagesDir = path.join(baseDir, 'public/imgMob');
    return fs.readdirSync(imagesDir)
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map(file => `/imgMob/${file}`);
  }


  router.get('/api/images', (req, res) => {
    const images = getImagePaths();
    res.json(images);

  });

  // Routes pour les différents contenus de la page
  router.get('/content/contact', (req, res) => {
    res.sendFile(path.join(baseDir, 'views/contact.html'));
  });

  router.get('/content/accueil', (req, res) => {
    res.sendFile(path.join(baseDir, 'views/accueil.html'));
  });

  router.get('/content/portfolio', (req, res) => {
    res.sendFile(path.join(baseDir, 'views/portfolio.html'));
  });

  router.get('/ifvideo', (req, res) => {
    const filePath = path.join(baseDir, 'public', 'portfolio', 'video', 'videos.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Erreur lors de la lecture du fichier JSON :', err);
        return res.status(500).json({ message: 'Erreur serveur lors de la lecture du fichier JSON.' });
      }

      try {
        const jsonData = JSON.parse(data);
        res.json(jsonData);
      } catch (parseErr) {
        console.error('Erreur lors de l\'analyse du JSON :', parseErr);
        res.status(500).json({ message: 'Erreur serveur lors de l\'analyse du fichier JSON.' });
      }
    });
  });

  router.get('/content/lock', (req, res) => {
    res.sendFile(path.join(baseDir, 'views/lock.html'));
  });

  router.get('/portfolio', (req, res) => {
    const directoryPath = path.join(baseDir, 'public/portfolio');

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

  router.get('/portfolio/dossierimg/:el', (req, res) => {

    const img = req.params.el
    const directoryPath = path.join(baseDir, `public/portfolio/${img}`);

    fs.readdir(directoryPath, (err, files) => {
      console.log(files);
      if (err) {
        console.log('ça va pas');
      } else if (files.length === 0) {
        res.json({ src: "noimg" })
      } else {
        let chemin = `portfolio/${img}/${files[0]}`
        res.json({ src: chemin })
      }

    });

  })

  router.get('/portfolio/img/:el', (req, res) => {

    const img = req.params.el
    const directoryPath = path.join(baseDir, `public/portfolio/${img}`);

    fs.readdir(directoryPath, (err, files) => {

      if (err) {
        console.log('ça va pas');
      } else if (files === 0) {
        console.log("y'a rien");
      } else {

        res.json(files)
      }

    });

  })



  // CONTACT////////////////////////////////////////
  const nodemailer = require('nodemailer');
  router.post('/contact-message', (req, res) => {
    const { nom, email, message } = req.body;

    // Vérification des données
    if (!nom || !email || !message) {
      return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    // Configuration de Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.GMAIL_USER,
        pass: config.GMAIL_PASS
      }
    });

    // Mail de confirmation pour l'utilisateur
    const mailToUser = {
      from: `"Scaly" <${config.GMAIL_USER}>`,
      to: email,
      subject: 'Confirmation de votre message',
      text: `Bonjour ${nom},\n\n votre message a bien été envoyé à ${config.PRENOM_PRO} ${config.NOM_PRO}.\n\nCordialement,\nScaly.`
    };

    // Mail pour le propriétaire du site
    const mailToOwner = {
      from: `"Scaly" <${config.GMAIL_USER}>`,
      to: config.MAIL,
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

  const password = config.PASS_WORD;
  const id = config.ID;
  const multer = require('multer');
  const storage = multer.memoryStorage();
  const upload = multer({ storage: storage });
  const sharp = require('sharp');



  function verifierTokenClient(req, res, next) {
    console.log('Cookies reçus →', req.cookies); // 👈 ajoute ça
    console.log("SECRET utilisé pour décoder :", config.JWT_SECRET_CLIENT);
    const token = req.cookies.token;
    if (!token) {
      console.warn('Aucun token client trouvé');
      return res.status(403).send('Accès refusé');
    }
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET_CLIENT);
      if (decoded.role !== 'client') throw new Error('Role invalide');
      req.user = decoded;
      next();
    } catch (err) {
      console.warn('Token client invalide');
      return res.status(403).send('Token invalide ou expiré');
    }
  }



  router.get('/views/ticket.html', verifierTokenClient, (req, res) => {
    res.sendFile(path.join(baseDir, '/views/ticket.html'));
  });




  const crypto = require('crypto'); // Pour générer une clé sécurisée


  let tickets = {};
  const ticketPath = path.join(baseDir, 'ticket', 'ticket.json');
  try {
    if (fs.existsSync(ticketPath)) {
      tickets = JSON.parse(fs.readFileSync(ticketPath, 'utf-8'));
    }
  } catch (err) {
    console.warn('⚠️ Impossible de charger ticket.json, vérifiez le fichier.');
  }

  // Route POST pour gérer la connexion avec ticket ou admin



  router.post('/connexion', async (req, res) => {
    const { id, pass } = req.body;

    if (!id || !pass) {
      return res.status(400).send({ message: 'Requête incomplète' });
    }

    const currentSiteId = config.ID_PICS;

    try {
      // Vérifie d'abord si c’est un propriétaire (admin)
      const admin = await User.findOne({ email: id });

      if (admin && admin.siteId === currentSiteId) {
        const validPassword = await bcrypt.compare(pass, admin.password);
        if (validPassword) {
          const token = jwt.sign({ role: 'admin', id }, config.JWT_SECRET, {
            expiresIn: '1h'
          });

          res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 3600000
          });

          return fs.readFile(path.join(baseDir, '/backoffice.html'), 'utf8', (err, html) => {
            if (err) return res.status(500).send({ message: 'Erreur serveur' });
            res.status(200).send({
              html,
              message: 'Connexion réussie',
              session: 'admin',
              pack: config.PACK,
              paiementaccept: config.ALLOW_PAYMENT
            });
          });
        }
      }

      // Sinon → on vérifie si c’est un client avec un ticket
      const ticketsPath = path.join(baseDir, 'ticket', 'ticket.json');
      if (!fs.existsSync(ticketsPath)) {
        return res.status(401).send({ message: 'Identifiants invalides' });
      }

      const data = fs.readFileSync(ticketsPath, 'utf8');
      const tickets = JSON.parse(data);
      const ticket = tickets.ticket;

      if (ticket && ticket.idl === id && ticket.key === pass) {
        const token = jwt.sign({ role: 'client', ticketId: ticket.id }, config.JWT_SECRET_CLIENT, {
          expiresIn: '1h'
        });

        res.cookie('token', token, {
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
          maxAge: 3600000
        });

        // Vérification paiement si applicable
        const prix = parseFloat(ticket.price || 0);
        const paiementFait = ticket.paiementcheck === true;
        console.log({
          prix,
          paiementFait,
          PACK: config.PACK,
          ALLOW_PAYMENT: config.ALLOW_PAYMENT,
          STRIPE_ACCOUNT_ID: config.STRIPE_ACCOUNT_ID,
          STRIPE_STATUS: config.STRIPE_STATUS
        });

        if (
          prix > 0 &&
          !paiementFait &&
          (config.PACK === 'Pro' || config.PACK === 'Unlimited') &&
          config.ALLOW_PAYMENT === true &&
          config.STRIPE_ACCOUNT_ID &&
          config.STRIPE_STATUS === 'active'
        ) {
          // Redirection Stripe à effectuer côté front
          return res.status(200).send({
            session: 'client',
            action: true,
            message: 'Paiement requis',
          });
        }

        // Si pas de paiement requis ou déjà payé
        return fs.readFile(path.join(baseDir, '/views/ticket.html'), 'utf8', (err, html) => {
          if (err) return res.status(500).send({ message: 'Erreur serveur' });
          res.status(200).send({ html, message: 'Connexion réussie', session: 'client' });
        });
      }

      // Aucun match
      return res.status(401).send({ message: 'Identifiants invalides' });

    } catch (err) {
      console.error('Erreur lors de la connexion :', err);
      return res.status(500).send({ message: 'Erreur serveur' });
    }
  });

  const verifyClientToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).send({ message: 'Non autorisé' });

    try {
      const decoded = jwt.verify(token, config.JWT_SECRET_CLIENT);
      if (decoded.role !== 'client') throw new Error();
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(403).send({ message: 'Token invalide' });
    }
  };


  router.post('/create-checkout-session-cc', verifyClientToken, async (req, res) => {
    const domain = req.headers.origin;
    const clientId = config.ID_PICS;
    try {
      const ticketPath = path.join(baseDir, 'ticket', 'ticket.json');
      if (!fs.existsSync(ticketPath)) {
        return res.status(404).send({ error: 'Ticket introuvable' });
      }

      const data = fs.readFileSync(ticketPath, 'utf8');
      const ticket = JSON.parse(data).ticket;

      if (!ticket || !ticket.price || !ticket.idl) {
        return res.status(400).send({ error: 'Ticket invalide ou incomplet' });
      }

      // Vérifie qu'on a bien l'ID Stripe du compte connecté
      const stripeAccountId = config.STRIPE_ACCOUNT_ID;
      if (!stripeAccountId) {
        return res.status(400).send({ error: 'Aucun compte Stripe connecté' });
      }

      let unitAmount = Math.round(parseFloat(ticket.price) * 100); // prix client
      let applicationFee = 0;

      // Appliquer une commission de 5% si le pack est "Pro"
      if (config.PACK === 'Pro') {
        applicationFee = Math.round(unitAmount * config.COMMISSION / 100);
      }

      // Crée la session de paiement pour le compte connecté
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `Accès à vos photos`,
                description: `Téléchargement des photos pour le ticket ${ticket.id}`,
              },
              unit_amount: unitAmount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',


        success_url: `${domain}/api/ctoc-success?client=${clientId}&ticket=${ticket.id}`,
        cancel_url: `${domain}/views/paiement-annule.html`,


        metadata: {
          ticketId: ticket.id,
          clientEmail: ticket.email || 'inconnu'
        },
        payment_intent_data: {
          application_fee_amount: applicationFee
        }
      }, {
        stripeAccount: stripeAccountId
      });

      res.json({ url: session.url });

    } catch (error) {
      console.error("Erreur Stripe session:", error);
      res.status(500).send({ error: 'Impossible de créer la session de paiement' });
    }
  });

  router.post('/update-ticket-paiement', (req, res) => {
    const clientId = req.query.client;
    const ticketId = req.query.ticket;

    const ticketPath = path.join(baseDir, 'clients', clientId, 'ticket', 'ticket.json');


    if (!clientName || !ticketId) {
      return res.status(400).send({ error: 'Paramètres manquants' });
    }


    try {
      if (!fs.existsSync(ticketPath)) {
        return res.status(404).send({ error: 'Fichier ticket introuvable' });
      }

      const data = JSON.parse(fs.readFileSync(ticketPath, 'utf8'));

      if (data.ticket?.idl !== ticketId) {
        return res.status(400).send({ error: 'Ticket non reconnu' });
      }

      data.ticket.paiementcheck = false;

      fs.writeFileSync(ticketPath, JSON.stringify(data, null, 2), 'utf8');

      res.status(200).send({ message: 'Mise à jour réussie' });
    } catch (err) {
      console.error('Erreur mise à jour ticket:', err);
      res.status(500).send({ error: 'Erreur serveur' });
    }
  });

  router.get('/ctoc-success', async (req, res) => {
    const clientId = req.query.client;
    const ticketId = req.query.ticket;

    if (!clientId || !ticketId) {
      return res.status(400).send('Requête invalide');
    }

    const ticketPath = path.join(baseDir, 'clients', clientId, 'ticket', 'ticket.json');

    try {
      if (!fs.existsSync(ticketPath)) {
        return res.status(404).send('Fichier ticket introuvable');
      }

      const data = fs.readFileSync(ticketPath, 'utf8');
      const json = JSON.parse(data);

      if (json.ticket && json.ticket.id === ticketId) {
        json.ticket.paiementcheck = false;
        fs.writeFileSync(ticketPath, JSON.stringify(json, null, 2), 'utf8');
      }

      // Redirection vers la page de confirmation
      res.redirect(`/views/paiement-reussi.html`);
    } catch (err) {
      console.error('Erreur mise à jour ticket:', err);
      res.status(500).send('Erreur serveur');
    }
  });

  // router.get("/ctoc-success", (req, res) => {

  //     res.sendFile(path.join(baseDir, 'views', 'payment-success.html'));
  // });

  // router.get("/ctoc-echec", (req, res) => {

  //     res.sendFile(path.join(baseDir, 'views', 'payment-cancel.html'));
  // });
  // Route de test : vérifier les capacités du compte connecté Stripe
  // router.get('/capabilities', async (req, res) => {
  //   try {
  //     // Chemin vers le config.json de TON CLIENT
  //     const clientConfigPath = path.join(baseDir, 'config.json');
  //     const configData = JSON.parse(fs.readFileSync(clientConfigPath, 'utf8'));

  //     const stripeAccountId = configData.STRIPE_ACCOUNT_ID;

  //     if (!stripeAccountId) {
  //       return res.status(400).json({ error: 'Aucun STRIPE_ACCOUNT_ID trouvé dans le config.json' });
  //     }

  //     const connectedAccount = await stripe.accounts.retrieve(stripeAccountId);

  //     res.json({
  //       id: connectedAccount.id,
  //       email: connectedAccount.email,
  //       capabilities: connectedAccount.capabilities,
  //       details_submitted: connectedAccount.details_submitted,
  //       charges_enabled: connectedAccount.charges_enabled,
  //       payouts_enabled: connectedAccount.payouts_enabled
  //     });
  //   } catch (err) {
  //     console.error('Erreur récupération compte Stripe connecté:', err);
  //     res.status(500).json({ error: 'Erreur Stripe', message: err.message });
  //   }
  // });






  router.get('/logout', (req, res) => {
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    });
    return res.redirect('/');
  });



  function verifierSessionOuRediriger(redirection = '/') {
    return (req, res, next) => {
      const token = req.cookies.token;

      if (!token) {
        console.warn('Aucun token trouvé');
        return res.redirect(redirection);
      }

      jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
        if (err) {
          console.warn('Token invalide ou expiré');
          return res.redirect(redirection);
        }

        req.user = decoded; // Injecte les infos du token dans la requête
        next();
      });
    };
  }


  router.post('/update-locked', verifierSessionOuRediriger('/'), (req, res) => {
    const { locked } = req.body;

    const filePath = path.join(baseDir, 'public', 'portfolio', 'desc.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Erreur de lecture du fichier JSON:', err);
        return res.status(500).json({ message: 'Erreur serveur.' });
      }

      let json;
      try {
        json = JSON.parse(data);
      } catch (parseErr) {
        return res.status(400).json({ message: 'Fichier JSON invalide.' });
      }

      json.locked = !!locked; // force un booléen

      fs.writeFile(filePath, JSON.stringify(json, null, 2), 'utf8', (writeErr) => {
        if (writeErr) {
          console.error('Erreur d\'écriture dans le fichier JSON:', writeErr);
          return res.status(500).json({ message: 'Erreur lors de l\'enregistrement.' });
        }

        res.json({ message: 'Champ "locked" mis à jour avec succès.' });
      });
    });
  });


  router.get('/storage-usage', verifierSessionOuRediriger('/'), (req, res) => {
    const folderPath = path.join(baseDir, 'public', 'portfolio', 'photo');
    const used = getFolderSize(folderPath); // fonction vue plus haut

    const limit = parseInt(config.LIMIT_STARTER); // en octets

    const percent = Math.min((used / limit) * 100, 100);

    res.json({
      used,
      limit,
      percent
    });
  });




  router.put('/edit-signature', verifierSessionOuRediriger('/'), (req, res) => {
    const { newS } = req.body;
    const dbPath = path.join(baseDir, 'bdd.json');

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

  router.put('/edit-h1', verifierSessionOuRediriger('/'), (req, res) => {
    const { newS } = req.body;
    const dbPath = path.join(baseDir, 'bdd.json');

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



  router.get('/admin', verifierSessionOuRediriger('/'), (req, res) => {
    const filePath = path.join(baseDir, '/backoffice.html');

    // Lire le contenu du fichier
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.log(err);
        res.status(200).send({
          obj: 'accès non autorisé',
        });

      } else {

        res.status(200).send({
          html: data,
        });

      }
    });
  });

  // ::::::::::::::::::::::::::::
  // gestion carrou::::::::::::::
  // ::::::::::::::::::::::::::::

  // Route pour récupérer les images en fonction du dossier
  router.get('/imagecarrou', verifierSessionOuRediriger('/'), (req, res) => {
    const folder = req.query.folder;

    // Validation des entrées
    if (!folder || (folder !== 'imgMob' && folder !== 'imgPc')) {
      return res.status(400).json({ message: 'Dossier invalide.', erreur: true });
    }

    // Construire le chemin du dossier
    const directoryPath = path.join(baseDir, 'public', folder);

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



  router.post('/delete-image-carrou', verifierSessionOuRediriger('/'), (req, res) => {
    const { imagePath } = req.body;

    if (!imagePath || typeof imagePath !== 'string') {
      return res.status(400).json({ message: "Chemin d'image invalide." });
    }

    // Extraire uniquement le nom du fichier sans le dossier
    const match = imagePath.match(/\/?imgMob\/(.+)$/);
    if (!match) {
      return res.status(400).json({ message: "Format de chemin d'image invalide." });
    }

    const filename = match[1]; // Nom du fichier uniquement

    // Construire le chemin absolu du fichier
    const fullPath = path.join(baseDir, 'public', 'imgMob', filename);

    // Vérifier si le fichier existe avant de tenter de le supprimer
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: "Fichier introuvable." });
    }

    try {
      fs.unlinkSync(fullPath);
      return res.json({
        message: "Image supprimée avec succès.",
        deletedFile: `/imgMob/${filename}`
      });
    } catch (error) {
      console.error("Erreur lors de la suppression du fichier :", error);
      return res.status(500).json({ message: "Erreur serveur lors de la suppression du fichier." });
    }
  });


  // Route pour supprimer une image
  router.post('/delete-image', verifierSessionOuRediriger('/'), (req, res) => {
    const { imagePaths } = req.body;

    if (!imagePaths || !Array.isArray(imagePaths) || imagePaths.length === 0) {
      return res.status(400).json({ message: 'Aucun chemin d\'image fourni ou format invalide.' });
    }

    let deletedImages = [];
    let errors = [];
    let folder = null;
    let subfolder = null;

    imagePaths.forEach((imageUrl) => {
      // Extraire le chemin à partir de "/portfolio"
      const match = imageUrl.match(/\/portfolio\/photo\/([^\/]+)\/([^\/]+)\/.*/);
      if (!match) {
        errors.push({ image: imageUrl, error: 'Chemin invalide.' });
        return;
      }

      folder = match[1];       // Premier dossier après "/portfolio"
      subfolder = match[2];    // Deuxième dossier après "/portfolio"
      const relativePath = match[0];
      const fullPath = path.join(baseDir, 'public', relativePath);

      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
          deletedImages.push(relativePath);
        } catch (error) {
          errors.push({ image: relativePath, error: 'Erreur lors de la suppression.' });
        }
      } else {
        errors.push({ image: relativePath, error: 'Fichier introuvable.' });
      }
    });

    if (errors.length > 0) {
      return res.status(207).json({
        message: 'Suppression partielle terminée.',
        deleted: deletedImages,
        errors,
        folder,
        subfolder
      });
    }

    res.json({
      message: 'Toutes les images ont été supprimées avec succès.',
      deleted: deletedImages,
      folder,
      subfolder
    });
  });



  // Configurer Multer pour stocker les fichiers en mémoire


  router.post('/download-image-carrou', verifierSessionOuRediriger('/'), upload.single('image'), (req, res) => {
    const { description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier reçu.', erreur: true });
    }

    let folderPath = '';
    if (description === 'mobile') {
      folderPath = path.join(baseDir, 'public/imgMob');
    } else if (description === 'pc') {
      folderPath = path.join(baseDir, 'public/imgPc');
    } else {
      return res.status(400).json({ message: 'Description invalide.', erreur: true });
    }

    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Nom du fichier compressé
    const uniqueFileName = Date.now() + '-' + Math.floor(Math.random() * 1000) + '.webp';
    const filePath = path.join(folderPath, uniqueFileName);

    // Compression et redimensionnement
    sharp(req.file.buffer)
      .rotate()
      .resize({
        width: 4048,
        height: 4048,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 90 })
      .toFile(filePath, (err) => {
        if (err) {
          console.error('Erreur lors de la compression de l\'image :', err);
          return res.status(500).json({ message: 'Erreur serveur lors de la compression de l\'image.', erreur: true });
        }

        res.json({
          message: 'Image téléchargée et compressée avec succès.',
          fileName: uniqueFileName,
          folder: folderPath,
          erreur: false
        });
      });
  });


  ////////////////////////////////////////////////
  // //////////////GESTION DU TEXT DE PRESENTATION
  ////////////////////////////////////////////////


  router.get('/envoi-text-profile', (req, res) => {
    const filePath = path.join(baseDir, 'bdd.json');

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



  router.post('/edit-text-profil', verifierSessionOuRediriger('/'), (req, res) => {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Aucun texte fourni.', erreur: true });
    }

    const filePath = path.join(baseDir, 'bdd.json');

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
        return res.status(500).json({ message: 'Erreur serveur.', erreur: true });
      }
    });
  });


  ////////////////////////////////////
  //////////GESTION SERVICES/////////
  //////////////////////////////////

  router.get('/envoi-services', (req, res) => {
    const filePath = path.join(baseDir, 'bdd.json');

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


  router.post('/update-service', verifierSessionOuRediriger('/'), (req, res, next) => {
    // Config dédiée à cette route
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        const uploadDir = path.join(baseDir, 'public/services-img');
        fs.mkdirSync(uploadDir, { recursive: true }); // on s’assure que le dossier existe
        cb(null, uploadDir);
      },
      filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
      }
    });

    const upload = multer({ storage }).single('img');

    // On applique multer localement ici
    upload(req, res, function (err) {
      if (err) {
        return res.status(500).json({ success: false, message: "Erreur lors de l'upload de l'image." });
      }

      const { id, nom, prix, des } = req.body;
      const imgFile = req.file;

      console.log("BODY REÇU :", req.body);
      console.log("FICHIER IMG REÇU :", imgFile);

      const DATA_PATH = path.join(baseDir, '/bdd.json');

      if (!id || !nom || !prix || !des) {
        return res.status(400).json({ success: false, message: "Champs requis manquants." });
      }

      fs.readFile(DATA_PATH, 'utf-8', (err, data) => {
        if (err) return res.status(500).json({ success: false, message: "Erreur lecture JSON." });

        let json;
        try {
          json = JSON.parse(data);
        } catch (e) {
          return res.status(500).json({ success: false, message: "Erreur parsing JSON." });
        }

        const index = json.accueil.prestations.findIndex(p => p.id === id);
        if (index === -1) return res.status(404).json({ success: false, message: "Service non trouvé." });

        json.accueil.prestations[index].nom = nom;
        json.accueil.prestations[index].prix = prix;
        json.accueil.prestations[index].des = des;

        if (imgFile) {
          const newPublicPath = `/services-img/${imgFile.filename}`;

          // Supprimer ancienne image si elle existe
          const oldImg = json.accueil.prestations[index].img;
          if (oldImg) {
            const oldImgPath = path.join(baseDir, 'public', oldImg);
            fs.unlink(oldImgPath, (err) => {
              if (err && err.code !== 'ENOENT') {
                console.warn("Erreur suppression ancienne image :", err.message);
              }
            });
          }

          json.accueil.prestations[index].img = newPublicPath;
        }

        fs.writeFile(DATA_PATH, JSON.stringify(json, null, 2), (err) => {
          if (err) return res.status(500).json({ success: false, message: "Erreur écriture JSON." });
          return res.json({ success: true });
        });
      });
    });
  });



  router.delete('/delete-service', verifierSessionOuRediriger('/'), (req, res) => {
    const idASupprimer = req.body.id;
    const filePath = path.join(baseDir, 'bdd.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) return res.json({ success: false, message: "Erreur de lecture" });

      let jsonData;
      try {
        jsonData = JSON.parse(data);
      } catch (parseErr) {
        console.log("JSON invalide");
        return res.json({ success: false, message: "JSON invalide" });
      }

      const index = jsonData.accueil.prestations.findIndex(presta => presta.id === idASupprimer);
      if (index === -1) {
        console.log("Service introuvable");
        return res.json({ success: false, message: "Service introuvable" });
      }

      const imagePath = path.join(baseDir, 'public', jsonData.accueil.prestations[index].img);

      // Supprimer l'image
      fs.unlink(imagePath, (unlinkErr) => {
        if (unlinkErr && unlinkErr.code !== 'ENOENT') {
          return res.json({ success: false, message: "Erreur suppression image" });
        }

        // Supprimer l'objet de la liste
        jsonData.accueil.prestations.splice(index, 1);

        // Réécrire le fichier JSON
        fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (writeErr) => {
          if (writeErr) return res.json({ success: false, message: "Erreur d’écriture JSON" });

          res.json({ success: true });
        });
      });
    });
  });



  const uploadservice = multer({
    storage: storage,
    limits: { fileSize: 20000 * 1024 * 1024 } // Limiter à 10 Mo par exemple
  }).single('img');

  router.post('/add-prestation', verifierSessionOuRediriger('/'), uploadservice, async (req, res) => {
    const { titre, prix, desc } = req.body;
    const file = req.file;

    if (!titre || !prix || !desc || !file) {
      return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });
    }

    try {
      // Générer un ID unique pour la prestation
      const id = uuidv4();

      // Générer un nom de fichier unique pour l'image (avec l'UUID pour éviter les collisions)
      const fileName = `${id}.webp`;
      const filePath = path.join(baseDir, 'public', 'services-img', fileName);

      // Traitement de l'image avec Sharp (rotation, compression, redimensionnement)
      await sharp(file.buffer)
        .rotate()
        .webp({ quality: 80 })
        .resize(1500)
        .toFile(filePath);

      const jsonPath = path.join(baseDir, 'bdd.json');
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

      // Ajouter la nouvelle prestation avec un ID unique et le chemin de l'image
      data.accueil.prestations.push({
        id: id,  // Ajouter l'ID unique
        nom: titre,
        prix: prix,
        des: desc,
        img: `/services-img/${fileName}`
      });

      // Écrire la mise à jour dans le fichier JSON
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf-8');

      // Répondre avec succès
      res.status(200).json({ message: 'Prestation ajoutée avec succès !' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de l\'ajout de la prestation.' });
    }
  });










  // /////////////////////////////////////////////
  ////////////GESTION DOSSIER/////////////////////
  ////////////////////////////////////////////////


  router.get('/backcontent/photo', (req, res) => {
    res.sendFile(path.join(baseDir, 'views-back/photo.html'));
  });

  router.get('/backcontent/video', (req, res) => {
    res.sendFile(path.join(baseDir, 'views-back/video.html'));
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
          const relativePath = path.relative(path.join(baseDir, 'public'), itemPath);
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
  // app.get('/getcontenuphoto',  async (req, res) => {
  //   try {
  //       const folderPath = path.join(baseDir, 'public', 'portfolio', 'photo');
  //       const folderContent = await getFolderContent(folderPath);
  //       res.json(folderContent); // Renvoie le contenu structuré au front-end
  //   } catch (error) {
  //       console.error('Erreur lors de la récupération du contenu :', error);
  //       res.status(500).send('Erreur lors de la récupération du contenu');
  //   }
  // });

  router.get('/getcontenuphoto', async (req, res) => {
    try {
      const folderPath = path.join(baseDir, 'public', 'portfolio', 'photo');
      const descPath = path.join(baseDir, 'public', 'portfolio', 'desc.json');

      // On lit d'abord le contenu des dossiers
      const folderContent = await getFolderContent(folderPath);

      // Puis on lit le fichier desc.json avec callback
      fs.readFile(descPath, 'utf-8', (err, descRaw) => {
        if (err) {
          console.error('Erreur lors de la lecture de desc.json :', err);
          return res.status(500).send('Erreur lors de la lecture du fichier de descriptions');
        }

        let desc;
        try {
          desc = JSON.parse(descRaw);
        } catch (parseErr) {
          console.error('Erreur lors du parsing de desc.json :', parseErr);
          return res.status(500).send('Fichier de descriptions invalide');
        }

        // Envoi final
        res.json({
          folder: folderContent,
          desc
        });
      });

    } catch (error) {
      console.error('Erreur lors de la récupération du contenu :', error);
      res.status(500).send('Erreur lors de la récupération du contenu');
    }
  });





  router.post('/creat-image-portfolio', verifierSessionOuRediriger('/'), checkStorageLimit, upload.array('photos', 1000), (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Aucun fichier n\'a été téléchargé.' });
    }

    const sanitizeFolderName = (name) => name.trim().replace(/\s+/g, '_');

    const dossier = req.body.dossier ? sanitizeFolderName(req.body.dossier) : null;
    const sub = req.body.sub ? sanitizeFolderName(req.body.sub) : '';

    if (!dossier) {
      return res.status(400).json({ error: 'Le dossier principal est manquant.' });
    }

    const uploadPath = path.join(baseDir, 'public', 'portfolio', 'photo', dossier, sub);

    fs.mkdirSync(uploadPath, { recursive: true });

    if (!sub) {
      const filesInMainFolder = fs.readdirSync(uploadPath).filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));
      if (filesInMainFolder.length > 0) {
        fs.unlinkSync(path.join(uploadPath, filesInMainFolder[0]));
      }
    }

    const isMainUpload = !sub;

    const resizeOptions = isMainUpload
      ? { width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true } // 6K
      : { width: 1500, height: 1500, fit: 'inside', withoutEnlargement: true }; // standard

    const quality = isMainUpload ? 90 : 80;

    const promises = req.files.map(file => {
      const uniqueFileName = Date.now() + '-' + Math.floor(Math.random() * 1000) + '.webp';
      const filePath = path.join(uploadPath, uniqueFileName);

      return new Promise((resolve, reject) => {
        sharp(file.buffer)
          .rotate()
          .resize(resizeOptions)
          .webp({ quality })
          .toFile(filePath, (err) => {
            if (err) return reject(err);
            resolve(filePath);
          });
      });
    });

    Promise.all(promises)
      .then((filePaths) => {
        res.json({
          message: 'Images téléchargées et optimisées avec succès',
          files: filePaths,
          folder: dossier,
          subFolder: sub
        });
      })
      .catch((err) => {
        res.status(500).json({ error: 'Erreur lors de l\'enregistrement des fichiers', details: err });
      });
  });




  router.delete('/delete-img-portfolio', verifierSessionOuRediriger('/'), (req, res) => {
    const { src } = req.body;

    if (!src) {
      return res.status(400).json({ error: 'Chemin du fichier non fourni.' });
    }

    // Résolution du chemin absolu
    const filePath = path.join(baseDir, 'public', src.replace(/^\/+/, '')); // Suppression éventuelle des "/"

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
  router.post('/add-sub-folder', verifierSessionOuRediriger('/'), (req, res) => {
    let { folder, subFolder } = req.body;

    if (!folder || !subFolder) {
      return res.status(400).json({ success: false, message: 'Dossier parent ou sous-dossier manquant.' });
    }

    // Nettoyage des noms de dossier
    folder = folder.trim().replace(/\s+/g, '_');
    subFolder = subFolder.trim().replace(/\s+/g, '_');

    const basePath = path.join(baseDir, 'public', 'portfolio', 'photo');
    const parentFolderPath = path.join(basePath, folder);
    const subFolderPath = path.join(parentFolderPath, subFolder);

    // Vérifier si le dossier parent existe
    if (!fs.existsSync(parentFolderPath)) {
      return res.status(400).json({ success: false, message: `Le dossier parent ${folder} n'existe pas.` });
    }

    // Vérifier si le sous-dossier existe déjà
    if (fs.existsSync(subFolderPath)) {
      return res.status(400).json({ success: false, message: `Le sous-dossier ${subFolder} existe déjà dans ${folder}.` });
    }

    // Créer le sous-dossier
    try {
      fs.mkdirSync(subFolderPath);
      return res.json({ success: true, message: `Sous-dossier ${subFolder} créé avec succès dans ${folder}.`, dossier: folder, sousdossier: subFolder });
    } catch (error) {
      console.error('Erreur lors de la création du sous-dossier:', error);
      return res.status(500).json({ success: false, message: 'Erreur lors de la création du sous-dossier.' });
    }
  });




  // DELETE SUB FOLDER ////////////////////////////////

  router.delete('/remove-sub-folder', verifierSessionOuRediriger('/'), (req, res) => {
    let { folder, subFolder } = req.body;

    if (!folder || !subFolder) {
      return res.status(400).json({ success: false, message: 'Dossier parent ou sous-dossier manquant pour suppression.' });
    }

    // Nettoyage des noms de dossiers
    folder = folder.trim().replace(/\s+/g, '_');
    subFolder = subFolder.trim().replace(/\s+/g, '_');

    const basePath = path.join(baseDir, 'public', 'portfolio', 'photo');
    const subFolderPath = path.join(basePath, folder, subFolder);

    // Vérifier si le sous-dossier existe
    if (!fs.existsSync(subFolderPath)) {
      return res.status(400).json({ success: false, message: `Le sous-dossier ${subFolder} n'existe pas dans ${folder}.` });
    }

    // Supprimer le sous-dossier
    try {
      fs.rmSync(subFolderPath, { recursive: true, force: true });
      return res.json({ success: true, message: `Sous-dossier ${subFolder} supprimé avec succès de ${folder}.`, dossier: folder });
    } catch (error) {
      console.error('Erreur lors de la suppression du sous-dossier:', error);
      return res.status(500).json({ success: false, message: 'Erreur lors de la suppression du sous-dossier.' });
    }
  });



  // //// PUT SUBFOLDER///////////////////////////////////////

  router.put('/edit-sub-folder', verifierSessionOuRediriger('/'), (req, res) => {
    let { folder, oldSubFolder, newSubFolder } = req.body;

    if (!folder || !oldSubFolder || !newSubFolder) {
      return res.status(400).json({ success: false, message: 'Données manquantes pour renommer le sous-dossier.' });
    }

    // Nettoyage des noms de dossiers
    folder = folder.trim().replace(/\s+/g, '_');
    oldSubFolder = oldSubFolder.trim().replace(/\s+/g, '_');
    newSubFolder = newSubFolder.trim().replace(/\s+/g, '_');

    const basePath = path.join(baseDir, 'public', 'portfolio', 'photo');
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
      return res.json({ success: true, message: `Sous-dossier ${oldSubFolder} renommé en ${newSubFolder} avec succès.`, dossier: folder });
    } catch (error) {
      console.error('Erreur lors du renommage du sous-dossier:', error);
      return res.status(500).json({ success: false, message: 'Erreur lors du renommage du sous-dossier.' });
    }
  });


  //////////////////////////////////////////////////////////////////////////
  ///////////FOLDER PRINCIPAL///////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////


  router.post('/add-folder', verifierSessionOuRediriger('/'), (req, res) => {
    let { folderName } = req.body;

    if (!folderName) {
      return res.status(400).json({ success: false, message: 'Nom du dossier requis.' });
    }

    folderName = folderName.trim().replace(/\s+/g, '_');

    const basePath = path.join(baseDir, 'public', 'portfolio', 'photo');
    const folderPath = path.join(basePath, folderName);
    const descJsonPath = path.join(baseDir, 'public', 'portfolio', 'desc.json');

    if (fs.existsSync(folderPath)) {
      return res.status(400).json({ success: false, message: 'Ce dossier existe déjà.' });
    }

    try {
      // Créer le dossier de manière synchrone
      fs.mkdirSync(folderPath, { recursive: true });

      // Charger ou créer desc.json
      let descData = { desc: {} };

      if (fs.existsSync(descJsonPath)) {
        try {
          descData = JSON.parse(fs.readFileSync(descJsonPath, 'utf-8'));
        } catch (parseError) {
          console.error('Erreur de parsing de desc.json, création d\'un nouveau fichier.');
          descData = { desc: {} };
        }
      }

      if (!descData.desc) descData.desc = {};

      // Ajouter seulement si pas déjà présent
      if (!Object.prototype.hasOwnProperty.call(descData.desc, folderName)) {
        descData.desc[folderName] = "";
      }

      fs.writeFileSync(descJsonPath, JSON.stringify(descData, null, 2), 'utf-8');

      res.status(200).json({ success: true, message: `Dossier ${folderName} créé avec succès.` });

    } catch (error) {
      console.error('Erreur lors de la création du dossier ou de la mise à jour de desc.json:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur lors de la création du dossier ou de la description.' });
    }
  });


  router.post('/update-desc', verifierSessionOuRediriger('/'), (req, res) => {
    const { folder, description } = req.body;

    if (!folder || typeof description !== 'string') {
      return res.status(400).json({ success: false, message: 'Données invalides.' });
    }

    const basePath = path.join(baseDir, 'public', 'portfolio', 'photo');
    const descJsonPath = path.join(baseDir, 'public', 'portfolio', 'desc.json');

    try {
      if (!fs.existsSync(descJsonPath)) {
        return res.status(404).json({ success: false, message: 'Fichier desc.json introuvable.' });
      }

      let descData = JSON.parse(fs.readFileSync(descJsonPath, 'utf-8'));

      if (!descData.desc || !Object.prototype.hasOwnProperty.call(descData.desc, folder)) {
        return res.status(404).json({ success: false, message: 'Dossier non trouvé dans desc.json.' });
      }

      descData.desc[folder] = description;

      fs.writeFileSync(descJsonPath, JSON.stringify(descData, null, 2), 'utf-8');

      res.status(200).json({ success: true, message: 'Description mise à jour.' });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la description :', error);
      res.status(500).json({ success: false, message: 'Erreur serveur lors de la mise à jour.' });
    }
  });



  router.delete('/delete-dossierphoto-folder', verifierSessionOuRediriger('/'), (req, res) => {
    const { name } = req.body;
    const folderPath = path.join(baseDir, 'public', 'portfolio', 'photo', name);
    const descJsonPath = path.join(baseDir, 'public', 'portfolio', 'desc.json');

    if (!fs.existsSync(folderPath)) {
      return res.status(404).json({ error: 'Dossier introuvable' });
    }

    try {
      // 1. Suppression du dossier
      fs.rmSync(folderPath, { recursive: true, force: true });

      // 2. Suppression de l'entrée correspondante dans desc.json
      if (fs.existsSync(descJsonPath)) {
        const descData = JSON.parse(fs.readFileSync(descJsonPath, 'utf-8'));

        if (descData.desc && Object.prototype.hasOwnProperty.call(descData.desc, name)) {
          delete descData.desc[name];

          fs.writeFileSync(descJsonPath, JSON.stringify(descData, null, 2), 'utf-8');
        }
      }

      res.json({ message: 'Dossier et description supprimes avec succes' });

    } catch (err) {
      console.error('Erreur lors de la suppression du dossier ou de la description:', err);
      res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
  });






  router.put('/edit-folder', verifierSessionOuRediriger('/'), async (req, res) => {
    let { oldFolderName, newFolderName } = req.body;

    if (!oldFolderName || !newFolderName) {
      return res.status(400).json({ success: false, message: 'Données manquantes pour renommer le dossier.' });
    }

    // Nettoyage des noms de dossiers
    const sanitizeFolderName = (name) => name.trim().replace(/\s+/g, '_');

    oldFolderName = sanitizeFolderName(oldFolderName);
    newFolderName = sanitizeFolderName(newFolderName);

    const basePath = path.join(baseDir, 'public', 'portfolio', 'photo');
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

  const videosPath = path.join(baseDir, 'public/portfolio/video/videos.json');

  router.get('/get-videos', (req, res) => {
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


  router.post('/add-video', verifierSessionOuRediriger('/'), (req, res) => {
    const { url, titre, description } = req.body;

    if (!url || !titre || !description) {
      return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });
    }

    fs.readFile(path.join(baseDir, 'public/portfolio/video/videos.json'), 'utf8', (err, data) => {
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

  router.put('/edit-video', verifierSessionOuRediriger('/'), (req, res) => {
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




  router.delete('/remove-video', verifierSessionOuRediriger('/'), (req, res) => {
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








  router.get('/envoi-photo-profile', (req, res) => {
    const folderPath = path.join(baseDir, 'public/imgprofile');

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

  router.post('/upload-profile-image', verifierSessionOuRediriger('/'), upload.single('profileImage'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier reçu.' });
    }

    const folderPath = 'public/imgprofile';
    const uniqueName = `profile-${Date.now()}.png`; // Nom unique
    const filePath = path.join(folderPath, uniqueName);
    const profileLink = path.join(folderPath, 'profile.png'); // Lien fixe

    try {
      // Créer le dossier s'il n'existe pas
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      // 🔥 Supprimer tous les anciens fichiers sauf `profile.png`
      fs.readdirSync(folderPath).forEach(file => {
        if (file !== 'profile.png') {
          fs.unlinkSync(path.join(folderPath, file));
        }
      });

      // 📌 Enregistrer la nouvelle image sous un nom unique
      fs.writeFileSync(filePath, req.file.buffer);

      // ❌ Supprimer l'ancien lien symbolique ou fichier
      if (fs.existsSync(profileLink)) {
        fs.unlinkSync(profileLink);
      }

      try {
        // 🔗 Créer un lien symbolique vers la nouvelle image
        fs.symlinkSync(uniqueName, profileLink);
      } catch (err) {
        console.warn('Les liens symboliques ne fonctionnent pas sur ce système, on copie le fichier.');
        fs.copyFileSync(filePath, profileLink); // Alternative si symlink échoue
      }

      // ✅ Réponse au client
      res.json({
        message: 'Fichier téléchargé et mis à jour avec succès.',
        fileName: 'profile.png',
        folder: folderPath,
      });

    } catch (err) {
      console.error('Erreur lors de la mise à jour de la photo de profil :', err);
      return res.status(500).json({ message: 'Erreur serveur.' });
    }
  });


  router.get('/getillustration', (req, res) => {

    const folderPath = path.join(baseDir, 'public/imgaccueil');

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


  router.get('/get-video-accueil', (req, res) => {


    const VIDEO_FOLDER = path.join(baseDir, 'public', 'videodeo');

    fs.readdir(VIDEO_FOLDER, (err, files) => {
      if (err || !files.length) {
        return res.json({ src: null });
      }

      // On suppose qu’il n’y a qu’un seul fichier
      res.json({ src: `/videodeo/${files[0]}` });
    });
  });

  router.post('/upload-video-accueil', (req, res, next) => {


    const VIDEO_FOLDER = path.join(baseDir, 'public', 'videodeo');

    // Nettoie le nom de fichier
    const cleanFileName = (name) => {
      return name.replace(/[^a-z0-9.\-_]/gi, '_');
    };

    // Config Multer
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        if (!fs.existsSync(VIDEO_FOLDER)) {
          fs.mkdirSync(VIDEO_FOLDER, { recursive: true });
        }

        // Supprime les anciennes vidéos
        const files = fs.readdirSync(VIDEO_FOLDER);
        for (const file of files) {
          fs.unlinkSync(path.join(VIDEO_FOLDER, file));
        }

        cb(null, VIDEO_FOLDER);
      },
      filename: (req, file, cb) => {
        cb(null, cleanFileName(file.originalname));
      }
    });

    const upload = multer({
      storage,
      limits: { fileSize: 350 * 1024 * 1024 }, // 100 Mo max
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Format de fichier non supporté'));
        }
      }
    }).single('video');

    upload(req, res, function (err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      return res.json({ message: 'Vidéo uploadée avec succès', src: `/videodeo/${cleanFileName(req.file.originalname)}` });
    });
  });

  router.delete('/delete-video-accueil', (req, res) => {
    const VIDEO_FOLDER = path.join(baseDir, 'public', 'videodeo');

    if (!fs.existsSync(VIDEO_FOLDER)) {
      return res.status(200).json({ message: 'Aucune vidéo à supprimer.' });
    }

    const files = fs.readdirSync(VIDEO_FOLDER);
    if (files.length === 0) {
      return res.status(200).json({ message: 'Aucune vidéo à supprimer.' });
    }

    for (const file of files) {
      fs.unlinkSync(path.join(VIDEO_FOLDER, file));
    }

    return res.status(200).json({ message: 'Vidéo supprimée avec succès.' });
  });


  router.get('/getillustration-contact', (req, res) => {

    const folderPath = path.join(baseDir, 'public/imgcontact');

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


  router.post('/changeillustration', verifierSessionOuRediriger('/'), upload.single('illustration'), (req, res) => {

    const sanitizeFileName = (name) => {
      return name
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // enlever accents
        .replace(/[^a-zA-Z0-9.\-_]/g, '-')                 // remplacer caractères spéciaux par tiret
        .toLowerCase();                                     // tout en minuscule
    };

    const targetDir = path.join(baseDir, 'public', 'imgaccueil');

    // Vérifier que le fichier est bien uploadé
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier uploadé.', erreur: true });
    }

    // Nettoyer le nom du fichier
    const originalName = sanitizeFileName(req.file.originalname);

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
      const filePath = path.join(targetDir, originalName);
      fs.writeFile(filePath, req.file.buffer, (err) => {
        if (err) {
          console.error('Erreur lors de l\'écriture du fichier:', err);
          return res.status(500).json({ message: 'Erreur lors de l\'enregistrement du fichier.', erreur: true });
        }

        // Réponse réussie
        res.json({ message: 'Image mise à jour avec succès.', erreur: false, fileName: originalName });
      });
    });
  });


  router.post('/changeillustrationContact', verifierSessionOuRediriger('/'), upload.single('illustration'), (req, res) => {


    const sanitizeFilename = (filename) => {
      return filename
        .normalize('NFD')                      // Enlève les accents
        .replace(/[\u0300-\u036f]/g, '')       // Supprime les marques diacritiques
        .replace(/[^a-zA-Z0-9.\-_]/g, '-')     // Remplace tout caractère non autorisé par un tiret
        .toLowerCase();                        // Rend le nom en minuscule (optionnel)
    };

    const targetDir = path.join(baseDir, 'public', 'imgcontact');

    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier uploadé.', erreur: true });
    }

    // Nettoyage du nom de fichier original
    const originalName = req.file.originalname;
    const safeFileName = sanitizeFilename(originalName);

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

      // Écriture de la nouvelle image avec le nom nettoyé
      const filePath = path.join(targetDir, safeFileName);
      fs.writeFile(filePath, req.file.buffer, (err) => {
        if (err) {
          console.error('Erreur lors de l\'écriture du fichier:', err);
          return res.status(500).json({ message: 'Erreur lors de l\'enregistrement du fichier.', erreur: true });
        }

        res.json({ message: 'Image mise à jour avec succès.', erreur: false, fileName: safeFileName });
      });
    });
  });



  router.get('/getContactIllustration', (req, res) => {
    const imgDir = path.join(baseDir, 'public', 'imgcontact');

    fs.readdir(imgDir, (err, files) => {
      if (err) {
        console.error('Erreur lecture image :', err);
        return res.status(500).json({ erreur: true, message: 'Erreur serveur.' });
      }

      const image = files.find(f => /\.(jpg|jpeg|png|webp)$/i.test(f)); // Cherche un fichier image

      if (!image) {
        return res.status(404).json({ erreur: true, message: 'Aucune image trouvée.' });
      }

      res.json({ erreur: false, fileName: image }); // Nom du fichier uniquement
    });
  });



  /////////////////////////////////////////////////////////////////////////////////
  //GESTION CONTACT BACK//////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////

  router.get('/send-link', (req, res) => {
    const filePath = path.join(baseDir, 'bdd.json'); // Chemin vers le fichier JSON

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
  router.delete('/delete-prestation', verifierSessionOuRediriger('/'), (req, res) => {

    const filePath = path.join(baseDir, 'bdd.json');
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

      fs.writeFile(filePath, JSON.stringify(database, null, 2), writeErr => {
        if (writeErr) {
          console.error('Erreur lors de l\'écriture du fichier:', writeErr);
          return res.status(500).json({ error: 'Erreur serveur' });
        }

        res.status(200).json({ message: 'Contact supprimé avec succès' });
      });
    });
  });


  router.post('/add-reseau', verifierSessionOuRediriger('/'), (req, res) => {
    const filePath = path.join(baseDir, 'bdd.json');
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
  const controlPack = require('../utils/checkPaymentPermission')
  //////////////////////////////////////////////////

  router.post('/creat-ticket', verifierSessionOuRediriger('/'), controlPack, upload.array('files'), (req, res) => {
    const { idl, key, nom, prenom, mail, prix } = req.body;
    const files = req.files;

    if (!idl || !key || !nom || !prenom || !mail || files.length === 0) {
      return res.status(400).json({ success: false, message: 'Données manquantes' });
    }

    const ticketDir = path.join(baseDir, 'ticket');
    const ticketFolder = path.join(ticketDir, 'scaly-photos');

    // Supprimer les anciens dossiers sauf ticket.json
    const items = fs.readdirSync(ticketDir);
    items.forEach(item => {
      const itemPath = path.join(ticketDir, item);
      if (fs.lstatSync(itemPath).isDirectory()) {
        fs.rmSync(itemPath, { recursive: true, force: true });
      }
    });

    if (!fs.existsSync(ticketFolder)) {
      fs.mkdirSync(ticketFolder, { recursive: true });
    }

    files.forEach(file => {
      const filePath = path.join(ticketFolder, file.originalname);
      fs.writeFileSync(filePath, file.buffer);
    });

    const taille = files.reduce((acc, file) => acc + file.size, 0);
    const tailleMo = (taille / (1024 * 1024)).toFixed(2);
    const tailleGo = (taille / (1024 * 1024 * 1024)).toFixed(2);
    const tailleFinale = tailleGo > 1 ? `${tailleGo} Go` : `${tailleMo} Mo`;

    const ticketJsonPath = path.join(ticketDir, 'ticket.json');


    const ticketId = randomUUID();
    const ticketData = {
      ticket: {
        id: ticketId,
        idl,
        key,
        nom,
        prenom,
        mail,
        dossier: 'scaly-photos',
        nombrel: files.length,
        taille: tailleFinale,
        download: "Non téléchargé",
        price: prix || false,
        paiementcheck: false,
      }
    };

    fs.writeFileSync(ticketJsonPath, JSON.stringify(ticketData, null, 4));

    // Configuration du transporteur email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.GMAIL_USER,
        pass: config.GMAIL_PASS
      }
    });

    // Mail au client final
    const mailOptionsClientFinal = {
      from: `"Scaly" <${config.GMAIL_USER}>`,
      to: mail,
      subject: 'Vos photos sont prêtes !',
      html: `
            <p>Bonjour ${prenom} ${nom},</p>
            <p>Votre photographe vient de publier vos photos via Scaly Pic's.</p>
            <p>Voici vos informations de connexion :</p>
            <ul>
                <li><strong>ID :</strong> ${idl}</li>
                <li><strong>Clé :</strong> ${key}</li>
            </ul>
            <p>En cas de problème, vous pouvez contacter votre photographe à cette adresse : <a href="mailto:${config.MAIL}">${config.MAIL}</a></p>
            <p>Bonne consultation,<br/><em>L'équipe Scaly Pic’s</em></p>
        `
    };

    // Mail au client pro (ton client)
    const mailOptionsClientPro = {
      from: `"Scaly" <${config.GMAIL_USER}>`,
      to: config.MAIL,
      subject: 'Ticket créé avec succès',
      html: `
            <p>Bonjour,</p>
            <p>Un nouveau ticket a été créé pour le client <strong>${prenom} ${nom}</strong> (${mail}).</p>
            <p>Nombre de fichiers : ${files.length}<br/>Taille totale : ${tailleFinale}</p>
            <hr/>
            <p>Un mail a été envoyé à votre client.</p>
            <p><em>L'équipe Scaly Pic’s</em></p>
        `
    };

    // Envoi des mails
    transporter.sendMail(mailOptionsClientFinal, (err, infoClientFinal) => {
      if (err) {
        // Si erreur, informer le client pro
        const failNotice = {
          from: `"Scaly" <${config.GMAIL_USER}>`,
          to: config.MAIL,
          subject: '[ERREUR] Ticket créé mais mail non envoyé au client',
          html: `
                    <p>Bonjour,</p>
                    <p>Le ticket a bien été créé, mais l'envoi de l'email à votre client a échoué.</p>
                    <p><strong>Erreur :</strong> ${err.message}</p>
                    <p>Client : ${prenom} ${nom} (${mail})</p>
                    <hr/>
                    <p><em>L'équipe Scaly Pic’s</em></p>
                `
        };

        transporter.sendMail(failNotice);
      } else {
        // Sinon, confirmer la création du ticket
        transporter.sendMail(mailOptionsClientPro);
      }
    });

    // Réponse côté client
    res.json({ success: true, message: 'Ticket créé avec succès.' });
  });



  router.get('/get-ticket', verifierSessionOuRediriger('/'), (req, res) => {
    const ticketPath = path.join(baseDir, 'ticket/ticket.json');

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


  router.delete('/reset-ticket', verifierSessionOuRediriger('/'), (req, res) => {
    const ticketPath = path.join(baseDir, 'ticket', 'ticket.json');

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
        const dossierPath = path.join(baseDir, 'ticket', ticketData.ticket.dossier);

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
        "id": "",
        "idl": "",
        "key": "",
        "nom": "",
        "prenom": "",
        "dossier": "",
        "nombrel": "",
        "taille": "",
        "download": "Votre client n’a pas encore téléchargé ses photos",
        "paiementcheck": false,
        "price": false
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

  router.get('/get-ticket-folder', verifierTokenClient, (req, res) => {
    const ticketPath = path.join(baseDir, 'ticket', 'ticket.json');

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


  router.get('/ticket/scaly-photos/:filename', verifierTokenClient, (req, res) => {
    const filePath = path.join(baseDir, 'ticket', 'scaly-photos', req.params.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Image non trouvée');
    }
    res.sendFile(filePath);
  });


  router.get('/photo-ticket-folder', verifierTokenClient, (req, res) => {
    const ticketFolder = path.join(baseDir, 'ticket', 'scaly-photos');
    let images = [];
    let totalImages = 0;

    function parcourirDossier(dossier) {
      const items = fs.readdirSync(dossier);

      for (const item of items) {
        const itemPath = path.join(dossier, item);
        const stat = fs.lstatSync(itemPath);

        if (stat.isDirectory()) {
          parcourirDossier(itemPath); // exploration récursive
        } else if (/\.(jpg|jpeg|png|gif|webp)$/i.test(item)) {
          totalImages++; // on compte chaque image
          if (images.length < 3) {
            images.push(itemPath.replace(baseDir, '').replace(/\\/g, '/')); // on stocke les 3 premières
          }
        }
      }
    }

    if (fs.existsSync(ticketFolder)) {
      parcourirDossier(ticketFolder);
    }

    if (totalImages === 0) {
      return res.json({ message: 'Aucune photo présente dans le dossier' });
    }

    res.json({
      images,
      total: totalImages
    });
  });



  router.get('/photo-ticket-all', verifierTokenClient, (req, res) => {
    const ticketFolder = path.join(baseDir, 'ticket', 'scaly-photos');
    let images = [];

    function parcourirDossier(dossier) {
      const items = fs.readdirSync(dossier);
      for (const item of items) {
        const itemPath = path.join(dossier, item);
        const stat = fs.lstatSync(itemPath);

        if (stat.isDirectory()) {
          parcourirDossier(itemPath);
        } else if (/\.(jpg|jpeg|png|gif|webp)$/i.test(item)) {
          images.push(itemPath.replace(baseDir, '').replace(/\\/g, '/'));
        }
      }
    }

    if (fs.existsSync(ticketFolder)) {
      parcourirDossier(ticketFolder);
    }

    res.json({ images });
  });



  const archiver = require('archiver');

  router.get('/download-photos', verifierTokenClient, async (req, res) => {
    const folderPath = path.join(baseDir, 'ticket', 'scaly-photos');

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



  router.post('/download-complete', (req, res) => {
    const ticketPath = path.join(baseDir, 'ticket', 'ticket.json');
    // Lire le fichier JSON
    let ticketData;
    try {
      ticketData = JSON.parse(fs.readFileSync(ticketPath, 'utf8'));
    } catch (err) {
      console.error("Erreur lors de la lecture du fichier ticket.json :", err);
      return res.status(500).json({ success: false, message: "Erreur de lecture du ticket" });
    }

    // Modifier le champ "download"
    ticketData.ticket.download = "Votre client a bien téléchargé ses photos !";

    // Sauvegarder les modifications dans le fichier
    try {
      fs.writeFileSync(ticketPath, JSON.stringify(ticketData, null, 2));
    } catch (err) {
      console.error("Erreur lors de l'écriture du fichier ticket.json :", err);
      return res.status(500).json({ success: false, message: "Erreur d’écriture du ticket" });
    }

    // Envoi de l'email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.GMAIL_USER,
        pass: config.GMAIL_PASS
      }
    });

    const mailOptions = {
      from: config.GMAIL_USER,
      to: config.MAIL,
      subject: 'Téléchargement de photos terminé par votre client',
      text: `Bonjour ${config.PRENOM_PRO},\n\nNous vous informons que votre client a terminé le téléchargement de ses photos.\n\nCordialement,\nL'équipe Scaly`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        return res.status(500).json({ success: false, message: "Échec de l'envoi du mail" });
      }
      console.log('Email envoyé: ' + info.response);
      res.json({ success: true, message: "Notification envoyée avec succès et ticket mis à jour." });
    });
  });




  return router;
};
