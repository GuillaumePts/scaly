



///////////////////////////////////////////////////////
// FORMULAIRE DE CONNEXION ///////////////////////////
/////////////////////////////////////////////////////


(() => {
    const lebutton = document.querySelector('#submit-button');
    const inputpass = document.querySelector('#password');
    const inputid = document.querySelector('#id');
    const lock = document.querySelector('#divlock');
    const unlock = document.querySelector('#unlock')

    document.getElementById('submit-button').addEventListener('click', async function () {
        load("Connexion ...")
        const email = document.getElementById('id').value;
        const password = document.getElementById('password').value;

        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });

        const data = await response.json();
        if (response.ok) {
            finload("",500)
            goback()

        } else {
            finload(data.message, 2000)

        }
    });


    function goback() {
        const script = document.createElement('script')
        script.id = "clientjs"
        script.src = "/js/client.js"
        document.body.appendChild(script)

        const link = document.createElement("link");
        link.id = "cssclient";
        link.rel = "stylesheet";
        link.href = "/css/client.css";
        document.head.appendChild(link);

        document.querySelector('#divlock').style.display = "none"
        document.querySelector('#unlock').style.display = "flex"

        document.querySelector('#charging').style.display = "flex"

        fetch("/api/dashboard", {
            method: "GET",
            credentials: "include"
        })
            .then(res => {
                if (res.ok) {
                    return res.text(); // On récupère le HTML dans ce cas
                } else {
                    return res.json(); // Sinon, on tente de récupérer un message d'erreur JSON
                }
            })
            .then(data => {

                document.querySelector('#main-content').textContent = ''

                if (typeof data === "string") {
                    // Si on reçoit du texte, cela signifie probablement qu'on a une page HTML
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(data, "text/html");

                    // Ajoute chaque enfant du <body> à #main-content
                    Array.from(doc.body.children).forEach(child => {
                        document.querySelector('#main-content').appendChild(child);
                    });


                } else {
                    // Si c'est un objet JSON, on gère l'erreur
                    document.querySelector('#charging').style.display = "none"
                    console.error(data.message);
                }
            })
            .catch((err) => {
                console.log("Erreur : ", err);
            });


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


    function ecouteOeil(nv, v) {
        // Supprime l'écouteur d'événement avant modification
        document.querySelector(`#${nv}`).removeEventListener("click", togglePasswordVisibility);

        // Changer l'affichage des icônes
        document.querySelector(`#${nv}`).style.display = "none";
        document.querySelector(`#${v}`).style.display = "block";

        // Ajouter l'écouteur d'événement sur la nouvelle icône
        document.querySelector(`#${v}`).addEventListener("click", togglePasswordVisibility);

        // Changer le type du champ mot de passe
        document.querySelector("#password").type = v === "notview" ? "text" : "password";
    }

    // Fonction intermédiaire pour gérer le clic
    function togglePasswordVisibility() {
        const isHidden = document.querySelector("#password").type === "password";
        ecouteOeil(isHidden ? "view" : "notview", isHidden ? "notview" : "view");
    }

    // Ajout de l'écouteur de base
    document.querySelector("#view").addEventListener("click", togglePasswordVisibility);


    document.getElementById('resetpassword').addEventListener('click', async () => {
        const email = document.getElementById('id').value.trim();

        if (!email) {
            document.querySelector('.err').textContent = "Merci de renseigner votre adresse e-mail avant de cliquer sur 'Mot de passe oublié'.";
            return;
        }

        load('Vérification ...')

        try {
            const res = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                finload("Si cette adresse est enregistrée, un lien de réinitialisation vous a été envoyé.",3000);
            } else {
                finload(data.message, 3000);
            }
        } catch (err) {
            finload("Erreur de connexion au serveur.", 3000);
        }
    });

})()


