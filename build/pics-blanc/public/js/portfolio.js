(()=>{
    let ttabretour = [];

// Variable globale pour suivre la carte actuellement visible
let currentVisibleCard = null;

let ticking = false;
window.xxxAccept = window.xxxAccept || false



function retour() {
    const photos = document.querySelector('#photos')
    const videos = document.querySelector('#videos')
    
    if(document.querySelector('.overlayBackImg')){
        document.querySelector('.overlayBackImg').remove()
    }
    
    if(ttabretour.length !==0){
        if(photos){
            document.querySelector('#returnC').style.display="none"
            photos.textContent='';
            creatFolderClient(datacache,datacache2)
            ttabretour=[]

        }
    }
    
    // else{
    //     const cardChoice = document.querySelector('#photoOrVideo')
    //     cardChoice.style.display = "flex"
    //     if(photos){
    //         photos.style.display="none"
    //         photos.textContent=''
    //     }
    
    //     if(videos){
    //         videos.style.display="none"
    //         videos.textContent=''
    //     }
    
        
    //     if(document.querySelector('#returnC')){
            
    //         document.querySelector('#returnC').style.display="none"
    //     }
    // }
    
}





// function addEvent(){
//     document.querySelector('#photoc').addEventListener('click', ()=>{
//         choisiPhoto()
        
//     })

//     document.querySelector('#videoc').addEventListener('click', ()=>{
//         choisiVideo()
//     })
// }
// addEvent()

choisiPhoto()

// const storedData = sessionStorage.getItem('videoData');

//     if (storedData) {
//         const videoData = JSON.parse(storedData);
//         if (videoData.length==0) {
//             document.querySelector('#photoc').click()
//         }
//     } else {
//         console.log('Données non trouvées en cache, requête en cours...');
//         fetch('/ifvideo')
//             .then(response => response.json())
//             .then(data => {
//                 sessionStorage.setItem('videoData', JSON.stringify(data.liens));
//                 console.log('Données vidéos récupérées et stockées:', data.liens);
//             })
//             .catch(error => console.error('Erreur lors de la récupération des vidéos:', error));
//     }



function choisiPhoto() {
    const contenu = document.querySelector('#contenu')
    const cardChoice = document.querySelector('#photoOrVideo')
    cardChoice.style.display = "none"
    const photos = document.querySelector('#photos')
    photos.style.display = "flex"
    
    if(window.datacache && window.datacache2){
        creatFolderClient(window.datacache,window.datacache2)
        if(window.datacache2.locked){

            if (!window.xxxAccept) {
                const overlay = document.createElement('div')
                overlay.classList.add('overlayMsgxxx')

                const msgcontent = document.createElement('div')
                msgcontent.classList.add('msgcontentxxx')

                const c = document.createElement('div')
                c.classList.add('conteneurimgform')

                const bk = document.createElement('div')
                bk.classList.add('background')

                const img = document.createElement('img')
                img.classList.add('imgform')
                img.alt = "logo scaly"
                img.src = "/logo/logotransparant.png"

                bk.appendChild(img)
                c.appendChild(bk)
                msgcontent.appendChild(c)

                const warning = document.createElement('p')
                warning.textContent = "Avertissement"
                warning.style.textDecoration  = "underline"
                warning.style.color = "#a82828"
                warning.style.fontWeight  = "600"
                warning.style.fontSize  = "1.2rem"

                msgcontent.appendChild(warning)

                const p = document.createElement('p')
                p.textContent = "Ce portfolio contient des œuvres réservées aux adultes. En accédant à ce contenu, vous certifiez avoir l'âge légal requis selon la législation en vigueur."
                p.style.color = "#666"

                const button = document.createElement('button')
                button.textContent = "Je confirme être majeur"
                button.classList.add('buttonxxx')

                overlay.appendChild(msgcontent)
                msgcontent.appendChild(p)
                msgcontent.appendChild(button)

                document.querySelector('#main-content').appendChild(overlay)

                button.addEventListener('click',()=>{
                    overlay.remove()
                    window.xxxAccept = true
                })
            }
        }
    }else{
        getContenuPhoto();
    }

}



// function choisiVideo(){
//     const contenu = document.querySelector('#contenu')
//     const videos = document.querySelector('#videos')
//     const cardChoice = document.querySelector('#photoOrVideo')
//     cardChoice.style.display = "none"
//     videos.style.display="flex"
//     document.querySelector('#returnC').style.display="flex"
//     document.querySelector('#returnC').addEventListener('click',()=>{
//         retour()
//     })

//     fetchvideo()

    
// }

// function fetchPhotos(){
//     const container = document.querySelector('#photos')
// }

async function getContenuPhoto() {
    try {
        const response = await fetch('/getcontenuphoto');
        if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données');
    }
      const data = await response.json(); // Données reçues depuis le serveur
        creatFolderClient(data.folder,data.desc)
        window.datacache = data.folder
        window.datacache2 = data.desc
        

        if(data.desc.locked){

            if (!window.xxxAccept) {
                const overlay = document.createElement('div')
                overlay.classList.add('overlayMsgxxx')

                const msgcontent = document.createElement('div')
                msgcontent.classList.add('msgcontentxxx')

                const c = document.createElement('div')
                c.classList.add('conteneurimgform')

                const bk = document.createElement('div')
                bk.classList.add('background')

                const img = document.createElement('img')
                img.classList.add('imgform')
                img.alt = "logo scaly"
                img.src = "/logo/logotransparant.png"

                bk.appendChild(img)
                c.appendChild(bk)
                msgcontent.appendChild(c)

                const warning = document.createElement('p')
                warning.textContent = "Avertissement"
                warning.style.textDecoration  = "underline"
                warning.style.color = "#a82828"
                warning.style.fontWeight  = "600"
                warning.style.fontSize  = "1.2rem"

                msgcontent.appendChild(warning)

                const p = document.createElement('p')
                p.textContent = "Ce portfolio contient des œuvres réservées aux adultes. En accédant à ce contenu, vous certifiez avoir l'âge légal requis selon la législation en vigueur."
                p.style.color = "#666"

                const button = document.createElement('button')
                button.textContent = "Je confirme être majeur"
                button.classList.add('buttonxxx')

                overlay.appendChild(msgcontent)
                msgcontent.appendChild(p)
                msgcontent.appendChild(button)

                document.querySelector('#main-content').appendChild(overlay)

                button.addEventListener('click',()=>{
                    overlay.remove()
                    window.xxxAccept = true
                })
            }
        }

    } catch (error) {
        console.error('Erreur :', error);
    }
}


function countTotalImagesAndObjects(contenu) {
    if (!contenu || typeof contenu !== 'object') {
        console.error("Erreur: contenu n'est pas un objet valide", contenu);
        return { totalImages: 0, totalObjects: 0 };
    }

    let totalObjects = 0;
    let totalImages = 0;

    for (const [key, obj] of Object.entries(contenu)) {
        if (key === "images") continue; // On ignore l'objet nommé "images"

        totalObjects++; // On compte l'objet

        if (Array.isArray(obj.images)) {
            totalImages += obj.images.length; // On ajoute les images
        }
    }

    return { totalImages, totalObjects };
}



function creatFolderClient(datafolder, datadesc) {
    const content = document.querySelector('#photos');
    const data = datafolder;
    const fragment = document.createDocumentFragment();

    if (Object.keys(data).length === 0) {
        // Rien à afficher
    } else {
        const cardsToLoad = [];

        for (const [categorie, contenu] of Object.entries(data)) {
            const result = countTotalImagesAndObjects(contenu);
            const cardPhotos = document.createElement('div');
            cardPhotos.classList.add('cardPhotos');

            const contenttitre = document.createElement('div');
            const titre = document.createElement('h2');
            titre.textContent = categorie.replace(/_/g, ' ');
            contenttitre.appendChild(titre);
            cardPhotos.appendChild(contenttitre);

            cardPhotos.addEventListener('click', () => {
                afficherPhotosAll([categorie, contenu], datadesc);
            });

            const div = document.createElement('div');
            div.classList.add('contentsubclient-card');
            cardPhotos.appendChild(div);

            if (Array.isArray(contenu.images)) {
                contenttitre.classList.add('folderClientWithImgage-card');
                titre.classList.add('titregrandecatimage-card');

                const img = document.createElement('img');
                img.alt = 'Image de fond';
                img.classList.add('background-img-fixed');
                // L'image est ajoutée mais la src sera définie plus tard
                cardPhotos.appendChild(img);

                // Ajoute cette carte à la liste à charger
                cardsToLoad.push({ imgElement: img, src: contenu.images[0] });
            }

            if (typeof contenu === "object" && Object.keys(contenu).length > 0) {
                for (const [sousCategorie, details] of Object.entries(contenu)) {
                    const subdiv = document.createElement('div');
                    subdiv.classList.add('subcategoryclient');
                    subdiv.addEventListener('click', (event) => {
                        event.stopPropagation();
                        afficherPhotosAll([categorie, contenu], datadesc);
                    });

                    if (Array.isArray(details.images)) {
                        const l = document.createElement('div');
                        l.style.backgroundImage = `url(${details.images[0]})`;
                        subdiv.appendChild(l);

                        const count = document.createElement('span');
                        count.classList.add('countImgAlbum');
                        count.style.position = "absolute";
                        count.textContent = details.images.length;
                        subdiv.appendChild(count);
                        div.appendChild(subdiv);
                    }
                }
            }

            fragment.appendChild(cardPhotos);
        }

        content.appendChild(fragment);

        // Chargement séquentiel des images
        async function loadImagesSequentially(cards) {
            for (const { imgElement, src } of cards) {
                await new Promise((resolve) => {
                    imgElement.onload = resolve;
                    imgElement.onerror = resolve;
                    imgElement.src = src;
                });
            }
        }
        loadImagesSequentially(cardsToLoad);

        // Effet de scroll
        let currentVisibleCard = null;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible-card");
                    currentVisibleCard = entry.target;
                } else {
                    entry.target.classList.remove("visible-card");
                    if (currentVisibleCard === entry.target) {
                        currentVisibleCard = null;
                    }
                }
            });
        }, { threshold: 0.8 });

        document.querySelectorAll('.cardPhotos').forEach(card => observer.observe(card));

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (currentVisibleCard) {
                        const img = currentVisibleCard.querySelector('.background-img-fixed');
                        if (!img) return;
                        const rect = currentVisibleCard.getBoundingClientRect();
                        if (rect.top < window.innerHeight && rect.bottom > 0) {
                            const scrollRatio = 1 - (rect.top / window.innerHeight);
                            const maxOffset = 40;
                            const offset = Math.min(maxOffset, Math.max(0, scrollRatio * maxOffset));
                            img.style.transform = `translateY(${offset}px)`;
                        }
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
}




window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            if (currentVisibleCard) {
                const img = currentVisibleCard.querySelector('.background-img-fixed');
                const rect = currentVisibleCard.getBoundingClientRect();

                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    // Décalage selon position dans la vue, pour effet de scroll fluide
                    const scrollRatio = 1 - (rect.top / window.innerHeight); // de 0 à 1
                    const maxOffset = 40; // px max de décalage
                    const offset = Math.min(maxOffset, Math.max(0, scrollRatio * maxOffset));
                    img.style.transform = `translateY(${offset}px)`;
                }
            }
            ticking = false;
        });
        ticking = true;
    }
});


function fName(folderName) {
    return folderName.replace(/_/g, ' ');
}

function afficherPhotosAll(tabComplet, desc) {
    const descriptions = desc.desc;
    const clef = tabComplet[0];
    const valeur = descriptions[clef];
    const data = tabComplet[1];

    document.querySelector('#returnC').style.display = "flex";
    const returnCButton = document.querySelector('#returnC');
    returnCButton.removeEventListener('click', retour);
    returnCButton.addEventListener('click', retour);

    ttabretour.push(1);

    const contenu = document.querySelector('#photos');
    contenu.style.alignItems = "center";
    contenu.textContent = "";

    const fragment = document.createDocumentFragment(); // ⚡️ pour performances

    const h2 = document.createElement('h2');
    h2.textContent = fName(clef);
    h2.classList.add('h2seclectall');

    const overlayBackImg = document.createElement('div');
    overlayBackImg.classList.add('overlayBackImg');
    document.querySelector('#contenu').appendChild(overlayBackImg);

    const contentsubfolder = document.createElement('div');
    contentsubfolder.classList.add('selectAll');

    const discribe = document.createElement('h2');
    if (valeur) {
        discribe.textContent = `“${valeur}”`;
    }
    discribe.classList.add('descriptionPortfolio');
    

    if (data.images) {
        const divFolder = document.createElement('div');
        divFolder.classList.add('folderClientWithImgage');
        divFolder.style.backgroundImage = `url(${data.images[0]})`;
        divFolder.appendChild(h2);

        overlayBackImg.style.backgroundImage = `url(${data.images[0]})`;

        if (data.images.length > 1) {
            const sudivfolder = document.createElement('div');
            sudivfolder.classList.add('contentsubclient');
            sudivfolder.appendChild(divFolder);

            data.images.forEach(img => {
                const div = document.createElement('div');
                div.classList.add('subcategoryclient');
                div.style.backgroundImage = `url(${img})`;
                sudivfolder.appendChild(div);
            });

            contentsubfolder.appendChild(divFolder);
            contentsubfolder.appendChild(discribe);
            fragment.appendChild(sudivfolder);
        } else {
            contentsubfolder.appendChild(divFolder);
            contentsubfolder.appendChild(discribe);
        }
    }

    if (typeof data === "object" && Object.keys(data).length > 0) {
        const div = document.createElement('div');
        div.classList.add('contentsubclient');

        for (const [sousCategorie, details] of Object.entries(data)) {
            if (sousCategorie !== "images") {
                const subdiv = document.createElement('div');
                subdiv.id = sousCategorie;
                subdiv.classList.add('subcategoryclient');

                const backgroundavecimage = document.createElement('div');
                subdiv.appendChild(backgroundavecimage);

                const count = document.createElement('span');
                count.classList.add('countImgAlbum');
                count.style.position = "absolute";

                if (details.images) {
                    count.textContent = details.images.length;
                    backgroundavecimage.style.backgroundImage = `url(${details.images[0]})`;
                }

                subdiv.appendChild(count);
                subdiv.addEventListener('click', () => {
                    imgall(details, sousCategorie, selectLayout);
                });

                div.appendChild(subdiv);
            }
        }

        fragment.appendChild(contentsubfolder);
        contenu.appendChild(fragment);
        document.querySelector('#photos').appendChild(div);
    }

     // ⚡️ append une seule fois

    // Scroll dynamique comme dans creatFolderClient
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                document.querySelectorAll('.folderClientWithImgage').forEach(el => {
                    const rect = el.getBoundingClientRect();
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        const scrollProgress = 1 - (rect.top / window.innerHeight);
                        const offset = scrollProgress * 20;
                        el.style.transform = `translateY(${offset}px)`;
                    } else {
                        el.style.transform = `translateY(0px)`;
                    }
                });
                ticking = false;
            });
            ticking = true;
        }
    });

    // Lancement automatique sur la première sous-catégorie si dispo
    const firstEntry = Object.entries(data).find(([key]) => key !== "images");
    if (firstEntry) {
        const [sousCategorie, details] = firstEntry;
        imgall(details, sousCategorie, selectLayout);
    }
}



window.selectLayout = window.selectLayout || "div"

function imgall(details, name, lelayout) {
    const old = document.querySelector('.contentimg');
    if (old) old.remove();

    const contentimg = document.createElement('div');
    contentimg.classList.add('contentimg');
    contentimg.style.width = "100%";
    document.querySelector('#photos').appendChild(contentimg);

    const outils = document.createElement('div');
    outils.classList.add('outils');
    contentimg.appendChild(outils);
    outils.scrollIntoView({ behavior: 'smooth', block: 'start' });

    outils.addEventListener('click', () => {
        const overlay = document.createElement('div');
        overlay.classList.add('overlayy');

        const overlayContent = document.createElement('div');
        overlayContent.classList.add('overlay-content');

        const closeBtn = document.createElement('button');
        closeBtn.classList.add('close-btn');
        closeBtn.textContent = '✖';

        const layoutDiv = document.createElement('img');
        layoutDiv.classList.add('layoutbutton');
        layoutDiv.src = "icon/layout-div.svg";

        const layoutImg = document.createElement('img');
        layoutImg.classList.add('layoutbutton');
        layoutImg.style.transform = "rotate(90deg)";
        layoutImg.src = "icon/layout-img.svg";

        overlayContent.append(closeBtn, layoutDiv, layoutImg);
        overlay.appendChild(overlayContent);
        document.body.appendChild(overlay);

        closeBtn.addEventListener('click', () => {
            overlay.style.opacity = "0";
            overlay.style.visibility = "hidden";
            setTimeout(() => overlay.remove(), 300);
        });

        layoutDiv.addEventListener('click', () => {
            window.selectLayout = "div";
            imgall(details, name, "div");
            overlay.style.opacity = "0";
            overlay.style.visibility = "hidden";
            setTimeout(() => overlay.remove(), 300);
        });

        layoutImg.addEventListener('click', () => {
            window.selectLayout = "img";
            imgall(details, name, "img");
            overlay.style.opacity = "0";
            overlay.style.visibility = "hidden";
            setTimeout(() => overlay.remove(), 300);
        });

        setTimeout(() => {
            overlay.style.opacity = "1";
            overlay.style.visibility = "visible";
        }, 10);
    });

    const h2 = document.createElement('h2');
    h2.classList.add('h2outil');
    h2.textContent = fName(name);
    outils.appendChild(h2);

    const layout = document.createElement('img');
    layout.classList.add('layout');
    layout.src = "/icon/layout.svg";
    outils.appendChild(layout);

    const imgs = document.createElement('div');
    imgs.classList.add('contentToutesPhotos');
    contentimg.appendChild(imgs);

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                img.classList.add('visible');
                observer.unobserve(img);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px"
    });

    const fragment = document.createDocumentFragment();

    if (lelayout === 'div') {
        details.images.forEach(imgUrl => {
            const div = document.createElement('div');
            div.classList.add('subcategoryclient-b');

            const img = document.createElement('img');
            img.classList.add('animphoto');
            img.setAttribute("data-src", imgUrl);
            img.setAttribute("fetchpriority", "low");
            img.setAttribute("decoding", "async");
            img.loading = "lazy";

            img.addEventListener('contextmenu', e => e.preventDefault());
            img.addEventListener('click', () => showOverlay(imgUrl));

            div.appendChild(img);
            fragment.appendChild(div);
            observer.observe(img);
        });

        imgs.appendChild(fragment);
    } else if (lelayout === 'img') {
        const imgs2 = document.createElement('div');
        imgs2.classList.add('imgsMansory');
        fragment.appendChild(imgs2);

        details.images.forEach(imgUrl => {
            const img = document.createElement('img');
            img.style.width = '100%';
            img.style.height = 'auto';
            img.style.boxShadow = '0px 0px 20px rgba(0, 0, 0, 0.11)';
            img.style.marginBottom = '2px';
            img.style.breakInside = 'avoid';

            img.setAttribute("data-src", imgUrl);
            img.setAttribute("fetchpriority", "low");
            img.setAttribute("decoding", "async");
            img.loading = "lazy";

            img.addEventListener('contextmenu', e => e.preventDefault());
            img.addEventListener('click', () => showOverlay(imgUrl));

            imgs2.appendChild(img);
            observer.observe(img);
        });

        imgs.appendChild(fragment);
    }
}

// Fonction pour afficher l'overlay
function showOverlay(imgSrc) {

    const overlay = document.createElement('div');
    overlay.classList.add('overlayy');

    const overlayContent = document.createElement('img');
    overlayContent.addEventListener('contextmenu', e => e.preventDefault());
    overlayContent.src = imgSrc;
    overlayContent.style.width = "auto";
    overlayContent.style.maxHeight = "90vh";
    overlayContent.style.maxWidth = "95%";
    
    

    overlay.appendChild(overlayContent);
    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.style.opacity = "1";
        overlay.style.visibility = "visible";
    }, 10);

    overlayContent.addEventListener('click', () => {
        overlay.style.opacity = "0";
        overlay.style.visibility = "hidden";

        setTimeout(() => overlay.remove(), 300);
    });

    overlay.addEventListener('click', () => {
        overlay.style.opacity = "0";
        overlay.style.visibility = "hidden";
        setTimeout(() => overlay.remove(), 300);
    });
}

})()

// function fetchvideo(){
//     const container = document.querySelector('#videos')
//         fetch('/get-videos')
//             .then(response => response.json())
//             .then(videos => {
//                 if(videos.length === 0){
//                     const card = document.createElement('div')
//                     card.classList.add('cardVideos')

//                     const contenttitreprofile = document.createElement('div')
//                         contenttitreprofile.classList.add('contenttitreprofile')
//                     const profil = document.createElement('img')
//                     profil.classList.add('photo-profil-video')
//                     profil.src = '/imgprofile/profile.png'
//                     profil.alt= 'photo de profile'

//                     const titleEl = document.createElement('h3');
//                     titleEl.classList.add('titrevideoC')
//                     titleEl.textContent = "Aucune vidéo disponible pour le moment";
//                     contenttitreprofile.appendChild(profil)
//                         contenttitreprofile.appendChild(titleEl)
                        
//                         card.appendChild(contenttitreprofile);
                        
    
//                         // Ajouter la div au conteneur
//                         container.appendChild(card);
//                 }else{
//                     videos.forEach(video => {
//                         const { titre, description, url } = video;
//                         const videoId = extractVideoId(url);
//                         const card = document.createElement('div')
//                         card.classList.add('cardVideos')
    
//                         const profil = document.createElement('img')
//                         profil.classList.add('photo-profil-video')
//                         profil.src = '/imgprofile/profile.png'
//                         profil.alt= 'photo de profile'
    
//                         const titleEl = document.createElement('h3');
//                         titleEl.classList.add('titrevideoC')
//                         titleEl.textContent = titre;
    
//                     // Créer la description
//                         const descEl = document.createElement('p');
//                         descEl.classList.add('descriptionvideoC')
//                         descEl.textContent = description;
    
    
//                         const div = document.createElement('div')
//                         div.classList.add('contentImgVideoC')
    
//                         const contenttitreprofile = document.createElement('div')
//                         contenttitreprofile.classList.add('contenttitreprofile')
    
//                         // Créer l'image de la miniature
//                         const img = document.createElement('img');
//                         img.style.width =" 100%"
//                         img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
//                         img.alt = `Aperçu de ${titre}`;
    
//                         // Créer le bouton de lecture
//                         const button = document.createElement('img');
//                         button.classList.add('play-btnC');
//                         button.src = 'icon/youtube-color2.svg'
                        
//                         button.addEventListener('click', () => playVideo(videoId,div));
    
    
//                         div.appendChild(img)
//                         div.appendChild(button)
//                         // Ajouter les éléments à la div vidéo
                        
//                         contenttitreprofile.appendChild(profil)
//                         contenttitreprofile.appendChild(titleEl)
//                         card.appendChild(div);
//                         card.appendChild(contenttitreprofile);
//                         card.appendChild(descEl);
    
//                         // Ajouter la div au conteneur
//                         container.appendChild(card);
//                     });
//                 }
                
                
//             })
//             .catch(error => console.error('Erreur lors du chargement des vidéos:', error));
// }

// function extractVideoId(url) {
//     const match = url.match(/(?:youtube\.com\/(?:.*[?&]v=|embed\/)|youtu\.be\/)([^?&]+)/);
//     return match ? match[1] : null;
// }

// function playVideo(videoId, container) {
//     // Créer un élément iframe sécurisé
//     const videoFrame = document.createElement('iframe');
//     videoFrame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
//     videoFrame.height = "300px";
//     videoFrame.style.border="none"
//     videoFrame.width = "100%";
//     videoFrame.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
//     videoFrame.allowFullscreen = true;

//     // Nettoyer la div et y insérer la vidéo
//     container.textContent = ''; 
//     container.appendChild(videoFrame);
// }


