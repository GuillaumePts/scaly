if (window.clientData) {
    console.log("Utilisateur connecté :", window.clientData);
    
} else {
    // Si la page a été rechargée, récupérer les données depuis le backend via le token
    fetch("/me", { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            if (data.user) {
                window.clientData = data.user;
                console.log("Utilisateur récupéré :", data.user);
            } else {
                console.log('pute'); // Redirige vers la connexion si non authentifié
            }
        })
        .catch(() => window.location.href = "/login");
}


function loadUnlock(){
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

                const  menu = document.querySelector('#burger')
                console.log(menu);
                
                document.querySelector('#burger').addEventListener('click',()=>{
                    document.querySelector('#sous-nav').classList.toggle('translate')
                    
            })

            } else {
                // Si c'est un objet JSON, on gère l'erreur
                console.error(data.message);
            }
        })
        .catch((err) => {
            console.log("Erreur : ", err);
        });
}

document.querySelector('#admin').addEventListener('click', () => {
    fetch("/api/logout", { // Envoie la requête de déconnexion
        method: "GET",
        credentials: "include"  // S'assure d'inclure les cookies (si tu utilises les cookies pour stocker le token)
    })
    .then(res => res.json())
    .then(data => {
        if (data.message === "Déconnexion réussie") {
            // Rediriger ou effectuer d'autres actions après la déconnexion
            document.querySelector('#divlock').style.display ="flex"
            document.querySelector('#unlock').style.display ="none"
            window.location.href = "/"; // Exemple de redirection vers la page de login
        }
    })
    .catch(err => console.error("Erreur de déconnexion :", err));
});

const observer = new MutationObserver(() => {
    const menu = document.querySelector("#burger");
    if (menu) {
        menu.addEventListener("click", () => {
            document.querySelector("#sous-nav").classList.toggle("translate");
            console.log('tfc');
        });
        addEvent()
        observer.disconnect(); // On arrête l'observation une fois `#burger` détecté
    }
});

// Observer les changements dans #main-content
observer.observe(document.querySelector("#main-content"), { childList: true, subtree: true });

function addEvent(){
    const pages = document.querySelectorAll('.page');

    pages.forEach(page =>{
        page.addEventListener('click',()=>{
            pagination(pages,page.id)
        })
    })
}

function pagination(tabpage,page){
    tabpage.forEach(lapage =>{
        if(lapage.id != page){
            document.querySelector(`.${lapage.id}`).style.display = "none"
        }else{
            document.querySelector(`.${lapage.id}`).style.display = "flex"
        }
    })
}


