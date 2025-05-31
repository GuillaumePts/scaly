// ⚡ Fonction pour récupérer les données utilisateur

// #d67211

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

  setupStripeClientButton()

  if (window.clientData.http) {
    fillField("http", `${window.clientData.http}`);
    document.querySelector('#http').href = window.clientData.http

  } else {
    if (!document.querySelector('#BuildPics')) {
      const divbutton = document.createElement('div')
      divbutton.classList.add("background-button")
      divbutton.id = "BuildPics"
      divbutton.style.width = "auto"
      const button = document.createElement('button')
      button.classList.add('buttonform')
      divbutton.appendChild(button)
      button.textContent = "Publier votre Pic's"

      document.querySelector('#setuphttp').appendChild(divbutton)
      divbutton.addEventListener('click', () => {
        buildPics()
      })
    }

  }

  if (window.clientData.subscriptionStatus === "inactif") {

    document.querySelector('.itserr').style.display = "block"
    document.querySelector('#subscriptionStatus').style.textTransform = "uppercase"
    document.querySelector('#subscriptionStatus').style.color = "var(--red)"
    const buy = document.createElement('div')
    buy.classList.add('background-button')
    buy.id = "rebuy"
    buy.style.width = "auto"
    const button = document.createElement('button')
    button.classList.add('buttonform')
    button.textContent = "Activer l'abonnement"
    buy.appendChild(button)
    document.querySelector('#abonnementGestion').appendChild(buy)
    buy.addEventListener('click', async () => {
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
          document.querySelector('.itserr').textContent = "Oops ! un problème est survenu."
          finload();
        }
      } catch (err) {
        document.querySelector('.itserr').textContent = "Oops ! un problème est survenu."
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
                fetchUserData().then(() => {
                  fillUserData()
                  finload()
                })
              }
            });

        } else {
          finload()
          console.log("❌ Paiement annulé.");
          document.querySelector('.itserr').textContent = "Le paiement à échoué."
        }
      });
    })
  } else if (window.clientData.subscriptionStatus === "actif") {
    if (document.querySelector('#rebuy')) {
      document.querySelector('#rebuy').remove()
    }
    document.querySelector('.itserr').style.display = "none"
    document.querySelector('#subscriptionStatus').style.color = "var(--green)"
    document.querySelector('#subscriptionStatus').style.textTransform = "uppercase"
  } else {
    if (document.querySelector('#rebuy')) {
      document.querySelector('#rebuy').remove()
    }
    document.querySelector('.itserr').style.display = "none"
    document.querySelector('#subscriptionStatus').style.color = "#d67211"
    // document.querySelector('#subscriptionStatus').style.textTransform ="uppercase"
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

  document.querySelector('#editPassword').addEventListener('click', () => {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0px';
    overlay.style.left = '0px';
    overlay.style.width = '100%';
    overlay.style.height = '100vh';
    overlay.style.zIndex = '89';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';

    const form = document.createElement('div');
    form.className = 'form-subfolder-creat';

    const p = document.createElement('p')
    p.classList.add('pOverlayBack')
    p.style.color = "#fff"
    p.textContent = "Votre ancien mot de passe :"

    const input = document.createElement('input');
    input.className = 'input-subfolder';
    input.type = "password"
    input.placeholder = '***';

    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'center';
    buttonContainer.style.alignItems = 'center';
    buttonContainer.style.gap = '25px';

    const backgroundBtnDiv = document.createElement('div');
    backgroundBtnDiv.className = 'background-button';

    const createBtn = document.createElement('button');
    createBtn.className = 'buttonform';
    createBtn.textContent = 'Valider';

    createBtn.addEventListener('click', () => {

      load()
      const password = input.value.trim();


      fetch('/api/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // inclut les cookies (ex: token de session)
        body: JSON.stringify({ currentPassword: password })
      })
        .then(response => response.json())
        .then(data => {

          if (data.success) {

            finload('')

            form.textContent = ""

            const pNew = document.createElement('p')
            pNew.classList.add('pOverlayBack')
            pNew.style.color = "#fff"
            pNew.textContent = "Nouveau mot de passe :"

            const inputNew = document.createElement('input');
            inputNew.className = 'input-subfolder';
            inputNew.placeholder = '***';

            const pErr = document.createElement('p')
            pErr.classList.add('errform')
            pErr.style.color = '#ff5151'

            const pNewConfirm = document.createElement('p')
            pNewConfirm.classList.add('pOverlayBack')
            pNewConfirm.style.color = "#fff"
            pNewConfirm.type = "password"
            pNewConfirm.textContent = "Confirmer le mot de passe :"

            const confirminputNew = document.createElement('input');
            confirminputNew.className = 'input-subfolder';
            pNewConfirm.type = "password"
            confirminputNew.placeholder = 'Confirmer le mot de passe';

            const buttonContainerNew = document.createElement('div');
            buttonContainerNew.style.display = 'flex';
            buttonContainerNew.style.justifyContent = 'center';
            buttonContainerNew.style.alignItems = 'center';
            buttonContainerNew.style.gap = '25px';

            const backgroundBtnDivNew = document.createElement('div');
            backgroundBtnDivNew.className = 'background-button';

            const createBtnNew = document.createElement('button');
            createBtnNew.className = 'buttonform';
            createBtnNew.textContent = 'Valider';




            form.appendChild(pNew)
            form.appendChild(inputNew)
            form.appendChild(pErr)
            form.appendChild(pNewConfirm)
            form.appendChild(confirminputNew)
            form.appendChild(buttonContainerNew)

            createBtnNew.addEventListener('click', () => {
              load('')
              const newPassword = inputNew.value.trim();
              const confirmPassword = confirminputNew.value.trim();

              // Vérification de sécurité minimale
              const passwordStrengthRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;

              if (!newPassword || !confirmPassword) {
                finload('')
                pErr.textContent = "Veuillez remplir les deux champs.";
                return;
              }

              if (!passwordStrengthRegex.test(newPassword)) {
                finload('')
                pErr.textContent = "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.";
                return;
              }

              if (newPassword !== confirmPassword) {
                finload('')
                pErr.textContent = "Les mots de passe ne correspondent pas.";
                return;
              }

              // Réinitialise le message d’erreur
              pErr.textContent = "";

              // Envoi du fetch pour modifier le mot de passe
              fetch('/api/change-password', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ newPassword })
              })
                .then(res => res.json())
                .then(data => {
                  if (data.success) {
                    overlay.remove();
                    finload('Mot de passe mis à jour avec succès !')
                  } else {
                    finload('')
                    pErr.textContent = data.message || "Une erreur est survenue.";
                  }
                })
                .catch(err => {
                  finload('')
                  console.error(err);
                  pErr.textContent = "Erreur réseau ou serveur.";
                });
            });


            const cancelBtnNew = document.createElement('button');
            cancelBtnNew.className = 'button-close-subfolder';
            cancelBtnNew.textContent = 'Annuler';

            backgroundBtnDivNew.appendChild(createBtnNew);
            buttonContainerNew.appendChild(backgroundBtnDivNew);
            buttonContainerNew.appendChild(cancelBtnNew);

            cancelBtnNew.addEventListener('click', () => {
              overlay.remove();
            });


          } else {
            finload("Mot de passe Incorrect")
          }
        })
        .catch(error => {
          finload('Erreur lors de la vérification du mot de passe')
          console.log(error);
        });
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'button-close-subfolder';
    cancelBtn.textContent = 'Annuler';

    // Assemble les éléments
    backgroundBtnDiv.appendChild(createBtn);
    buttonContainer.appendChild(backgroundBtnDiv);
    buttonContainer.appendChild(cancelBtn);

    form.appendChild(p)
    form.appendChild(input);
    form.appendChild(buttonContainer);

    overlay.appendChild(form);


    cancelBtn.addEventListener('click', () => {
      overlay.remove();
    });
    // Ajoute au DOM
    document.body.appendChild(overlay);

  })

  document.querySelector('#deletedCompte').addEventListener('click', () => {
    const overlay = document.createElement('div')
    overlay.classList.add('overlaybackend')
    document.body.appendChild(overlay)

    const p = document.createElement('p')
    p.classList.add('pOverlayBack')
    p.textContent = "Vous êtes sur le point de supprimer définitivement votre compte ainsi que votre site Pic’s associé. Cette action entraînera également l’arrêt de votre abonnement. Êtes-vous certain de vouloir continuer ?"

    const remarque = document.createElement('p')
    remarque.classList.add('remarque')
    const span = document.createElement('span')
    span.textContent = "Remarque : "
    span.style.textDecoration = "underline"
    remarque.appendChild(span);
    remarque.appendChild(document.createTextNode(
      "Vous pouvez choisir une suppression immédiate (perte instantanée de l'accès et des données) ou une suppression différée, qui prendra effet à la fin de votre période d'abonnement pour garantir un mois complet d'utilisation."
    ));

    const deleteNow = document.createElement('button')
    deleteNow.textContent = "Suppression immédiate"
    deleteNow.classList.add('button-close-subfolder')

    deleteNow.addEventListener('click', async () => {
      load()
      try {
        const res = await fetch('/api/delete-account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include', // pour envoyer les cookies avec le token
          body: JSON.stringify({ immediate: true })
        });

        const result = await res.json();

        if (res.ok) {
          document.querySelector('.msgoverlay').textContent = "Votre compte à bien été supprimé et votre compte résilié"
          finload()
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
          // rediriger vers la page d'accueil après suppression
        } else {
          document.querySelector('.msgoverlay').textContent = 'Erreur lors de la suppression.'
          setTimeout(() => {
            finload()
          }, 4000);
        }
      } catch (err) {
        document.querySelector('.msgoverlay').textContent = 'Erreur lors de la suppression.'
        setTimeout(() => {
          finload()
        }, 4000);
      }
    });






    const bk = document.createElement('div')
    bk.classList.add('background-button')
    const annuler = document.createElement('button')
    annuler.classList.add('buttonform')
    annuler.textContent = "Annuler"
    bk.appendChild(annuler)
    annuler.addEventListener('click', () => {
      document.querySelector('.overlaybackend').remove()
    })

    overlay.appendChild(p)
    overlay.appendChild(remarque)
    overlay.appendChild(deleteNow)

    if (!window.clientData.deletionDate) {
      const deleteDifere = document.createElement('button')
      deleteDifere.textContent = "Suppression diféré"
      deleteDifere.classList.add('button-close-subfolder')

      overlay.appendChild(deleteDifere)

      deleteDifere.addEventListener('click', async () => {
        load()
        try {
          const res = await fetch('/api/delete-account', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include', // Nécessaire pour envoyer le cookie contenant le token
            body: JSON.stringify({ immediate: false }) // 👈 suppression différée
          });

          const result = await res.json();

          if (res.ok) {

            document.querySelector('.msgoverlay').textContent = result.message
            document.querySelector('.overlaybackend').remove()
            setTimeout(() => {
              finload()
            }, 4000);
          } else {

            document.querySelector('.msgoverlay').textContent = result.message
            setTimeout(() => {
              finload()
            }, 4000);
          }
        } catch (err) {

          document.querySelector('.msgoverlay').textContent = "Une erreur est survenue. Veuillez réessayer."
          setTimeout(() => {
            finload()
          }, 4000);
        }
      });
    }

    overlay.appendChild(bk)

  })


  document.getElementById("manage-billinge").addEventListener("click", async () => {




    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0px';
    overlay.style.left = '0px';
    overlay.style.width = '100%';
    overlay.style.height = '100vh';
    overlay.style.zIndex = '100';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';

    const form = document.createElement('div');
    form.className = 'form-subfolder-creat';

    const p = document.createElement('p')
    p.classList.add('pOverlayBack')
    p.style.color = "#fff"
    p.textContent = "Entrez le code de vérification envoyé à votre adresse e-mail";

    const codeContainer = document.createElement('div');
    codeContainer.className = 'code-container';

    const codeInputs = [];
    for (let i = 0; i < 6; i++) {
      const input = document.createElement('input');
      input.className = 'code-input';
      input.setAttribute('type', 'text');
      input.setAttribute('maxlength', '1');
      input.setAttribute('inputmode', 'numeric'); // ou "text" si lettres autorisées
      codeContainer.appendChild(input);
      codeInputs.push(input);
    }

    // Gestion focus automatique
    codeInputs.forEach((input, idx) => {
      input.addEventListener('input', () => {
        if (input.value.length === 1 && idx < codeInputs.length - 1) {
          codeInputs[idx + 1].focus();
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && input.value === '' && idx > 0) {
          codeInputs[idx - 1].focus();
        }
      });
    });



    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'center';
    buttonContainer.style.alignItems = 'center';
    buttonContainer.style.gap = '25px';

    const createBtnNew = document.createElement('button');
    createBtnNew.className = 'buttonform';
    createBtnNew.textContent = 'Valider';

    const backgroundBtnDiv = document.createElement('div');
    backgroundBtnDiv.className = 'background-button';

    backgroundBtnDiv.appendChild(createBtnNew)

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'button-close-subfolder';
    cancelBtn.textContent = 'Annuler';

    // Assemble les éléments
    // backgroundBtnDiv.appendChild(createBtn);
    buttonContainer.appendChild(backgroundBtnDiv);
    buttonContainer.appendChild(cancelBtn);

    const pErr = document.createElement('p')
    pErr.classList.add('errform')
    pErr.style.color = '#ff5151'


    form.appendChild(p);
    form.appendChild(codeContainer);
    form.appendChild(pErr)
    form.appendChild(buttonContainer);

    createBtnNew.addEventListener("click", async () => {
      load()
      const code = codeInputs.map(input => input.value).join("");

      if (code.length !== 6) {
        finload()
        pErr.textContent = "Le code est incomplet.";
        return;
      }

      const res = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code })
      });

      const data = await res.json();

      if (!res.ok) {
        finload()
        pErr.textContent = data.error || "Erreur de vérification.";
        return;
      }

      // Code OK => on ouvre Stripe
      const stripeRes = await fetch("/api/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });

      const stripeData = await stripeRes.json();
      if (stripeRes.ok && stripeData.url) {
        finload()
        window.open(stripeData.url, "_blank");
        overlay.remove();
      } else {
        finload()
        pErr.textContent = "Erreur lors de l’ouverture du portail Stripe.";
      }
    });


    overlay.appendChild(form);

    cancelBtn.addEventListener('click', () => {
      overlay.remove();
    });
    // Ajoute au DOM
    document.body.appendChild(overlay);

    const response = await fetch("/api/send-verification-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });

    if (!response.ok) {

      pErr.textContent = "Erreur lors de l'envoi du code de vérification."
      return;
    }


    // try {
    //   const res = await fetch("/api/create-portal-session", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     credentials: "include"
    //   });

    //   const data = await res.json();
    //   if (res.ok && data.url) {
    //     finload();
    //     window.open(data.url, "_blank"); // ⭐ Ouvre Stripe dans une nouvelle fenêtre
    //   } else {
    //     finload();
    //     alert("Impossible de rediriger vers le portail de gestion.");
    //   }
    // } catch (error) {
    //   finload();
    //   alert("Erreur de communication avec le serveur.");
    // }
  });


}

// ⚡ Gestion de la pagination
function setupPagination() {
  const pages = document.querySelectorAll(".page");
  changePack()

  pages.forEach(page => {
    page.addEventListener("click", () => {
      pages.forEach(p => document.querySelector(`.${p.id}`).style.display = "none");
      document.querySelector(`.${page.id}`).style.display = "flex";
      document.querySelector("#sous-nav").classList.toggle("translate");


      if (page.id == "gen") {
        document.querySelectorAll('.editUser').forEach(button => {

          button.addEventListener('click', () => {
            const wrapper = button.closest('.param')?.parentElement;
            const valueElement = wrapper?.querySelector('.value');



            if (valueElement) {


              const fieldId = valueElement.id;
              console.log("Tu veux éditer :", fieldId);

              const currentValue = window.clientData[fieldId];
              let input;

              if (fieldId === 'birthDate' && currentValue) {
                // On prépare la valeur ISO pour input date (format YYYY-MM-DD)
                const date = new Date(currentValue);
                if (!isNaN(date)) {
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  const isoDate = `${year}-${month}-${day}`;

                  input = document.createElement('input');
                  input.type = 'date';
                  input.className = 'input-subfolder';
                  input.value = isoDate;
                } else {
                  // En cas de date invalide, on prend un input text par défaut
                  input = document.createElement('input');
                  input.className = 'input-subfolder';
                  input.value = '';
                }
              } else {
                // Pour les autres champs, input text simple
                input = document.createElement('input');
                input.className = 'input-subfolder';
                input.value = currentValue || '';
              }




              const overlay = document.createElement('div');
              overlay.style.position = 'fixed';
              overlay.style.top = '0px';
              overlay.style.left = '0px';
              overlay.style.width = '100%';
              overlay.style.height = '100vh';
              overlay.style.zIndex = '100';
              overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
              overlay.style.display = 'flex';
              overlay.style.flexDirection = 'column';
              overlay.style.justifyContent = 'center';
              overlay.style.alignItems = 'center';

              const form = document.createElement('div');
              form.className = 'form-subfolder-creat';


              const buttonContainer = document.createElement('div');
              buttonContainer.style.display = 'flex';
              buttonContainer.style.justifyContent = 'center';
              buttonContainer.style.alignItems = 'center';
              buttonContainer.style.gap = '25px';

              const backgroundBtnDiv = document.createElement('div');
              backgroundBtnDiv.className = 'background-button';

              const createBtn = document.createElement('button');
              createBtn.className = 'buttonform';
              createBtn.textContent = 'Modifier';

              createBtn.addEventListener('click', () => {
                const newValue = input.value.trim();

                // Validation spéciale numéro de téléphone côté client
                if (fieldId === 'phoneNumber') {
                  const phoneRegex = /^\d{10}$/;
                  if (!phoneRegex.test(newValue)) {
                    input.style.color = 'red';
                    input.addEventListener('input', () => {
                      const currentValue = input.value.trim();
                      if (!phoneRegex.test(currentValue)) {
                        input.style.color = 'red';
                      } else {
                        input.style.color = '#000';
                      }
                    });
                    return; // On bloque la suite (pas d'envoi)
                  }
                }


                overlay.remove();
                sendFieldUpdate(fieldId, newValue);
              });

              const cancelBtn = document.createElement('button');
              cancelBtn.className = 'button-close-subfolder';
              cancelBtn.textContent = 'Annuler';

              // Assemble les éléments
              backgroundBtnDiv.appendChild(createBtn);
              buttonContainer.appendChild(backgroundBtnDiv);
              buttonContainer.appendChild(cancelBtn);


              form.appendChild(input);
              form.appendChild(buttonContainer);

              overlay.appendChild(form);

              cancelBtn.addEventListener('click', () => {
                overlay.remove();
              });
              // Ajoute au DOM
              document.body.appendChild(overlay);
            }

          });

        });
      }

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
  load(); // Animation initiale
  document.querySelector('.msgoverlay').textContent = "Construction de votre produit Pic's"
  const nom = window.clientData.lastName;
  const prenom = window.clientData.firstName;
  const email = window.clientData.email;
  const siteId = window.clientData.siteId;
  const color = window.clientData.subscriptionColor;
  const pack = window.clientData.subscriptionStock;

  try {
    // Affichage étape 1
    document.querySelector('.msgoverlay').textContent = "Initialisation de votre produit Pic's...";

    const res = await fetch("/api/build-site", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ nom, prenom, email, siteId, color, pack })
    });

    // Affichage étape 2 pendant que la réponse n'arrive pas
    document.querySelector('.msgoverlay').textContent = "Installation des dépendances, cela peut prendre quelques instants...";

    const result = await res.json();

    if (res.ok) {

      document.querySelector('.msgoverlay').textContent = result.message;
      lienHttp(result)
      setTimeout(() => {
        finload();
      }, 2000);

    } else if (res.status === 402 && result.code === "PAYMENT_REQUIRED") {
      document.querySelector('.msgoverlay').textContent = result.message
      setTimeout(() => {
        finload();
      }, 4000)
    } else {
      document.querySelector('.msgoverlay').textContent = result.message;
      setTimeout(() => {
        finload();
      }, 4000);
    }

  } catch (error) {
    console.error("❌ Erreur réseau ou serveur :", error);
    document.querySelector('.msgoverlay').textContent = "Oops ! Une erreur est survenue lors de la création du site.";
    setTimeout(() => {
      finload();
    }, 4000);
  }
}


function lienHttp(res) {
  if (res.success && res.url) {
    const a = document.querySelector('#http');
    if (a) {
      const fullUrl = res.url.startsWith('http') ? res.url : `http://${res.url}`;
      a.href = fullUrl;
      a.textContent = fullUrl;

      if (document.querySelector('#BuildPics')) {
        document.querySelector('#BuildPics').remove();
      }
    }
  }
}


function load(msg) {

  const overlay = document.createElement('div');
  overlay.classList.add('overlayLoad');
  overlay.style.visibility = "visible";
  overlay.style.opacity = "1"


  const msgoverlay = document.createElement('p')
  msgoverlay.classList.add('msgoverlay')
  msgoverlay.textContent = msg

  overlay.appendChild(msgoverlay)

  // Ajout de l'overlay dans le body
  document.body.appendChild(overlay);
  const button = document.querySelector('.bubbly-button')
  button.style.overflow = 'hidden'
  const t = document.querySelector('#mooveAnim')

  t.style.zIndex = "1"
  t.style.opacity = "1"
  document.querySelector('#logonavbarre').style.opacity = "0"
  const div = document.createElement('div')
  div.classList.add('loaderi')

  const img = document.createElement('img')
  img.src = "/logo/logocoupe.png"
  img.style.width = "auto"
  img.style.height = "58px"
  img.style.borderRadius = "50px"

  const grad = document.createElement('div')
  grad.classList.add('gradload')
  grad.appendChild(img)
  document.querySelector('#admin').appendChild(div)
  document.querySelector('#admin').appendChild(grad)

}

function sendFieldUpdate(field, newValue) {
  load()
  fetch('/api/update-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include', // Pour envoyer les cookies
    body: JSON.stringify({
      field,
      value: newValue
    })
  })
    .then(res => {
      if (!res.ok) {
        finload('Une erreur est survenue')
      };
      return res.json();
    })
    .then(data => {
      finload(data.message);

      let displayValue = data.value;

      if (data.field === 'birthDate' && data.value) {
        const date = new Date(data.value);
        if (!isNaN(date)) {
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          displayValue = `${day}/${month}/${year}`;
        }
      }

      document.querySelector(`#${data.field}`).textContent = displayValue;
      window.clientData[data.field] = data.value; // garde la valeur ISO pour la data interne
    })
    .catch(err => {
      finload("Erreur lors de la mise à jour.")
    });
}

function finload(msg, time) {

  const sec = time ?? 1000

  document.querySelector('.msgoverlay').textContent = msg
  document.querySelector('.loaderi').remove()
  document.querySelector('.gradload').remove()
  document.querySelector('#logonavbarre').style.opacity = "1"
  const button = document.querySelector('.bubbly-button')
  button.style.overflow = 'visible'
  button.classList.add('anima');
  setTimeout(function () {
    button.classList.remove('anima');
    document.querySelector('.overlayLoad').style.visibility = "hidden";
    document.querySelector('.overlayLoad').style.opacity = "0"
    document.querySelector('.overlayLoad').remove()
  }, sec);
}






function setupStripeClientButton() {
  const button = document.getElementById("ActiverStripeClient");

  if (!window.clientData) return;

  const hasStripeAccount = window.clientData.stripeActivated === true;
  const hasValidPack = ['Starter', 'Pro', 'Unlimited'].includes(window.clientData.subscriptionStock);

  if (!hasValidPack) {
    button.textContent = "Activer l'option paiement client";
    button.disabled = true;
    return;
  }

  if (hasStripeAccount) {
    button.textContent = "Accéder au dashboard Stripe";
    button.onclick = async () => {
      load("Vérification de sécurité...");
      const mailRes = await fetch("/api/send-verification-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });

      if (!mailRes.ok) {
        finload("Erreur lors de l’envoi du code.");
        return;
      }

      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0px';
      overlay.style.left = '0px';
      overlay.style.width = '100%';
      overlay.style.height = '100vh';
      overlay.style.zIndex = '100';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      overlay.style.display = 'flex';
      overlay.style.flexDirection = 'column';
      overlay.style.justifyContent = 'center';
      overlay.style.alignItems = 'center';

      const form = document.createElement('div');
      form.className = 'form-subfolder-creat';

      const p = document.createElement('p')
      p.classList.add('pOverlayBack')
      p.style.color = "#fff"
      p.textContent = "Entrez le code de vérification envoyé à votre adresse e-mail";

      const codeContainer = document.createElement('div');
      codeContainer.className = 'code-container';

      const codeInputs = [];
      for (let i = 0; i < 6; i++) {
        const input = document.createElement('input');
        input.className = 'code-input';
        input.setAttribute('type', 'text');
        input.setAttribute('maxlength', '1');
        input.setAttribute('inputmode', 'numeric'); // ou "text" si lettres autorisées
        codeContainer.appendChild(input);
        codeInputs.push(input);
      }

      // Gestion focus automatique
      codeInputs.forEach((input, idx) => {
        input.addEventListener('input', () => {
          if (input.value.length === 1 && idx < codeInputs.length - 1) {
            codeInputs[idx + 1].focus();
          }
        });

        input.addEventListener('keydown', (e) => {
          if (e.key === 'Backspace' && input.value === '' && idx > 0) {
            codeInputs[idx - 1].focus();
          }
        });
      });




      const buttonContainer = document.createElement('div');
      buttonContainer.style.display = 'flex';
      buttonContainer.style.justifyContent = 'center';
      buttonContainer.style.alignItems = 'center';
      buttonContainer.style.gap = '25px';

      const createBtnNew = document.createElement('button');
      createBtnNew.className = 'buttonform';
      createBtnNew.textContent = 'Valider';

      const backgroundBtnDiv = document.createElement('div');
      backgroundBtnDiv.className = 'background-button';

      backgroundBtnDiv.appendChild(createBtnNew)

      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'button-close-subfolder';
      cancelBtn.textContent = 'Annuler';

      // Assemble les éléments
      // backgroundBtnDiv.appendChild(createBtn);
      buttonContainer.appendChild(backgroundBtnDiv);
      buttonContainer.appendChild(cancelBtn);

      const pErr = document.createElement('p')
      pErr.classList.add('errform')
      pErr.style.color = '#ff5151'


      form.appendChild(p);
      form.appendChild(codeContainer);
      form.appendChild(pErr)
      form.appendChild(buttonContainer);

      createBtnNew.addEventListener("click", async () => {

        const code = codeInputs.map(input => input.value).join("");

        if (code.length !== 6) {
          finload()
          pErr.textContent = "Le code est incomplet.";
          return;
        }

        const res = await fetch("/api/verify-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ code })
        });

        const data = await res.json();

        if (!res.ok) {
          finload()
          pErr.textContent = data.error || "Erreur de vérification.";
          return;
        } else {
          finload('Code validé !');
          console.log('code ok');

          fetch("/api/stripe-connect-dashboard", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include" // important pour envoyer les cookies (token)
          })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                overlay.remove()
                window.open(data.url, "_blank");
              } else {
                alert("Erreur lors de la redirection vers Stripe.");
              }
            })
            .catch(err => {
              console.error("Erreur dashboard Stripe :", err);
              alert("Erreur de connexion à Stripe.");
            });
        }


        // 👉 Ici tu peux réutiliser ton système d'overlay avec les 6 inputs + code
        // Une fois le code validé, redirige avec createLoginLink

      });


      overlay.appendChild(form);

      cancelBtn.addEventListener('click', () => {
        overlay.remove();
      });
      // Ajoute au DOM
      document.body.appendChild(overlay);

    };
  } else {
    button.textContent = "Activer l'option paiement client";
    button.onclick = async () => {
      load("Création de votre compte Stripe...");
      const res = await fetch("/api/stripe-connect-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });

      const data = await res.json();
      if (res.ok && data.url) {
        window.open(data.url, "_blank");
        finload("Redirection vers Stripe...");
      } else {
        finload(data.message, 2500);
      }
    };
  }
}









function changePack() {
  document.querySelector('#changePack').addEventListener('click', () => {
    const setupProduit = {
      Starter: {
        prix: "5€",
        stockage: 1,
        estimation: 2000,
        commission: 6,
        name: "Starter"
      },
      Pro: {
        prix: "10€",
        stockage: 5,
        estimation: 10000,
        commission: 3,
        name: "Pro"
      },
      Unlimited: {
        prix: "20€",
        stockage: 30,
        estimation: 60000,
        commission: 0,
        name: "Unlimited"
      }
    };

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100vh';
    overlay.style.zIndex = '2000';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.justifyContent = 'flex-start';
    overlay.style.alignItems = 'center';
    overlay.style.overflowY = 'auto';
    overlay.style.padding = "50px 0";

    document.body.style.overflow = 'hidden';

    const form = document.createElement('div');
    form.className = 'form-subfolder-creat';

    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'center';
    buttonContainer.style.alignItems = 'center';
    buttonContainer.style.gap = '25px';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'button-close-subfolder';
    cancelBtn.textContent = 'Annuler';

    cancelBtn.addEventListener('click', () => {
      overlay.remove();
      document.body.style.overflow = 'auto';
    });

    buttonContainer.appendChild(cancelBtn);
    overlay.appendChild(form);
    document.body.appendChild(overlay);

    for (const packName in setupProduit) {
      const packData = setupProduit[packName];

      const pack = document.createElement('div');
      pack.classList.add('changepackdiv');

      const namePack = document.createElement('h3');
      namePack.style.fontSize = "2rem";
      namePack.style.width = "auto";
      namePack.classList.add('param');
      namePack.textContent = packName;

      const prix = document.createElement('p');
      prix.classList.add('pOverlayBack');
      prix.style.color = "#fff";
      prix.style.fontSize = "2rem";
      prix.textContent = `${packData.prix}/mois`;

      const ul = document.createElement('ul');

      const li1 = document.createElement('li');
      li1.classList.add('pOverlayBack');


      const p1 = document.createElement('p');
      p1.style.fontSize = "2rem";
      p1.classList.add('param');
      p1.textContent = packData.stockage;

      li1.appendChild(p1);
      li1.append('go de stockage');

      const estim = document.createElement('span');
      estim.textContent = ` (~${packData.estimation} photos)`;
      li1.appendChild(estim);

      const li2 = document.createElement('li');
      li2.classList.add('pOverlayBack');


      const p2 = document.createElement('p');
      p2.style.fontSize = "2rem";
      p2.classList.add('param');
      p2.textContent = packData.commission;

      li2.appendChild(p2);
      li2.append('% de commission');

      const color = document.createElement('p');
      color.classList.add('pOverlayBack');
      color.style.color = "#fff";
      color.textContent = "Couleur";

      const hiddenColorInput = document.createElement('input');
      hiddenColorInput.type = 'hidden';
      hiddenColorInput.name = 'selectedColor';
      hiddenColorInput.value = 'Noir';

      const contentChoicecolor = document.createElement('div');
      contentChoicecolor.classList.add('contentChoiceColorChangePack');

      const bk1 = document.createElement('div');
      bk1.classList.add('background')
      const noir = document.createElement('div');
      noir.style.backgroundColor = "#000";
      noir.id = "choiceColorChangePackNoir";
      noir.style.border = "0.5px solid #fff";
      noir.style.borderRadius = "50%";
      noir.style.width = "30px";
      noir.style.height = "30px";
      noir.style.margin = "2px";
      bk1.appendChild(noir);

      const bk2 = document.createElement('div');
      const blanc = document.createElement('div');
      blanc.id = "choiceColorChangePackBlanc";
      blanc.style.backgroundColor = "#fff";
      blanc.style.border = "0.5px solid #fff";
      blanc.style.borderRadius = "50%";
      blanc.style.width = "30px";
      blanc.style.height = "30px";
      blanc.style.margin = "2px";
      bk2.appendChild(blanc);

      const tabButton = [
        { btn: blanc, coulor: "Blanc", wrapper: bk2, otherWrapper: bk1 },
        { btn: noir, coulor: "Noir", wrapper: bk1, otherWrapper: bk2 }
      ];

      tabButton.forEach(({ btn, coulor, wrapper, otherWrapper }) => {
        btn.addEventListener('click', () => {
          wrapper.classList.add("background");
          otherWrapper.classList.remove("background");
          color.textContent = coulor;
          hiddenColorInput.value = coulor;
        });
      });



      ul.appendChild(li1);
      ul.appendChild(li2);

      pack.appendChild(namePack);
      pack.appendChild(prix);
      pack.appendChild(ul);

      // Logique conditionnelle pour bouton ou message "votre pack actuel"
      if (window.clientData.subscriptionStock === packData.name) {
        // Pré-sélection de la couleur actuelle
        tabButton.forEach(({ coulor, wrapper, otherWrapper }) => {
          if (coulor.toLowerCase() === window.clientData.subscriptionColor.toLowerCase()) {
            wrapper.classList.add("background");
            otherWrapper.classList.remove("background");
            color.textContent = coulor;
            hiddenColorInput.value = coulor;
          }
        });

        const currentPackMsg = document.createElement('p');
        currentPackMsg.classList.add('pOverlayBack');
        currentPackMsg.style.color = "#fff";
        currentPackMsg.style.marginTop = "10px";
        currentPackMsg.textContent = "Votre pack actuel";

        pack.appendChild(color);
        pack.appendChild(contentChoicecolor);
        pack.appendChild(hiddenColorInput);
        pack.appendChild(currentPackMsg);

      } else {

        contentChoicecolor.appendChild(bk1);
        contentChoicecolor.appendChild(bk2);
        const createBtnNew = document.createElement('button');
        createBtnNew.className = 'buttonform';
        createBtnNew.textContent = 'Choisir';


        const backgroundBtnDiv = document.createElement('div');
        backgroundBtnDiv.className = 'background-button';

        backgroundBtnDiv.appendChild(createBtnNew);

        createBtnNew.addEventListener('click', () => {
          const selectedColor = hiddenColorInput.value;
          const selectedPack = packData.name;

          const planPriority = {
            Starter: 1,
            Pro: 2,
            Unlimited: 3
          };

          const currentPlan = window.clientData.subscriptionStock; // exemple: "starter"
          const targetPlan = packData.name;                 // exemple: "pro"

          const isUpgrade = planPriority[targetPlan] > planPriority[currentPlan];
          const isDowngrade = planPriority[targetPlan] < planPriority[currentPlan];



          const sousoverlay = document.createElement('div')
          sousoverlay.style.position = 'fixed';
          sousoverlay.style.top = '0';
          sousoverlay.style.left = '0';
          sousoverlay.style.width = '100%';
          sousoverlay.style.height = '100vh';
          sousoverlay.style.zIndex = '2001';
          sousoverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
          sousoverlay.style.display = 'flex';
          sousoverlay.style.flexDirection = 'column';
          sousoverlay.style.justifyContent = 'center';
          sousoverlay.style.alignItems = 'center';
          sousoverlay.style.overflowY = 'auto';
          sousoverlay.style.padding = "50px 0";

          const sousform = document.createElement('div');
          sousform.className = 'form-subfolder-creat';

          const sousbuttonContainer = document.createElement('div');
          sousbuttonContainer.style.display = 'flex';
          sousbuttonContainer.style.justifyContent = 'center';
          sousbuttonContainer.style.alignItems = 'center';
          sousbuttonContainer.style.gap = '25px';

          const souscancelBtn = document.createElement('button');
          souscancelBtn.className = 'button-close-subfolder';
          souscancelBtn.textContent = 'Annuler';

          souscancelBtn.addEventListener('click', () => {
            sousoverlay.remove();

          });

          const souscreateBtnNew = document.createElement('button');
          souscreateBtnNew.className = 'buttonform';
          souscreateBtnNew.textContent = 'Valider';

          souscreateBtnNew.addEventListener('click', async () => {
            overlay.style.zIndex = "88"
            sousoverlay.style.zIndex = "89"
            load('Changement en cours... ')
            try {
              const response = await fetch('/api/changePack', {
                method: 'POST',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  newPack: packData.name, // par ex: "pro"
                  newColor: hiddenColorInput.value
                })
              });

              const result = await response.json();

              if (response.ok) {



                if (result.url) {
                  localStorage.setItem("pendingPack", packData.name);
                  localStorage.setItem("pendingColor", hiddenColorInput.value);

                  window.open(result.url, "_blank");
                  window.addEventListener("message", (event) => {

                    if (event.data.stripeSuccess) {
                      document.querySelector('.msgoverlay').textContent = "🎉 Paiement validé ! Votre pack est en cours de mise à jour. Cela peut prendre quelques instants...";

                      const pendingPack = localStorage.getItem("pendingPack");
                      const pendingColor = localStorage.getItem("pendingColor");

                      if (!pendingPack || !pendingColor) {
                        console.log("❌ Données manquantes dans localStorage");
                        finload("Une erreur est survenue... Veuillez réessayer ou contacter le support.", 3000);

                        return;
                      }

                      fetch("/api/stripe/upgrade-confirmation", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json"
                        },
                        credentials: "include",
                        body: JSON.stringify({
                          newPack: pendingPack,
                          newColor: pendingColor
                        })
                      })
                        .then(res => res.json())
                        .then(data => {
                          if (data.success) {
                            finload("Tout est prêt ! Vous pouvez désormais profiter de votre nouveau pack.", 2500);
                            overlay.remove()
                            sousoverlay.remove()
                            localStorage.removeItem("pendingPack");
                            localStorage.removeItem("pendingColor");
                            // goback();
                          }
                        });
                    }
                  });


                } else {
                  finload("Tout est prêt ! Vous pouvez désormais profiter de votre nouveau pack.", 2500);
                  overlay.remove()
                  sousoverlay.remove()
                }


              } else {
                finload(result.message, 3000)
                setTimeout(() => {
                  overlay.style.zIndex = "2000"
                  sousoverlay.style.zIndex = "2001"
                }, 3000);
              }
            } catch (error) {
              console.error('Erreur réseau :', error);
              finload("Une erreur est survenue. Veuillez réessayer.", 2500);
              setTimeout(() => {
                overlay.style.zIndex = "2000"
                sousoverlay.style.zIndex = "2001"
              }, 2500);
            }
          });



          // Ligne 1 : intro
          const line1 = document.createElement('p');
          line1.classList.add('pOverlayBack');
          line1.style.color = "#fff";
          line1.textContent = `Vous allez passer de ${window.clientData.subscriptionStock} (couleur ${window.clientData.subscriptionColor}) à ${selectedPack} (couleur ${selectedColor}).`;
          sousform.appendChild(line1);

          // Ligne 2+ : détails selon type
          if (isUpgrade) {
            const line2 = document.createElement('p');

            line2.classList.add('pOverlayBack');
            line2.style.color = "#fff";
            line2.textContent = "Le changement sera immédiat et le prorata sera facturé aujourd’hui.";
            const line3 = document.createElement('p');
            line3.style.color = "#fff";
            line3.textContent = "Les nouvelles fonctionnalités seront débloquées immédiatement.";
            sousform.appendChild(line2);
            sousform.appendChild(line3);
          } else if (isDowngrade) {
            const line2 = document.createElement('p');
            line2.classList.add('pOverlayBack');
            line2.style.color = "#fff";
            line2.textContent = "Le changement prendra effet à la fin de votre période actuelle.";
            const line3 = document.createElement('p');
            line3.classList.add('pOverlayBack');
            line3.style.color = "#fff";
            line3.textContent = "Vous conservez les options de votre pack actuel jusqu’à cette date.";
            sousform.appendChild(line2);
            sousform.appendChild(line3);
          } else {
            const line2 = document.createElement('p');
            line2.classList.add('pOverlayBack');
            line2.style.color = "#fff";
            line2.textContent = "Vous êtes déjà sur ce plan. Seule la couleur sera modifiée.";
            sousform.appendChild(line2);
          }


          const sousbackgroundBtnDiv = document.createElement('div');
          sousbackgroundBtnDiv.className = 'background-button';

          sousbackgroundBtnDiv.appendChild(souscreateBtnNew)
          sousbuttonContainer.appendChild(souscancelBtn)
          sousbuttonContainer.appendChild(sousbackgroundBtnDiv)
          sousform.appendChild(sousbuttonContainer)

          sousoverlay.appendChild(sousform)
          document.body.appendChild(sousoverlay)

        });

        pack.appendChild(color);
        pack.appendChild(contentChoicecolor);
        pack.appendChild(hiddenColorInput);
        pack.appendChild(backgroundBtnDiv);
      }

      form.appendChild(pack);
    }

    form.appendChild(buttonContainer);
  });
}
