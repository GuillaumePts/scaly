
const burger = document.querySelector('#burger')
const htmlCache = {};
const a = document.querySelectorAll('.menu')
const header = document.querySelector('header')

let actupage = "accueil"


window.test = false;
window.srccontact = window.srccontact || ''
window.datacache = window.datacache || '';
window.datacache2 = window.datacache2 || '';

async function loadEverything() {
    try {
      await Promise.all([
        getContenuPhoto(),
        loadImages(),
        getContactIllustration(),
        preloadHTMLPages(),
        getContactFooter()
      ]);
    } catch (error) {
      console.error("Erreur pendant le chargement :", error);
    }
  }



async function getContenuPhoto() {
    try {
        const response = await fetch('/getcontenuphoto');
        if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données');
    }
      const data = await response.json(); // Données reçues depuis le serveur

        datacache = data.folder
        datacache2 = data.desc

    } catch (error) {
        console.error('Erreur :', error);
    }
}


async function getContactIllustration() {
    try {
      const res = await fetch('/getContactIllustration');
      const data = await res.json();
      if (!data.erreur) {
        window.srccontact = `/imgcontact/${data.fileName}`;
      } else {
        console.log('moustache');
      }
    } catch (err) {
      console.error('Erreur fetch image :', err);
    }
  }



  async function getContactFooter() {
    try {
      const response = await fetch('/contactfooter');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des contacts');
      }
  
      const data = await response.json();
      console.log('Contacts récupérés:', data);
      traitement(data); // Appel de ta fonction de traitement
    } catch (error) {
      console.error('Erreur:', error);
    }
  }
  

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async function startSite() {
    const header = document.querySelector("header");
    const charging = document.querySelector("#charging");
  
    const loadData = loadEverything();
    const waitMinimumTime = sleep(2000); // attendre au moins 2 secondes
  
    await Promise.all([loadData, waitMinimumTime]); // attendre les deux en même temps
  
    // Tout est prêt et 2 secondes se sont écoulées
    header.style.transform = "scale(1.0)";
    header.style.opacity = "1";
    charging.style.opacity = "0";
  
    setTimeout(() => {
      charging.style.display = "none";
    }, 1000);
  }
  
  startSite();

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
      const imagePaths = await response.json();
  
      // Préchargement des images
      const preloadedImages = await Promise.all(
        imagePaths.map(src => new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = () => resolve(img);
          img.onerror = reject;
        }))
      );
  
      playCarrou(preloadedImages);
    } catch (error) {
      console.error('Erreur:', error);
    }
  }



  function playCarrou(images) {
    if (!images.length) return;
  
    const header = document.querySelector('header');
  
    const img1 = document.createElement('img');
    const img2 = document.createElement('img');
  
    [img1, img2].forEach(img => {
      img.style.position = 'absolute';
      img.style.top = '0';
      img.style.left = '0';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.opacity = '0';
      img.style.transition = 'opacity 1.5s ease-in-out, transform 1.5s ease-in-out';
      header.appendChild(img);
    });
  
    let count = 0;
    let currentImg = img1;
    let nextImg = img2;
  
    currentImg.src = images[count].src;
    currentImg.style.opacity = '1';
  
    setInterval(() => {
      count = (count + 1) % images.length;
  
      nextImg.src = images[count].src;
      nextImg.style.transform = 'scale(1.1)';
      nextImg.style.opacity = '1';
  
      currentImg.style.transform = 'scale(1)';
      currentImg.style.opacity = '0';
  
      // Swap images
      [currentImg, nextImg] = [nextImg, currentImg];
    }, 4000);
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


function preloadHTMLPages() {
    const pages = ['accueil', 'portfolio', 'contact', 'lock']; 
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

// menu dynamique 
function loadContent(page) {

    if(document.querySelector('.corbeil')){
        document.querySelector('.corbeil').remove()
        document.querySelector('.annuler').remove()
        document.querySelector('.all').remove()
    }

    if(document.querySelector('#navbackcontentButton')){
        document.querySelector('#navbackcontentButton').style.transform = 'translateX(-110%)'
    }

    if(document.querySelector('.overlayBackImg')){
        document.querySelector('.overlayBackImg').remove()
        const tab = document.querySelectorAll('.overlayBackImg')

        tab.forEach(tb =>{
            tb.remove()
        })
    }

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

            if(document.querySelector('#returnC')){
                document.querySelector('#returnC').style.display = "none"
            }
        }
        if(page == "contact"){
            document.querySelector('#jscontact').remove()
            const sc = document.createElement('script')
            sc.src = "/js/contact.js"
            sc.id = "jscontact"
            document.body.appendChild(sc)
            actupage = "contact"
            if(document.querySelector('#returnC')){
                document.querySelector('#returnC').style.display = "none"
            }
        }
        if(page == "portfolio"){
            document.querySelector('#jsportfolio').remove()
            const sc = document.createElement('script')
            sc.src = "/js/portfolio.js"
            sc.id = "jsportfolio"
            document.body.appendChild(sc)
            actupage = "portfolio"
        }
        if(page == "lock"){
            document.querySelector('#jslock').remove()
            const sc = document.createElement('script')
            sc.src = "/js/lock.js"
            sc.id = "jslock"
            document.body.appendChild(sc)
            actupage = "lock"
            if(document.querySelector('#returnC')){
                document.querySelector('#returnC').style.display = "none"
            }
        }
        animvisible();
    } else {
        console.error(`Page ${page} non trouvée dans le cache.`);
    }


}

// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


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
    const titreh1 = document.querySelector('h1')
    const signature  = document.querySelector('#signature')
    
    titreh1.textContent=data.titre
    signature.textContent=data.signature

}




document.querySelector('#admin').addEventListener('click',()=>{
    if(!document.querySelector('.loaderi')){
        load()

    setTimeout(() => {
        document.querySelector('#logonavbarre').style.opacity="1"
        finload()
    }, 1500);
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


// function swiping(){
// const tabPages = ['accueil', 'contact', 'portfolio', 'lock'];
// let isSwiping = false; // Pour éviter de trop réagir aux événements

// document.addEventListener("DOMContentLoaded", function () {
//     let touchStartX = 0;
//     let touchEndX = 0;
//     let touchStartY = 0; // Pour vérifier si on fait un swipe horizontal ou vertical

//     document.addEventListener("touchstart", function (e) {
//         // Sauvegarder la position de départ du touch
//         touchStartX = e.touches[0].clientX;
//         touchStartY = e.touches[0].clientY;
//         isSwiping = true; // Début du swipe
//     });

//     document.addEventListener("touchend", function (e) {
//         touchEndX = e.changedTouches[0].clientX;
//         let touchEndY = e.changedTouches[0].clientY;
        
//         if (isSwiping) {
//             // Si le mouvement horizontal est plus significatif que le vertical
//             let diffX = touchEndX - touchStartX;
//             let diffY = touchEndY - touchStartY;

//             if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
//                 // Swipe horizontal détecté
//                 handleSwipe(diffX);
//             }
//         }

//         isSwiping = false; // Fin du swipe
//     });

//     function handleSwipe(diffX) {
//         let currentIndex = tabPages.indexOf(actupage); // Trouver l'index de la page actuelle

//         if (diffX > 50) {
//             // Swipe de gauche à droite (page précédente)
//             if (currentIndex > 0) {
//                 actupage = tabPages[currentIndex - 1];
//             } else {
//                 actupage = tabPages[tabPages.length - 1]; // Retour à la dernière page
//             }
//             loadContent(actupage);
//         } else if (diffX < -50) {
//             // Swipe de droite à gauche (page suivante)
//             if (currentIndex < tabPages.length - 1) {
//                 actupage = tabPages[currentIndex + 1];
//             } else {
//                 actupage = tabPages[0]; // Retour à la première page
//             }
//             loadContent(actupage);
//         }
//     }
// });
// }









