



///////////////////////////////////////////////////////
// FORMULAIRE DE CONNEXION ///////////////////////////
/////////////////////////////////////////////////////


(() => {
    const lebutton = document.querySelector('#submit-button');
    const inputpass = document.querySelector('#password');
    const inputid = document.querySelector('#id');
    const lock = document.querySelector('#divlock');
    const unlock = document.querySelector('#unlock')

    lebutton.addEventListener('click', (event) => {
        event.preventDefault();


        if (inputpass.value && inputid.value) {

            inputid.style.border = "none"
            inputpass.style.border = "none"
            inputid.style.color = "#000"
            inputpass.style.color = "#000"
            const data = {
                pass: inputpass.value,
                id: inputid.value
            }
            const url = '/connexion'

            postData(url, data);
        } else {
            inputid.style.color = "red";
            inputid.style.border = "3px solid red"
            inputpass.style.color = "red";
            inputpass.style.border = "3px solid red"
        }
    })

    window.addEventListener('message', async (event) => {
        if (event.data === 'payment-success' || event.data === 'payment-canceled') {
            document.querySelector('.msgoverlay').textContent = 'Vérification du paiement...';

            try {
                const response = await fetch('/check-payment-status', {
                    method: 'GET',
                    credentials: 'include' // <-- Ajout ici pour envoyer les cookies
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.html) {

                        finload('Paiement confirmé !', 1000);
                        goClient(result.html)

                        unlock.addEventListener('click', () => {
                            const cssS = document.querySelectorAll('.dynamic-css')
                            cssS.forEach(css => {
                                css.media = "none"
                            })
                            goClient(result.html)
                        })
                        // Ici tu fais ce qu’il faut côté UI pour débloquer l’accès
                    } else {
                        finload('Paiement non confirmé, veuillez réessayer', 2000);
                        // Afficher message d’erreur etc.
                    }
                } else {
                    finload('Erreur serveur lors de la vérification', 2000);
                }
            } catch (err) {
                console.error(err);
                finload('Erreur réseau lors de la vérification', 2000);
            }
        }
    });




    // Fonction pour envoyer des données via POST
    async function postData(url, data) {
        load('')
        try {
            const response = await fetch(url, {
                method: 'POST', // Méthode HTTP
                headers: {
                    'Content-Type': 'application/json' // Indique que le corps de la requête est en JSON
                },
                credentials: 'include',
                body: JSON.stringify(data) // Conversion des données en chaîne JSON
            });

            if (!response.ok) {
                finload('L\'identifiant ou la clé fournie est invalide', 2000)
            }


            const result = await response.json(); // Analyse de la réponse
            unlock.style.display = "flex"
            lock.style.display = 'none'

            window.packClient = window.packClient || result.pack
            window.paiementaccept = window.paiementaccept || result.paiementaccept


            if (result.session === "admin") {
                if (result.html) {
                    finload("",1000)
                    unlock.style.display = "flex"
                    lock.style.display = 'none'
                    creatJsEtCssBack()
                    goBack(result.html)

                    unlock.addEventListener('click', () => {
                        const cssS = document.querySelectorAll('.dynamic-css')
                        cssS.forEach(css => {
                            css.media = "none"
                        })
                        creatJsEtCssBack()
                        goBack(result.html)
                        if (document.querySelector('#navbackcontentButton')) {
                            document.querySelector('#navbackcontentButton').style.transform = 'translateX(0)'
                        }
                    })

                }

            } else if (result.session === "client") {

                if (result.action) {

                    document.querySelector('.msgoverlay').textContent ='Redirection vers paiement ...'

                    return fetch('/create-checkout-session-cc', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ action: result.action })
                    })
                        .then(res => res.json())
                        .then(data => {
                            if (data.url) {
                                window.open(data.url, '_blank');
                                // Ouvre Stripe Checkout dans un nouvel onglet
                            } else {
                                finload(data.error, 2000)
                            }
                        })
                        .catch(err => {
                            finload('Erreur lors de la création de la session Stripe :', 2000);
                            console.log(err);
                        });
                } else {

                    if (result.html) {
                        finload('',1000)
                        // Si pas d'action → accès au contenu
                        console.log("je rentre ici")
                        unlock.style.display = "flex"
                        lock.style.display = 'none'
                        goClient(result.html)
                        console.log(result.html);
                        unlock.addEventListener('click', () => {
                            const cssS = document.querySelectorAll('.dynamic-css')
                            cssS.forEach(css => {
                                css.media = "none"
                            })
                            goClient(result.html)
                        })
                    }

                }



            } else {

                finload(result.message, 2000)
            }

        } catch (error) {
            console.log(error);

            finload(error,2000)
        }

    }



    function creatJsEtCssBack() {
        const js = document.createElement('script');
        js.src = 'js/back.js'
        js.id = "backjs"
        const body = document.querySelector('body')
        body.appendChild(js)
        const jsbackpage = document.createElement('script');
        jsbackpage.src = 'js/backAccueil.js';
        jsbackpage.id = 'scriptBackPage';
        body.appendChild(jsbackpage);

        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = 'css/back.css';
        css.classList.add('dynamic-css')
        css.id = "cssback";
        const head = document.querySelector('head')
        head.appendChild(css)

    }



    function goBack(html) {

        document.querySelector('#charging').style.opacity = "1"
        document.querySelector('#charging').style.display = "flex"

        document.querySelector('#lock').media = "none";

        const mainContent = document.querySelector('#main-content')
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        mainContent.textContent = '';
        Array.from(doc.body.childNodes).forEach(node => {
            mainContent.appendChild(node)
        });

        setTimeout(() => {
            document.querySelector('#charging').style.opacity = "0"
            document.querySelector('#charging').style.display = "none"
        }, 1000);

    }

    function goClient(html) {
        document.querySelector('#charging').style.opacity = "1"
        document.querySelector('#charging').style.display = "flex"

        document.querySelector('#lock').media = "none";

        const mainContent = document.querySelector('#main-content')
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        mainContent.textContent = '';
        Array.from(doc.body.childNodes).forEach(node => {
            mainContent.appendChild(node)
        });
        const script = document.createElement('script')
        script.src = '/js/client.js';
        script.id = "client"
        document.body.appendChild(script)

        setTimeout(() => {
            document.querySelector('#charging').style.opacity = "0"
            document.querySelector('#charging').style.display = "none"
        }, 1000);
    }






    function resOverlay(msg, err) {
        const overlay = document.createElement('div');
        overlay.classList.add('overlayy');
        const p = document.createElement('p')
        p.classList.add("poverlay")
        if (err) {
            p.style.color = "red"
        } else {
            p.style.color = "#5babff"
        }
        p.textContent = msg

        // Création du contenu de l'overlay
        const overlayContent = document.createElement('div');
        overlayContent.classList.add('overlay-content');
        overlayContent.style.margin = "0px 10px"
        overlayContent.appendChild(p)

        overlay.addEventListener('click', () => {
            overlay.style.opacity = "0";
            overlay.style.visibility = "hidden";
            setTimeout(() => overlay.remove(), 300); // Supprime après animation
        });

        // Applique l'animation d'apparition
        setTimeout(() => {
            overlay.style.opacity = "1";
            overlay.style.visibility = "visible";
        }, 10);
        // Ajout du contenu dans l'overlay
        overlay.appendChild(overlayContent);

        // Ajout de l'overlay dans le body
        document.body.appendChild(overlay);
        setTimeout(() => {
            overlay.remove()
        }, 5000);
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

    function finload(msg,time) {

        console.log(time)
        

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
        }, time);
    }


    window.addEventListener('message', (event) => {
        if (event.data && event.data.stripeSuccess !== undefined) {
            if (event.data.stripeSuccess) {
                finload("✅ Paiement client réussi",1000);
                // Afficher une galerie débloquée, message, etc.
            } else {
                finload("❌ Paiement annulé",2000);
                // Afficher un message d’erreur ou garder l’accès verrouillé
            }
        }
    });



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


})()


