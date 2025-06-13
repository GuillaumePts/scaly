function initInfiniteScroll() {
    const images = [
        "White/1742805143259-210.webp",
        "White/1742805143259-402.webp",
        "White/1742805143259-478.webp",
        "White/1742805143260-451.webp",
        "White/1742805143260-512.webp",
        "White/1742805143260-733.webp"
    ];

    let indexSubcat = 0;
    let indexMansory = 0;

    const subcat = document.querySelector('#subcategoryclient');
    const mansory = document.querySelector('#imgsMansory');
    const sentinelSubcat = document.querySelector('#sentinel-subcat');
    const sentinelMansory = document.querySelector('#sentinel-mansory');

    function loadMoreImages(type) {
        if (type === 'subcat') {
            const container = subcat;
            const sentinel = sentinelSubcat;

            for (let i = 0; i < 3; i++) {
                const imgIndex = indexSubcat % images.length;

                const div = document.createElement('div');
                div.classList.add('subcategoryclient-b');

                const img = document.createElement('img');
                img.className = "animphoto visible";
                img.loading = "lazy";
                img.decoding = "async";
                img.src = images[imgIndex];

                div.appendChild(img);
                container.insertBefore(div, sentinel);

                indexSubcat++;
            }
        }

        if (type === 'mansory') {
            const container = document.querySelector('#imgsMansory .imgsMansory');

            for (let i = 0; i < 3; i++) {
                const imgIndex = indexMansory % images.length;

                const img = document.createElement('img');
                img.loading = "lazy";
                img.decoding = "async";
                img.src = images[imgIndex];
                img.style = "width: 100%; height: auto; box-shadow: rgba(0, 0, 0, 0.11) 0px 0px 20px; margin-bottom: 2px; break-inside: avoid;";
                img.classList.add('visible');

                container.appendChild(img);

                indexMansory++;
            }
        }
    }

    if (subcat && sentinelSubcat) {
        const observerSubcat = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting && subcat.classList.contains('visible')) {
                    loadMoreImages('subcat');
                }
            });
        }, { root: subcat, rootMargin: '0px', threshold: 1 });

        observerSubcat.observe(sentinelSubcat);
    }

    if (mansory && sentinelMansory) {
        const observerMansory = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting && mansory.classList.contains('visible')) {
                    loadMoreImages('mansory');
                }
            });
        }, { root: mansory, rootMargin: '0px', threshold: 1 });

        observerMansory.observe(sentinelMansory);
    }
}



function gestionCarrou() {
    const items = document.querySelectorAll('.carousel__item');
    let current = 0;

    // Pour ajouter la transition
    items.forEach(item => {
        item.style.transition = 'transform 0.6s ease';
    });

    function updateClasses() {
        items.forEach((item, index) => {
            item.classList.remove('left', 'right', 'active');

            if (index === current) {
                item.classList.add('active');
            } else if (index === (current - 1 + items.length) % items.length) {
                item.classList.add('left');
            } else if (index === (current + 1) % items.length) {
                item.classList.add('right');
            }
        });
    }

    function next() {
        current = (current + 1) % items.length;
        updateClasses();
    }

    function prev() {
        current = (current - 1 + items.length) % items.length;
        updateClasses();
    }

    // Gestion du swipe (touch mobile)
    let startX = 0;

    document.querySelector('.carousel').addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
    });

    document.querySelector('.carousel').addEventListener('touchend', e => {
        const endX = e.changedTouches[0].clientX;
        const diff = endX - startX;

        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                prev(); // swipe droite → gauche
            } else {
                next(); // swipe gauche → droite
            }
        }
    });

    // Init
    updateClasses();
}




(() => {


    const target = document.querySelector('.titless');
    const whiteBox = document.querySelector('.choice-box.white');
    const blackBox = document.querySelector('.choice-box.black');
    const buttons = document.querySelectorAll('.animebutton');

    let timeout;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                whiteBox.classList.add('active');
                blackBox.classList.add('active');

                // Petite pause pour laisser les box se positionner
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    buttons.forEach(btn => btn.classList.add('translatebuttoncolor'));
                }, 400);

            } else {
                whiteBox.classList.remove('active');
                blackBox.classList.remove('active');


                // Retire immédiatement la classe pour permettre une relecture plus tard
                buttons.forEach(btn => btn.classList.remove('translatebuttoncolor'));
            }
        });
    }, { threshold: 0.5 });

    observer.observe(target);

    function preloadImages(colors) {
        for (const name in colors) {
            const img = new Image();
            img.src = `/${name}/${name}back.jpg`;
        }
    }

    document.querySelector('#blanchoisi').addEventListener('click', () => {
        document.querySelectorAll('.slogan').forEach(el => {
            el.style.display = "none"
        })

        document.querySelector('.titless').style.display = "none"

        document.querySelectorAll('.animebuttoncontent').forEach(el => {
            el.style.display = "none"
        })

        document.querySelector('.white').style.height = 'auto'
        document.querySelector('.white').style.minHeight = '100vh'
        document.querySelector('.black').style.height = '0vh'

        document.querySelector('.choice-box').style.padding = '0'

        document.querySelector('#blancontent').style.display = "flex"

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    document.querySelector('#choicepackblanc').classList.add('active')
                    document.querySelectorAll('.layout').forEach(el=>{
                        el.classList.add('active')
                    })
                    document.querySelectorAll('.scrollgalerie').forEach(el=>{
                        el.classList.add('active')
                        
                    })
                    document.querySelectorAll('.layout').forEach(el =>{
                        el.addEventListener('click',()=>{
                            document.querySelector('#imgsMansory').classList.toggle('visible')
                            document.querySelector('#subcategoryclient').classList.toggle('visible')
                            initInfiniteScroll()
                        })
                    })
                } else {
                    entry.target.classList.remove('active');
                    document.querySelector('#choicepackblanc').classList.remove('active')
                    document.querySelectorAll('.layout').forEach(el=>{
                        el.classList.remove('active')
                    })
                    document.querySelectorAll('.scrollgalerie').forEach(el=>{
                        el.classList.remove('active')
                    })
                }
            });
        }, {
            threshold: 0.5
        });

        document.querySelectorAll('.normal').forEach(el => observer.observe(el));

        gestionCarrou()
        initInfiniteScroll()


        document.querySelector('.returncontent').addEventListener('click', () => {
            document.querySelector('#menupics').click()
        })
    })

    document.querySelector('#noirchoisi').addEventListener('click', () => {
        document.querySelectorAll('.slogan').forEach(el => {
            el.style.display = "none"
        })

        document.querySelector('.titless').style.display = "none"

        document.querySelectorAll('.animebuttoncontent').forEach(el => {
            el.style.display = "none"
        })

        document.querySelector('.black').style.height = 'auto'
        document.querySelector('.black').style.minHeight = '100vh'
        document.querySelector('.white').style.height = '0vh'

        document.querySelector('.choice-box').style.padding = '0'

        document.querySelector('#noircontent').style.display = "flex"

        gestionCarrou()

        document.querySelectorAll('.returncontent').forEach(el => {
            el.addEventListener('click', () => {
                document.querySelector('#menupics').click()
            })
        })

    })


















































































































    document.querySelector('#selectPack').addEventListener('change', () => {

        document.querySelector('#pack').textContent = document.querySelector('#selectPack').value

        if (document.querySelector('#selectPack').value === "Starter") {
            document.querySelector('#prixpack').textContent = "5"
            document.querySelector('#customchoice').textContent = ""
            document.querySelector('#stockagePack').textContent = "1go de Stockage"

        } else if (document.querySelector('#selectPack').value === "Pro") {

            document.querySelector('#prixpack').textContent = "10"
            document.querySelector('#stockagePack').textContent = "5go de Stockage"
            document.querySelector('#customchoice').textContent = "* Gestion de paiment"


        } else if (document.querySelector('#selectPack').value === "Unlimited") {

            document.querySelector('#prixpack').textContent = "29"
            document.querySelector('#stockagePack').textContent = "Stockage Illimité"
            document.querySelector('#customchoice').textContent = "* Gestion de paiment"

        } else {

            document.querySelector('#prixpack').textContent = "9"
            document.querySelector('#stockagePack').textContent = "5go de Stockage"
            document.querySelector('#customchoice').textContent = "* Gestion de paiment"

        }
    })

    setupProduit()
    function setupProduit() {

        const obj = {
            Blanc: ['#eee', '#fff'],
            Noir: ['#000', '#fff'],
            // Vert: ['#a9d1ba', '#00ff97'],
            // Rose: ['#ffd0d6', '#ff0021']
        };
        preloadImages(obj);

        const tabbuttoncolor = document.querySelectorAll('.colorBubble')

        tabbuttoncolor.forEach(button => {
            button.addEventListener('click', () => {

                const name = button.id; // l'id correspond à la clé de l'objet
                const [color, neon] = obj[name];
                choiceColor(name, color, neon);
            });
        });
    }



    function choiceColor(name, color, neon) {

        document.querySelector('#colorSelect').value = name
        document.querySelector('#conf').style.backgroundColor = color;
        document.querySelector('#colorResult').textContent = name

        if (color === "#eee") {
            document.querySelector('#conf').style.color = "#666"

            document.querySelector('#colorResult').style.color = "#fff"

            document.querySelector('#pack').style.color = "#fff"
            document.querySelector('#selectPack').style.color = "#666"
            document.querySelector('#selectPack').style.border = "2px solid #666"
            document.querySelector('.barre').style.backgroundColor = "#666"
            document.querySelector('#formulaire').style.textShadow = "0px 0px 10px #fff, 0px 0px 20px #000000"
            document.querySelector('#formulaire').style.color = "#fff"
            document.querySelector('#formulaire').style.backgroundColor = color

        } else {
            document.querySelector('#conf').style.color = "#fff"

            document.querySelector('#selectPack').style.color = "#fff"
            document.querySelector('#selectPack').style.border = "2px solid #fff"

            document.querySelector('#pack').style.color = "#fff"
            document.querySelector('.barre').style.backgroundColor = "#fff"

            document.querySelector('#formulaire').style.color = "#fff"

            document.querySelector('#formulaire').style.backgroundColor = color
        }
        // document.querySelector('#form').style.backgroundColor = color;
        // document.querySelector('#form').style.backgroundImage = `url(/${name}/${name}back.jpg)`;
        // Modifier la variable CSS pour le ::before

        document.documentElement.style.setProperty('--inputform2', color);

        const tabimg = document.querySelectorAll('.backimg');
        tabimg.forEach(img => {
            img.style.display = (img.id === name) ? "block" : "none";
        });
    }

    document.querySelector('#formulaire').addEventListener('click', () => {
        document.querySelector('#infogeneral').style.display = "flex"
        document.querySelector('#infogeneral').scrollIntoView({ behavior: "smooth" })

        document.getElementById("submit-button").addEventListener("click", function (event) {
            event.preventDefault(); // Empêche l'envoi du formulaire si erreurs
            load()

            const fields = [
                { id: "nom", regex: /^[A-Z][a-zA-Z\s-]{1,49}$/, message: "Le nom doit commencer par une majuscule et ne contenir que des lettres." },
                { id: "prenom", regex: /^[A-Z][a-zA-Z\s-]{1,49}$/, message: "Le prénom doit commencer par une majuscule et ne contenir que des lettres." },
                { id: "date", customValidation: validateAge, message: "Vous devez avoir au moins 18 ans." },
                { id: "adresse", regex: /^.{5,}$/, message: "L'adresse doit contenir au moins 5 caractères." },
                { id: "ville", regex: /^[A-Za-z\s-]{2,50}$/, message: "La ville ne doit contenir que des lettres." },
                { id: "code_postal", regex: /^[0-9]{5}$/, message: "Le code postal doit contenir exactement 5 chiffres." },
                { id: "mail", regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "L'adresse e-mail n'est pas valide." },
                { id: "tel", regex: /^[0-9]{10,15}$/, message: "Le numéro de téléphone doit contenir entre 10 et 15 chiffres." },
                { id: "password", regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/, message: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial." },
                { id: "passwordconfirme", customValidation: validatePasswordMatch, message: "Les mots de passe ne correspondent pas." }
            ];

            let isValid = true;

            fields.forEach(field => {
                const input = document.getElementById(field.id);
                const errorElement = input.nextElementSibling;
                const value = input.value.trim();

                if (!value) {
                    showError(input, errorElement, "Ce champ est obligatoire.");
                    isValid = false;

                    return;
                }

                if (field.regex && !field.regex.test(value)) {
                    showError(input, errorElement, field.message);
                    isValid = false;

                    return;
                }

                if (field.customValidation && !field.customValidation(value)) {
                    showError(input, errorElement, field.message);
                    isValid = false;

                    return;
                }

                clearError(input, errorElement);
            });

            if (isValid) {
                sendData();
            }
        });
    })




    function showError(input, errorElement, message) {
        input.style.border = "1px solid red";
        errorElement.style.color = "red";
        errorElement.textContent = message;
        finload()
    }

    function clearError(input, errorElement) {
        input.style.border = "";
        errorElement.textContent = "";
    }

    function validateAge(date) {
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();

        return age > 18 || (age === 18 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)));
    }

    function validatePasswordMatch() {
        return document.getElementById("password").value === document.getElementById("passwordconfirme").value;
    }

    function sendData() {
        const formData = {
            nom: document.getElementById("nom").value,
            prenom: document.getElementById("prenom").value,
            date: document.getElementById("date").value,
            adresse: document.getElementById("adresse").value,
            ville: document.getElementById("ville").value,
            code_postal: document.getElementById("code_postal").value,
            email: document.getElementById("mail").value,
            tel: document.getElementById("tel").value,
            password: document.getElementById("password").value,
            subscriptionProduct: "Pic's",
            subscriptionColor: document.querySelector("#colorSelect").value.trim(),
            subscriptionStock: document.querySelector('#selectPack').value.trim()

        };


        fetch('/api/inscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        })
            .then(response => response.json())
            .then(result => {

                document.querySelector('#infogeneral').style.display = "none"
                finload()
                if (result.success) {
                    backouvert()
                    document.querySelector('#paiementformSuccess').style.display = "flex"

                    document.querySelector('.msgInscription').textContent = result.message
                    const animation = lottie.loadAnimation({
                        container: document.getElementById('successAnim'),
                        renderer: 'svg',
                        loop: false,
                        path: 'https://lottie.host/d99f75f6-8318-40ba-bd21-ac606447461d/2jYXatUDsD.json'
                    });

                    animation.addEventListener('enterFrame', (e) => {
                        if (e.currentTime >= 35) {
                            animation.pause();
                        }
                    });

                    setTimeout(() => {
                        animation.play();
                    }, 750);

                    document.querySelector('#buyyy').addEventListener('click', async () => {
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
                                console.error("❌ Erreur : Pas d'URL reçue");
                                finload();
                            }
                        } catch (err) {
                            console.error("Erreur lors du lancement de Stripe :", err);
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
                                            finload()
                                            console.log("✅ Abonnement activé côté serveur");
                                            goback()
                                        }
                                    });

                            } else {
                                finload()
                                console.log("❌ Paiement annulé.");
                                goback()
                            }
                        });
                    })




                } else {
                    document.querySelector('#paiementformEchec').style.display = "flex"
                    document.querySelector('.msgInscription').textContent = result.message
                    const animation2 = lottie.loadAnimation({
                        container: document.getElementById('echecAnim'),
                        renderer: 'svg',
                        loop: false,

                        path: 'https://lottie.host/69f97ca7-5f47-4f94-8d08-a53df1ac6abb/F4eaq13Ok1.json'
                    });

                    animation2.addEventListener('enterFrame', (e) => {
                        if (e.currentTime >= 21) {
                            animation2.pause();
                        }
                    });

                    setTimeout(() => {
                        animation2.play();
                    }, 750);


                    document.querySelector('#retour').addEventListener('click', () => {

                        document.getElementById('echecAnim').textContent = ""
                        document.querySelector('#paiementformEchec').style.display = "none"
                        document.querySelector('#infogeneral').style.display = "flex"
                    })
                }
            })
            .catch(error => {
                console.log(error);
                document.querySelector('#infogeneral').style.display = "none"
                document.querySelector('#paiementformEchec').style.display = "flex"
                document.querySelector('.msgInscription').textContent = "Oops, une erreur est survenu de notre coté"
                const animation2 = lottie.loadAnimation({
                    container: document.getElementById('echecAnim'),
                    renderer: 'svg',
                    loop: false,

                    path: 'https://lottie.host/69f97ca7-5f47-4f94-8d08-a53df1ac6abb/F4eaq13Ok1.json'
                });

                animation2.addEventListener('enterFrame', (e) => {
                    if (e.currentTime >= 21) {
                        animation2.pause();
                    }
                });

                setTimeout(() => {
                    animation2.play();
                }, 750);
            });

    }





    function load() {

        const overlay = document.createElement('div');
        overlay.classList.add('overlayLoad');
        overlay.style.visibility = "visible";
        overlay.style.opacity = "1"
        console.log(overlay);

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

    function finload() {
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
        }, 700);
    }


    function backouvert() {

        document.querySelector('#divlock').style.display = "none"
        document.querySelector('#unlock').style.display = "flex"

    }



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

    function loadUnlock() {
        document.querySelector('#charging').style.display = "flex"

        if (document.querySelector('#clientjs')) {
            document.querySelector('#clientjs').remove()
        }
        if (document.querySelector('#cssclient')) {
            document.querySelector('#cssclient').remove()
        }

        const script = document.createElement('script')
        script.id = "clientjs"
        script.src = "/js/client.js"
        document.body.appendChild(script)

        const link = document.createElement("link");
        link.id = "cssclient";
        link.rel = "stylesheet";
        link.href = "/css/client.css";
        document.head.appendChild(link);

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




})()