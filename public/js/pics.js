


(()=>{
    document.querySelector('#colors').addEventListener('click', () => {
        const obj = {
            Blanc: ['#eee', '#fff'],
            Noir: ['#000', '#fff'],
            Vert: ['#b7d0b1', '#00ff1a'],
            Rose: ['#ffd0d6', '#ff0021']
        };
    
        const container = document.createElement('div');
        container.style.backgroundColor = '#fff';
        container.style.padding = '20px';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '10px';
        container.style.borderRadius = '10px';
        container.style.boxShadow = '0px 0px 10px rgba(0,0,0,0.1)';
    
        const overlay = document.createElement('div');
        overlay.classList.add('overlayy');
    
        // Création du contenu de l'overlay
        const overlayContent = document.createElement('div');
        overlayContent.classList.add('overlay-content');
    
        overlay.appendChild(overlayContent);
        overlayContent.appendChild(container);
    
        document.body.appendChild(overlay);
        overlay.style.visibility = "visible";
        overlay.style.opacity = "1";
    
        for (const [name, colors] of Object.entries(obj)) {
            const item = document.createElement('div');
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            item.style.gap = '10px';
    
            item.addEventListener('click', (event) => {
                event.stopPropagation();
                choiceColor(name, colors[0], colors[1]); // Correction ici
                overlay.style.opacity = "0";
    
                setTimeout(() => {
                    overlay.style.visibility = "hidden";
                    overlay.remove();
                }, 100);
            });
    
            const colorBox = document.createElement('div');
            colorBox.style.width = '30px';
            colorBox.style.height = '30px';
            colorBox.style.borderRadius = '5px';
            colorBox.style.backgroundColor = colors[0]; // Correction ici
            colorBox.style.border = '1px solid #ccc';
    
            const label = document.createElement('p');
            label.textContent = name;
            label.style.fontFamily = 'var(--color-font)';
            label.style.fontSize = '1rem';
            label.style.color = '#000';
    
            item.appendChild(colorBox);
            item.appendChild(label);
            container.appendChild(item);
        }
    
        overlay.addEventListener('click', (event) => {
            event.stopPropagation();
            overlay.style.opacity = "0";
    
            setTimeout(() => {
                overlay.style.visibility = "hidden";
                overlay.remove();
            }, 100);
        });
    
        function preloadImages(colors) {
            for (const name in colors) {
                const img = new Image();
                img.src = `/${name}/${name}back.jpg`;
            }
        }
        preloadImages(obj);
    });
    
    function choiceColor(name, color, neon) {
        document.querySelector('.overlayy').remove();
        document.querySelector('#colors').querySelector('span').textContent = `${name}`;
        document.querySelector('#colors').style.boxShadow = `0px 0px 10px ${neon}`;
        document.querySelector('#colors').style.backgroundColor = color;
        document.querySelector('#devices').style.boxShadow = `0px 0px 10px ${neon}`;
        document.querySelector('#devices').style.backgroundColor = color;
        document.querySelector('#conf').style.backgroundColor = color;
        // document.querySelector('#form').style.backgroundColor = color;
        // document.querySelector('#form').style.backgroundImage = `url(/${name}/${name}back.jpg)`;
        // Modifier la variable CSS pour le ::before
        document.documentElement.style.setProperty('--before-color', neon);
        document.documentElement.style.setProperty('--inputform2', color);
    
        const tabimg = document.querySelectorAll('.backimg');
        tabimg.forEach(img => {
            img.style.display = (img.id === name) ? "block" : "none";
        });
    }
    

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
            subscriptionOption: document.querySelector("#colors span").textContent.trim()
        };
    
        
        fetch('/api/inscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData ),
        })
            .then(response => response.json())
            .then(result => {
                console.log('Résultat reçu du serveur :', result);
                if (result.success) {
                    // Redirige l'utilisateur vers Stripe Checkout
                    window.open(result.checkoutUrl, "_blank")
                } else {
                    console.error('Erreur côté serveur :', result.message);
                }
            })
            .catch(error => {
                console.error('Erreur lors de la requête fetch :', error);
            });
        
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
              goback()
            }
          });
          
        } else {
          console.log("❌ Paiement annulé.");
          goback()
        }
      });
      
    
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

    
function goback(){
    const script = document.createElement('script')
    script.id ="clientjs"
    script.src = "/js/client.js"
    document.body.appendChild(script)

    const link = document.createElement("link");
    link.id = "cssclient";
    link.rel = "stylesheet";
    link.href = "/css/client.css";
    document.head.appendChild(link);

    document.querySelector('#divlock').style.display ="none"
    document.querySelector('#unlock').style.display ="flex"

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

function loadUnlock(){
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

})()