// // Pré-charger toutes les pages HTML lors du chargement du site
// const htmlBackCache = {};
function handlePhotoClick() {
    const folderphoto = document.querySelector('#gestionphotos');
    const foldervideo = document.querySelector('#gestionvideos');
    console.log("photo");
    loadContentBack('photo');
    foldervideo.classList.remove('choisi');
    animCardPouV(folderphoto);
    document.querySelector('#parentportfolio').classList.add('dnone');
    document.querySelector('#parentportfolio').classList.remove('dflex');
    document.querySelector('#contenuPhotoVideo').classList.add('dflex');
    document.querySelector('#contenuPhotoVideo').classList.remove('dnone');
}

function handleVideoClick() {
    const foldervideo = document.querySelector('#gestionvideos');
    const folderphoto = document.querySelector('#gestionphotos');
    console.log("video");
    loadContentBack('video');
    folderphoto.classList.remove('choisi');
    animCardPouV(foldervideo);
    document.querySelector('#parentportfolio').classList.add('dnone');
    document.querySelector('#parentportfolio').classList.remove('dflex');
    document.querySelector('#contenuPhotoVideo').classList.add('dflex');
    document.querySelector('#contenuPhotoVideo').classList.remove('dnone');
}
function animCardPouV(el){
    const parent = document.querySelector('#parentportfolio')
    if(el === parent.lastElementChild){
        el.classList.add('choisi')
    }else{
        el.classList.add('rotating');
        parent.appendChild(el);
        setTimeout(() => {
            el.classList.remove('rotating');
            el.classList.add('choisi')
        }, 200);
    }
}

function gestionJSportfolio(js) {
    // Supprime l'ancien script
    const existingScript = document.querySelector('#jsportfoliopv');
    if (existingScript) {
        console.log(`Suppression de l'ancien script: ${existingScript.src}`);
        existingScript.remove();
    }

    // Ajoute le nouveau script
    const newjsDynamique = document.createElement('script');
    newjsDynamique.src = `/js/${js}back.js?t=${Date.now()}`;
    newjsDynamique.id = "jsportfoliopv";

    document.body.appendChild(newjsDynamique);
}

function loadContentBack(page) {
    const mainContent = document.getElementById('contenuPhotoVideo');
    
    mainContent.scrollIntoView({
        behavior: 'smooth', // Défilement fluide
        block: 'start',     // Aligne l'élément au début de la vue
    });
    mainContent.style.opacity = 0
    setTimeout(() => {
        mainContent.style.opacity = 1
    }, 100);
    
    
    if (htmlBackCache[page]) {
        const html = htmlBackCache[page];
        console.log(html);
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        
        
        mainContent.textContent = '';
        setTimeout(() => {
            Array.from(doc.body.childNodes).forEach(node => {
                
                mainContent.appendChild(node);
                
            });
            
            if (page === "video") {

                const addCamera = document.getElementById("add-camera");

                // Vérifier si l'élément existe avant d'aller plus loin
                if (!addCamera) {
                    console.error("Élément #add-camera introuvable !");
                } else {
                    
                    // Cloner l'élément pour pouvoir le réinjecter sans perdre les événements
                    const addCameraClone = addCamera.cloneNode(true);
                
                    // Observer les suppressions d'éléments
                    const observer = new MutationObserver((mutations) => {
                        mutations.forEach((mutation) => {
                            mutation.removedNodes.forEach((node) => {
                                if (node.id === "add-camera") {
                                    console.log("add-camera supprimé ! Réinjection...");
                
                                    // Vérifier s'il a bien disparu avant de le réinsérer
                                    if (!document.body.contains(addCameraClone)) {
                                        document.body.appendChild(addCameraClone);
                                    }
                                }
                            });
                        });
                    });
                
                    // Lancer l'observation du `body`
                    observer.observe(document.body, { childList: true, subtree: true });
                
                    // Supprimer et réinsérer pour forcer la réapplication de `fixed`
                    addCamera.remove();
                    document.body.appendChild(addCameraClone);
                    observer.disconnect();
                }
            }
            
           
            gestionJSportfolio(page)
        }, 200);
        
    } else {
        console.error(`Page ${page} non trouvée dans le cache.`);
    }

}


(()=>{
if(!document.querySelector('#jsportfoliopv')){
    const jsDynamique = document.createElement('script');
    jsDynamique.id="jsportfoliopv";
    document.body.appendChild(jsDynamique)
}




    




// Supprimer les anciens écouteurs avant d'en ajouter de nouveaux
// folderphoto.removeEventListener('click', handlePhotoClick);
// foldervideo.removeEventListener('click', handleVideoClick);

// folderphoto.addEventListener('click', handlePhotoClick);
// foldervideo.addEventListener('click', handleVideoClick);







function preloadHTMLPagesBack() {
    const pages = ['photo', 'video']; 
    const promises = pages.map(page => {
        return fetch(`/backcontent/${page}`).then(response => response.text()).then(html => {
            htmlBackCache[page] = html;  
            
        });
    });

    Promise.all(promises).then(() => {
    }).catch(error => {
        console.error('Erreur lors du préchargement des pages:', error);
    });
}

preloadHTMLPagesBack();




})()
