// ⚡ Fonction pour récupérer les données utilisateur
async function fetchUserData() {
    try {
        const response = await fetch("/api/user_client", {
            credentials: "include"  // Assure-toi que le cookie est inclus dans la requête
        });

        if (!response.ok) {
            throw new Error("Erreur lors de la récupération des données utilisateur.");
        }

        const data = await response.json();
        if (!data.user) throw new Error("Utilisateur non authentifié");

        window.clientData = data.user;
        return data.user;
    } catch (error) {
        console.error("Erreur lors du chargement des données utilisateur :", error);
        alert("Veuillez vous reconnecter."); // Redirection vers la page de connexion si l'utilisateur est déconnecté
    }
}


// ⚡ Fonction pour charger le tableau de bord
async function loadDashboard() {
    try {
        const response = await fetch("/api/dashboard", { credentials: "include" });
        const data = await response.text(); // On attend la réponse complète en HTML

        document.querySelector("#main-content").innerHTML = data;

        // Ajout des événements une fois le contenu chargé
        setupMenu();
        fillUserData();
        setupPagination();

    } catch (error) {
        console.error("Erreur lors du chargement du dashboard :", error);
    }
}

// ⚡ Remplissage des champs utilisateur
function fillUserData() {
    if (!window.clientData) return;

    const fillField = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value || "Non renseigné";
    };

    fillField("subscriptionStatus", window.clientData.subscriptionStatus);
    fillField("subscriptionStock", window.clientData.subscriptionStock);
    fillField("subscriptionColor", window.clientData.subscriptionColor);
    fillField("siteId", window.clientData.siteId);

    fillField("lastName", window.clientData.lastName);
    fillField("firstName", window.clientData.firstName);
    fillField("birthDate", window.clientData.birthDate ? new Date(window.clientData.birthDate).toLocaleDateString() : "Non renseigné");
    fillField("address", window.clientData.address);
    fillField("phoneNumber", window.clientData.phoneNumber);

    fillField("email", window.clientData.email);
    fillField("isVerified", window.clientData.isVerified ? "Oui" : "Non");
    fillField("paiement", window.clientData.paiement);
    fillField("typePaiement", window.clientData.typePaiement);
    fillField("price", `${window.clientData.price}€`);

    if(window.clientData.http){
        fillField("http", `${window.clientData.http}`);
        
    }else{
        const divbutton = document.createElement('div')
        divbutton.classList.add("background-button")
        const button = document.createElement('button')
        button.classList.add('buttonform')
        divbutton.appendChild(button)
        button.textContent = "Publier votre Pic's"

        document.querySelector('#setuphttp').appendChild(divbutton)
        divbutton.addEventListener('click',()=>{
            buildPics()
        })
    }

    if(window.clientData.subscriptionStatus === "inactif"){

        document.querySelector('.itserr').style.display ="block"
        document.querySelector('#subscriptionStatus').style.textTransform ="uppercase"
        document.querySelector('#subscriptionStatus').style.color ="var(--red)"
        const buy = document.createElement('div')
        buy.classList.add('background-button')
        buy.id = "rebuy"
        buy.style.width ="auto"
        const button = document.createElement('button')
        button.classList.add('buttonform')
        button.textContent="Payer"
        buy.appendChild(button)
        document.querySelector('#abonnementGestion').appendChild(buy)
        buy.addEventListener('click',async()=>{
            load()
                        try {
                            const response = await fetch("/api/stripe/start-checkout", {
                              method: "POST",
                              credentials: "include", // important pour le cookie JWT
                            });
                        
                            const data = await response.json();
                        
                            if (data.url) {
                              // Option 2 : ouvrir Stripe dans une nouvelle fenêtre (comme tu voulais)
                              window.open(data.url, "_blank");
                        
                              // Tu attends la réponse via le postMessage que tu as déjà mis en place
                            } else {
                              document.querySelector('.itserr').textContent ="Oops ! un problème est survenu."
                              finload();
                            }
                          } catch (err) {
                            document.querySelector('.itserr').textContent ="Oops ! un problème est survenu."
                            finload();
                          }

                          window.addEventListener("message", (event) => {
                            if (event.data.stripeSuccess) {
                              console.log("🎉 Paiement validé !");
                              
                              // Tu peux déclencher une requête vers le back-end pour activer l'abonnement :
                              fetch("api/stripe/confirmation", {
                                method: "POST",
                                credentials: "include", // important pour envoyer le cookie JWT
                              })
                              .then(res => res.json())
                              .then(data => {
                                if (data.success) {
                                    
                                    console.log("✅ Abonnement activé côté serveur");
                                    fetchUserData().then(()=>{
                                        fillUserData()
                                        finload()
                                    })
                                }
                              });
                              
                            } else {
                                finload()
                              console.log("❌ Paiement annulé.");
                              document.querySelector('.itserr').textContent ="Le paiement à échoué."
                            }
                          });
        })
    }else{
        if(document.querySelector('#rebuy')){
            document.querySelector('#rebuy').remove()
        }
        document.querySelector('.itserr').style.display ="none"
        document.querySelector('#subscriptionStatus').style.color ="var(--green)"
        document.querySelector('#subscriptionStatus').style.textTransform ="uppercase"
    }
}



// ⚡ Gestion du menu burger
function setupMenu() {
    const menu = document.querySelector("#burger");
    if (menu) {
        menu.addEventListener("click", () => {
            document.querySelector("#sous-nav").classList.toggle("translate");
        });
    }


    document.getElementById("manage-billing").addEventListener("click", async () => {
        try {
            const res = await fetch("/api/create-portal-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include"  // Assure-toi d'inclure les cookies pour l'authentification
            });
    
            const data = await res.json();
            if (res.ok && data.url) {
                window.location.href = data.url;
            } else {
                console.error("Erreur lors de la création de la session Stripe :", data.error || "Erreur inconnue");
                alert("Impossible de rediriger vers le portail de gestion.");
            }
        } catch (error) {
            console.error("Erreur lors de la création de la session Stripe :", error);
            alert("Erreur de communication avec le serveur.");
        }
    });
    
}

// ⚡ Gestion de la pagination
function setupPagination() {
    const pages = document.querySelectorAll(".page");

    pages.forEach(page => {
        page.addEventListener("click", () => {
            pages.forEach(p => document.querySelector(`.${p.id}`).style.display = "none");
            document.querySelector(`.${page.id}`).style.display = "flex";
        });
    });

    // Masquer certaines sections au démarrage
    document.querySelector("#general").style.display = "none";
    document.querySelector("#charging").style.display = "none";
    
    document.querySelector("#logout").addEventListener("click", async () => {
        try {
            const response = await fetch("/api/logout", { credentials: "include" });
            const data = await response.json();
            if (data.message === "Déconnexion réussie") {
                document.querySelector("#divlock").style.display = "flex";
                document.querySelector("#unlock").style.display = "none";
                window.location.href = "/";
            }
        } catch (error) {
            console.error("Erreur de déconnexion :", error);
        }
    });
}



// ⚡ Déconnexion


// ⚡ Initialisation : charger les données et afficher le dashboard
(async () => {
    await fetchUserData();
    await loadDashboard();
})();


async function buildPics() {
  load(); // J’imagine que c’est une animation ou un spinner

  const nom = window.clientData.lastName;
  const prenom = window.clientData.firstName;
  const email = window.clientData.email;
  const siteId = window.clientData.siteId;      // par exemple : 'starter', 'pro', 'unlimited'
  const color = window.clientData.subscriptionColor;      // exemple : 'dark-minimal'
  const pack = window.clientData.subscriptionStock; // nom personnalisé du site

  try {
    const res = await fetch("/api/build-site", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nom,
        prenom,
        email,
        siteId,
        color,
        pack
      })
    });

    const result = await res.json();

    if (res.ok) {
      console.log("✅ Site en cours de création :", result);
      // Tu peux rediriger, afficher un message de succès, etc.
    } else {
      console.error("❌ Erreur lors de la création du site :", result.message);
    }
  } catch (error) {
    console.error("🚨 Erreur réseau ou serveur :", error);
  }
}

function load(){
        
    const overlay = document.createElement('div');
    overlay.classList.add('overlayLoad');
    overlay.style.visibility="visible";
    overlay.style.opacity="1"
    console.log(overlay);

    // Ajout de l'overlay dans le body
    document.body.appendChild(overlay);
    const button=document.querySelector('.bubbly-button')
    button.style.overflow='hidden'
    const t = document.querySelector('#mooveAnim')
    
    t.style.zIndex="1"
    t.style.opacity="1"
    document.querySelector('#logonavbarre').style.opacity="0"
    const div = document.createElement('div')
    div.classList.add('loaderi')
    
    const img = document.createElement('img')
    img.src="/logo/logocoupe.png"
    img.style.width="auto"
    img.style.height="58px"
    img.style.borderRadius = "50px"
    
    const grad = document.createElement('div')
    grad.classList.add('gradload')
    grad.appendChild(img)
    document.querySelector('#admin').appendChild(div)
    document.querySelector('#admin').appendChild(grad)
    
}

function finload(){
    document.querySelector('.loaderi').remove()
    document.querySelector('.gradload').remove()
    document.querySelector('#logonavbarre').style.opacity="1"
    const button=document.querySelector('.bubbly-button')
    button.style.overflow='visible'
    button.classList.add('anima');
    setTimeout(function(){
        button.classList.remove('anima');
        document.querySelector('.overlayLoad').style.visibility="hidden";
        document.querySelector('.overlayLoad').style.opacity="0"
        document.querySelector('.overlayLoad').remove()
    },700);
}