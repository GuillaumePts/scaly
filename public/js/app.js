
const burger = document.querySelector('#burger')

const a = document.querySelectorAll('.menu')
const header = document.querySelector('header')

let lastHeight = window.innerHeight;

function updateVh() {
    // Récupérer la hauteur de la fenêtre (viewport) en pixels
    const viewportHeight = window.innerHeight;
    const navHeight = 70; // Hauteur de la barre de navigation (ajuste si nécessaire)
    const screenHeight = screen.height;

    // Estimer la hauteur de la barre d'outils du bas (en pixels)
    const bottomBarHeight = screenHeight - viewportHeight;

    // Appliquer la hauteur de la fenêtre à la variable CSS --vh en pixels
    document.documentElement.style.setProperty('--vh', `${viewportHeight}px`);

    const navBar = document.querySelector('#navigation');

    // if (navBar) {
    //     // Calculer le top en fonction de la hauteur de la barre d'outils (ou de la barre de pied de page)
    //     const topValue = `calc(var(--vh) - ${bottomBarHeight - 15}px)`;
    //     navBar.style.top = topValue;

    //     // Gérer l'affichage de la nav bar en fonction du scroll
    //     window.addEventListener('scroll', () => {
    //         if (window.scrollY > 0) {
    //             navBar.style.position = 'fixed';
    //             navBar.style.bottom = '0px';
    //             navBar.style.top = 'auto'; // On réinitialise le top
    //         }
    //     });

    //     simulateScroll();
    // }
}





function simulateScroll() {
    let scrollPosition = 0;
    const targetScrollPosition = 1;  // Légère valeur pour simuler le scroll

    function scrollStep() {
        if (scrollPosition < targetScrollPosition) {
            scrollPosition += 0.1;  // Incrémenter la position du scroll
            window.scrollTo(0, scrollPosition);
            requestAnimationFrame(scrollStep);
        }
    }

    requestAnimationFrame(scrollStep);
}


// Appeler updateVh au chargement de la page
updateVh();




loadImages()

let gradientmoove = document.querySelector('.background');
let countdeg = 0;
function animateGradient() {
  // Met à jour le CSS custom property
  document.documentElement.style.setProperty('--deg-', `${countdeg}deg`);
  
  // Optionnel : directement mettre à jour un élément
  // gradientmoove.style.background = `linear-gradient(${countdeg}deg, rgb(255, 0, 67), rgb(0, 7, 185))`;

  countdeg = (countdeg + 0.2) % 360; // Valeur fine pour un mouvement lent et fluide
  requestAnimationFrame(animateGradient);
}

animateGradient(); // Lance l'animation




async function loadImages() {
    try {
        const response = await fetch('/api/images');
        if (!response.ok) throw new Error('Erreur lors de la récupération des images');
        const images = await response.json();

        // Utilisez le tableau d'images pour configurer le carrousel
     // Vous pouvez l'utiliser dans votre fonction carrousel
        // Exemple : afficher chaque image dans un élément img
        let tabImg = []
        images.forEach(imagePath => {
            tabImg.push(imagePath)
            
        });
        

        
    } catch (error) {
        console.error('Erreur:', error);
    }
}


// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// css dynamique

function dynamicCss(css){
    const leslinks = document.querySelectorAll('.dynamic-css')
    leslinks.forEach(link=>{
        if(link.id === css){
            link.rel = 'stylesheet';
            link.media = "all"
        }else{
            link.media = "none"
        }
        
    })
}

// // Pré-charger toutes les pages HTML lors du chargement du site
const htmlCache = {};

function preloadHTMLPages() {
    const pages = ['accueil', 'pics', 'contact', 'lock']; 
    const promises = pages.map(page => {
        return fetch(`/content/${page}`).then(response => response.text()).then(html => {
            htmlCache[page] = html;  
            
        });
    });

    Promise.all(promises).then(() => {
    }).catch(error => {
        console.error('Erreur lors du préchargement des pages:', error);
    });
}
let actupage = "accueil"
preloadHTMLPages();

// menu dynamique 
function loadContent(page) {
    const mainContent = document.getElementById('main-content');

    mainContent.style.transition="0s"
    mainContent.scrollIntoView({
        behavior: 'smooth', // Défilement fluide
        block: 'start',     // Aligne l'élément au début de la vue
    });
    
    mainContent.style.opacity = 0
    setTimeout(() => {
        mainContent.style.transition="0.1s ease-out"
        mainContent.style.opacity = 1
    }, 100);
    
    
    if (htmlCache[page]) {
        const html = htmlCache[page];
        console.log(html);
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        mainContent.textContent = '';
        Array.from(doc.body.childNodes).forEach(node => {
            dynamicCss(page);
            mainContent.appendChild(node);
        });

        
        if(page == "accueil"){
            document.querySelector('#jsaccueil').remove()
            const sc = document.createElement('script')
            sc.src = "/js/accueil.js"
            sc.id = "jsaccueil"
            document.body.appendChild(sc)
            actupage = "accueil"
        }
        if(page == "contact"){
            document.querySelector('#jscontact').remove()
            const sc = document.createElement('script')
            sc.src = "/js/contact.js"
            sc.id = "jscontact"
            document.body.appendChild(sc)
            actupage = "contact"
        }
        if(page == "pics"){
            document.querySelector('#jspics').remove()
            const sc = document.createElement('script')
            sc.type="module"
            sc.src = "/js/pics.js"
            sc.id = "jspics"
            document.body.appendChild(sc)
            actupage = "pics"
        }
        if(page == "lock"){
            document.querySelector('#jslock').remove()
            const sc = document.createElement('script')
            sc.src = "/js/lock.js"
            sc.id = "jslock"
            document.body.appendChild(sc)
            actupage = "lock"
        }
        animvisible();
    } else {
        console.error(`Page ${page} non trouvée dans le cache.`);
    }


}

// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

function loadUnlock(){
    if(document.querySelector('#clientjs')){
        document.querySelector('#clientjs').remove()
    }
    if(document.querySelector('#cssclient')){
        document.querySelector('#cssclient').remove()
    }

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


function animvisible() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, { threshold: 0.1 });

    // Réinitialiser les observations
    document.querySelectorAll('.scroll-fade').forEach(p => {
        observer.observe(p);
    });
    document.querySelectorAll('.translate').forEach(p => {
        observer.observe(p);
    });
}


// Initialisation
animvisible();

function testnum(){
    // Numéro de téléphone à composer
const phoneNumber = "+1234567890";

// Ouvrir l'application d'appel avec ce numéro
window.location.href = `tel:${phoneNumber}`;
}








fetch('/contactfooter')
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des contacts');
        }
        return response.json();
    })
    .then(data => {
        console.log('Contacts récupérés:', data);
        traitement(data)
        
    })
    .catch(error => {
        console.error('Erreur:', error);
    });


function traitement(data){
    const reseaufooter = document.querySelector('#reseaufooter')
    reseaufooter.textContent=""

    data.forEach(contact => {
        Object.keys(contact).forEach(key => {
            const value = contact[key];


            if(key !== "mail" && key !=="telephone" ){
                const a = document.createElement('a')
                a.href = value.link
                const slink = document.createElement('img')
                slink.src= `/iconfooter/${key}.svg`

                a.appendChild(slink)
                reseaufooter.appendChild(a)
            }
            
        });
    });

}



fetch('/globale')
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des contacts');
        }
        return response.json();
    })
    .then(data => {
        
        globale(data)
        
    })
    .catch(error => {
        console.error('Erreur:', error);
    });

function globale(data){
    
    const signature  = document.querySelector('#signature')
    
    
    signature.textContent=data.signature

}


setTimeout(() => {
    const header = document.querySelector("header")
    const main = document.querySelector("main")
    const footer = document.querySelector("footer")

    header.style.transform="scale(1.0)"
    header.style.opacity="1"
    

    document.querySelector('#charging').style.opacity="0"
    document.querySelector('#getstarted').style.opacity = "1"

    
    setTimeout(() => {
        document.querySelector('#charging').style.display = "none"
        animHead()
    }, 1000);
    addobserver()
}, 2000);


function animHead() {
    setTimeout(() => {
        document.querySelector('#getstarted').style.opacity = "1"
    }, 150);
    
    setTimeout(() => {
        document.querySelector('#arrow').style.transform ="translateX(0)"
        document.querySelector('#picsbuttonhead').style.transform ="translateX(0)"
    }, 170);
}

function resetAnim() {
    document.querySelector('#getstarted').style.opacity = "0";
    document.querySelector('#arrow').style.transform = "translateX(30px)";
    document.querySelector('#picsbuttonhead').style.transform = "translateX(-40px)";
}


// Observer
function addobserver(){
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animHead(); // L'élément entre dans l'écran
            } else {
                resetAnim(); // L'élément sort de l'écran
            }
        });
    }, { threshold: 0.2 }); // Déclenche quand 20% de l'élément est visible
    
    // Observer sur l'élément cible
    const target = document.querySelector('#getstarted');
    if (target) {
        observer.observe(target);
    }
    
}

document.querySelector('#admin').addEventListener('click',()=>{
    if(!document.querySelector('.loaderi')){
        load()

    setTimeout(() => {
        document.querySelector('#logonavbarre').style.opacity="1"
        finload()
    }, 2000);
    }
    
})

function load(){
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
    },700);
}




const tabPages = ['accueil', 'contact', 'pics', 'lock'];

// document.addEventListener("DOMContentLoaded", function () {
//     let touchStartX = 0;
//     let touchEndX = 0;

//     document.addEventListener("touchstart", function (e) {
//         touchStartX = e.touches[0].clientX;
//     });

//     document.addEventListener("touchend", function (e) {
//         touchEndX = e.changedTouches[0].clientX;
//         handleSwipe();
//     });

//     function handleSwipe() {
//         let diff = touchEndX - touchStartX;
//         let currentIndex = tabPages.indexOf(actupage); // Trouver l'index de la page actuelle

//         if (diff > 50) {
//             // Swipe de gauche à droite (page précédente)
//             if (currentIndex > 0) {
//                 actupage = tabPages[currentIndex - 1];
//             } else {
//                 // On revient à la dernière page si on est au début
//                 actupage = tabPages[tabPages.length - 1];
//             }
//             loadContent(actupage);
//         } else if (diff < -50) {
//             // Swipe de droite à gauche (page suivante)
//             if (currentIndex < tabPages.length - 1) {
//                 actupage = tabPages[currentIndex + 1];
//             } else {
//                 // On revient à la première page si on est à la fin
//                 actupage = tabPages[0];
//             }
//             loadContent(actupage);
//         }
//     }
// });






