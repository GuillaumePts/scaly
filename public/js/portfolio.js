(()=>{
    let ttabretour = [];
window.datacache = window.datacache || '';


function retour() {
    const photos = document.querySelector('#photos')
    const videos = document.querySelector('#videos')
    
    
    if(ttabretour.length !==0){
        if(photos){
            
            photos.textContent='';
            creatFolderClient(datacache)
            ttabretour=[]

        }
    }else{
        const cardChoice = document.querySelector('#photoOrVideo')
        cardChoice.style.display = "flex"
        if(photos){
            photos.style.display="none"
            photos.textContent=''
        }
    
        if(videos){
            videos.style.display="none"
            videos.textContent=''
        }
    
        
        if(document.querySelector('#returnC')){
            
            document.querySelector('#returnC').style.display="none"
        }
    }
    
}




function addEvent(){
    document.querySelector('#photoc').addEventListener('click', ()=>{
        choisiPhoto()
        
    })

    document.querySelector('#videoc').addEventListener('click', ()=>{
        choisiVideo()
    })
}
addEvent()


function choisiPhoto() {
    const contenu = document.querySelector('#contenu')
    const cardChoice = document.querySelector('#photoOrVideo')
    cardChoice.style.display = "none"
    const photos = document.querySelector('#photos')
    photos.style.display = "flex"
    document.querySelector('#returnC').style.display = "flex"
    
    // On retire l'événement précédent si nécessaire
    const returnCButton = document.querySelector('#returnC');
    returnCButton.removeEventListener('click', retour); // Ici, on retire l'événement précédent si il existe
    returnCButton.addEventListener('click', retour); // On ajoute le nouvel événement

    getContenuPhoto(); // Appel de la fonction pour charger les photos
}



function choisiVideo(){
    const contenu = document.querySelector('#contenu')
    const videos = document.querySelector('#videos')
    const cardChoice = document.querySelector('#photoOrVideo')
    cardChoice.style.display = "none"
    videos.style.display="flex"
    document.querySelector('#returnC').style.display="flex"
    document.querySelector('#returnC').addEventListener('click',()=>{
        retour()
    })

    fetchvideo()

    
}

function fetchPhotos(){
    const container = document.querySelector('#photos')
}

async function getContenuPhoto() {
    try {
        const response = await fetch('/getcontenuphoto');
        if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données');
    }
      const data = await response.json(); // Données reçues depuis le serveur
        creatFolderClient(data)
        datacache=data
    } catch (error) {
        console.error('Erreur :', error);
    }
}


function creatFolderClient(data){

    const content = document.querySelector('#photos')
   
    if(Object.keys(data).length === 0){
        const card = document.createElement('div')
        card.classList.add('cardVideos')

        const contenttitreprofile = document.createElement('div')
            contenttitreprofile.classList.add('contenttitreprofile')
        const profil = document.createElement('img')
        profil.classList.add('photo-profil-video')
        profil.src = '/imgprofile/profile.png'
        profil.alt= 'photo de profile'

        const titleEl = document.createElement('h3');
        titleEl.classList.add('titrevideoC')
        titleEl.textContent = "Aucune photo disponible pour le moment";
        contenttitreprofile.appendChild(profil)
            contenttitreprofile.appendChild(titleEl)
            
            card.appendChild(contenttitreprofile);
            

            // Ajouter la div au conteneur
            content.appendChild(card);
    }else{
        
        for (const [categorie, contenu] of Object.entries(data)) {
        
            const cardPhotos = document.createElement('div')
            cardPhotos.classList.add('cardPhotos')
            const contenttitre = document.createElement('div')
            const titre = document.createElement('h2')
            const affichageNom = categorie.replace(/_/g, ' ');
            titre.textContent= affichageNom
            contenttitre.appendChild(titre)
            cardPhotos.appendChild(contenttitre)
    
            cardPhotos.addEventListener('click',()=>{
                afficherPhotosAll([categorie, contenu])
            })
            
            const div = document.createElement('div')
                div.classList.add('contentsubclient')
                cardPhotos.appendChild(div)
            // Vérifier si c'est une catégorie avec un tableau `images` directement
            if (Array.isArray(contenu.images)) {
                
                contenttitre.classList.add('folderClientWithImgage')
                titre.classList.add('titregrandecatimage')
                contenttitre.style.backgroundImage = `url(${contenu.images[0]})`

                

                
            }else{
                contenttitre.classList.add('folderClient')
                titre.classList.add('titregrandecat')
                
            }
            
            // Vérifier si c'est une catégorie avec des sous-catégories
            if (typeof contenu === "object" && Object.keys(contenu).length > 0) {
    
                const tabcount = []
                for (const [sousCategorie, details] of Object.entries(contenu)) {
                    
                    tabcount.push(sousCategorie)
                    const subdiv = document.createElement('div')
                    subdiv.classList.add('subcategoryclient-select')
                    const subtitre = document.createElement('h2')
                    subtitre.classList.add('subtitre')
                    subtitre.textContent=sousCategorie
                    subdiv.appendChild(subtitre)

                    
                
                    subdiv.addEventListener('click',(event)=>{
                        event.stopPropagation();
                        afficherPhotosAll([categorie, contenu], [sousCategorie, details] )
                    })
        
                    if (Array.isArray(details.images)) {
                        subdiv.style.backgroundImage = `url(${details.images[0]})`
                        div.appendChild(subdiv)
                        // cardPhotos.appendChild(div)
                    }
                }
                if (tabcount.length < 4) {
                    for (let i = tabcount.length; i < 4; i++) {
                        const d = document.createElement('div')
                        d.classList.add('subcategoryclient-select')
                        div.appendChild(d)
                    }
                    tabcount.forEach(el=>{
                        if(el == "images"){
                            const d = document.createElement('div')
                            d.classList.add('subcategoryclient-select')
                            div.appendChild(d)
                        }
                    })
                }
    
            }else{
                for (let i = 0; i != 4; i++) {
                    const d = document.createElement('div')
                    d.classList.add('subcategoryclient-select')
                    div.appendChild(d)
                }
                cardPhotos.style.display="none"
            }
    
            
            content.appendChild(cardPhotos)
    
    
    
        }
    }


    
    
    
}

function afficherPhotosAll(tabComplet, tabSousFolder){

    ttabretour.push(1)
    const contenu = document.querySelector('#photos')
    contenu.style.justifyContent = "start"
    contenu.style.alignItems = "center"
    contenu.style.padding = "0 10px"
    contenu.textContent=""
    const h2 = document.createElement('h2')
    const container = document.createElement('div')
    h2.textContent=tabComplet[0]
    console.log(ttabretour);
    const contentsubfolder = document.createElement('div')
    contentsubfolder.classList.add('selectAll')

    if(tabComplet[1].images){

        const divFolder = document.createElement('div')
        divFolder.classList.add('folderClientWithImgage')
        divFolder.style.backgroundImage=`url(${tabComplet[1].images[0]})`
        divFolder.appendChild(h2)
        h2.classList.add('titregrandecatimage')

        if(tabComplet[1].images.length > 1){
            // ici gérer quand plusieurs images
            const sudivfolder = document.createElement('div')
            sudivfolder.style.borderBottom = "2px solid #666";
            sudivfolder.style.paddingBottom = "10px"
            sudivfolder.classList.add('contentsubclient')
            sudivfolder.appendChild(divFolder)
            

            tabComplet[1].images.forEach(img =>{
                const div = document.createElement('div')
                div.classList.add('subcategoryclient')
                div.style.backgroundImage=`url(${img})`
                sudivfolder.appendChild(div)
            })

            contenu.appendChild(sudivfolder)

            

        }else{
            contentsubfolder.appendChild(divFolder)
            divFolder.style.borderBottom = "2px solid #666";
            divFolder.style.paddingBottom = "10px"
        }
        
    }else{
        // quand pas d'images
        h2.classList.add('titregrandecat')
        contentsubfolder.appendChild(h2)
        
    }

    
    


    if (typeof tabComplet[1] === "object" && Object.keys(tabComplet[1]).length > 0) {

        const div = document.createElement('div')
        div.classList.add('contentsubclient')

        for (const [sousCategorie, details] of Object.entries(tabComplet[1])) {

            if(sousCategorie !== "images"){

                const subdiv = document.createElement('div')
                subdiv.id = sousCategorie
                subdiv.classList.add('subcategoryclient')
                const backgroundavecimage = document.createElement('div')
                subdiv.appendChild(backgroundavecimage)
                const subtitre = document.createElement('h2')
                subtitre.classList.add('h2outil')
                subtitre.textContent= sousCategorie
                subdiv.appendChild(subtitre)
                
                div.appendChild(subdiv)
                contentsubfolder.appendChild(div)
                contenu.appendChild(contentsubfolder)

                subdiv.addEventListener('click',()=>{
                    imgall(details,sousCategorie,selectLayout)
                    
                })

                if (Array.isArray(details.images)) {
                    backgroundavecimage.style.backgroundImage = `url(${details.images[0]})`
                    div.appendChild(subdiv)
                    
                }
                
            }

            
        }

    }

    
    
    if(tabSousFolder){
        imgall(tabSousFolder[1],tabSousFolder[0],selectLayout)
    }
    


}


window.selectLayout = window.selectLayout || "div"

function imgall(details, name, lelayout) {
    // Supprimer l'ancien contenu si existant
    if (document.querySelector('.contentimg')) {
        document.querySelector('.contentimg').remove();
    }

    // const els = document.querySelectorAll('.subcategoryclient');
    // els.forEach(el => {
    //     el.style.borderRadius = "";
    // });
    // document.querySelector(`#${name}`).style.borderRadius = "50%";

    const contentimg = document.createElement('div');
    contentimg.classList.add('contentimg');
    contentimg.style.width = "100%";
    document.querySelector('#photos').appendChild(contentimg);

    const outils = document.createElement('div');
    outils.classList.add('outils');
    contentimg.appendChild(outils);
    outils.scrollIntoView({ behavior: 'smooth', block: 'start' });
    outils.addEventListener('click',()=>{
        // Création de l'overlay
  const overlay = document.createElement('div');
  overlay.classList.add('overlayy');

  // Création du contenu de l'overlay
  const overlayContent = document.createElement('div');
  overlayContent.classList.add('overlay-content');

  // Création du bouton de fermeture
  const closeBtn = document.createElement('button');
  closeBtn.classList.add('close-btn');
  closeBtn.textContent = '✖';

  const layoutDiv = document.createElement('img')
  layoutDiv.classList.add('layoutbutton')
  layoutDiv.src = "icon/layout-div.svg"
  const layoutImg = document.createElement('img')
  layoutImg.classList.add('layoutbutton')
  layoutImg.style.transform = "rotate(90deg)"
  layoutImg.src = "icon/layout-img.svg"

  // Ajout des éléments dans le contenu
  overlayContent.appendChild(closeBtn);
  overlayContent.appendChild(layoutDiv)
  overlayContent.appendChild(layoutImg)

  layoutDiv.addEventListener('click',()=>{
      window.selectLayout = "div"
      imgall(details,name,"div")
      overlay.style.opacity = "0";
      overlay.style.visibility = "hidden";
      setTimeout(() => overlay.remove(), 300); 
  })

  layoutImg.addEventListener('click',()=>{
      window.selectLayout = "img"
      imgall(details,name,"img")
      overlay.style.opacity = "0";
      overlay.style.visibility = "hidden";
      setTimeout(() => overlay.remove(), 300); 
  })

  // Ajout du contenu dans l'overlay
  overlay.appendChild(overlayContent);

  // Ajout de l'overlay dans le body
  document.body.appendChild(overlay);

  // Ajout d'un événement pour fermer l'overlay
  closeBtn.addEventListener('click', () => {
      overlay.style.opacity = "0";
      overlay.style.visibility = "hidden";
      setTimeout(() => overlay.remove(), 300); // Supprime après animation
  });

  // Applique l'animation d'apparition
  setTimeout(() => {
      overlay.style.opacity = "1";
      overlay.style.visibility = "visible";
  }, 10);
  })

    const h2 = document.createElement('h2');
    h2.classList.add('h2outil');
    h2.textContent = name;
    outils.appendChild(h2);

    const layout = document.createElement('img');
    layout.classList.add('layout');
    layout.src = "/icon/layout.svg";
    outils.appendChild(layout);

    const imgs = document.createElement('div');
    imgs.classList.add('contentsubclient');
    contentimg.appendChild(imgs);

    // Initialisation de l'observateur
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.intersectionRatio > 0) {
                entry.target.classList.add('visible');
            }
            if (entry.boundingClientRect.top > window.innerHeight || entry.boundingClientRect.bottom < 0) {
                entry.target.classList.remove('visible');
            }
        });
    }, { 
        threshold: 0, 
        rootMargin: "0px"
    });

    // Ajout des images et observation
    if (lelayout === 'div') {
        details.images.forEach(img => {
            const div = document.createElement('div');
            const limg = document.createElement('img');

            limg.src = img;
            limg.classList.add('animphoto');
            limg.setAttribute("fetchpriority", "high");
            limg.setAttribute("decoding", "sync");

            div.appendChild(limg);
            div.classList.add('subcategoryclient-b');
            imgs.appendChild(div);

            observer.observe(limg); // Observer l'image

            div.addEventListener('click', () => {
                showOverlay(img);
            });
            div.addEventListener('mousemove', (e) => {
                const { offsetX, offsetY, target } = e;
                const xRotation = ((offsetY / target.offsetHeight) - 0.5) * 20;
                const yRotation = ((offsetX / target.offsetWidth) - 0.5) * 20;
            
                target.style.transform = `perspective(800px) rotateX(${xRotation}deg) rotateY(${yRotation}deg)`;
            });
            
            div.addEventListener('mouseleave', (e) => {
                e.target.style.transform = 'perspective(800px) rotateX(0) rotateY(0)';
            });


        });
    } else if (lelayout === 'img') {
        details.images.forEach(img => {
            const limg = document.createElement('img');
            limg.style.width = '100%';
            limg.loading = "lazy";
            limg.src = img;
            imgs.appendChild(limg);

            observer.observe(limg); // Observer l'image

            limg.addEventListener('click', () => {
                showOverlay(img);
            });
            limg.addEventListener('mousemove', (e) => {
                const { offsetX, offsetY, target } = e;
                const xRotation = ((offsetY / target.offsetHeight) - 0.5) * 20;
                const yRotation = ((offsetX / target.offsetWidth) - 0.5) * 20;
            
                target.style.transform = `perspective(800px) rotateX(${xRotation}deg) rotateY(${yRotation}deg)`;
            });
            
            limg.addEventListener('mouseleave', (e) => {
                e.target.style.transform = 'perspective(800px) rotateX(0) rotateY(0)';
            });
        });
    }
}


// Fonction pour afficher l'overlay
function showOverlay(imgSrc) {

    const overlay = document.createElement('div');
    overlay.classList.add('overlayy');

    const overlayContent = document.createElement('img');
    overlayContent.src = imgSrc;
    overlayContent.style.width = "90%";
    overlayContent.style.maxHeight = "100vh";
    overlayContent.addEventListener('touchmove', (e) => {
        const touch = e.touches[0]; // Premier point de contact
        const { clientX, clientY } = touch;
        
        const rect = e.target.getBoundingClientRect(); // Dimensions de l'élément
        const offsetX = clientX - rect.left;
        const offsetY = clientY - rect.top;
    
        const xRotation = ((offsetY / rect.height) - 0.5) * 20;
        const yRotation = ((offsetX / rect.width) - 0.5) * 20;
    
        e.target.style.transform = `perspective(800px) rotateX(${xRotation}deg) rotateY(${yRotation}deg)`;
    });
    
    overlayContent.addEventListener('touchend', (e) => {
        e.target.style.transform = 'perspective(800px) rotateX(0) rotateY(0)';
    });
    

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



function fetchvideo(){
    const container = document.querySelector('#videos')
        fetch('/get-videos')
            .then(response => response.json())
            .then(videos => {
                if(videos.length === 0){
                    const card = document.createElement('div')
                    card.classList.add('cardVideos')

                    const contenttitreprofile = document.createElement('div')
                        contenttitreprofile.classList.add('contenttitreprofile')
                    const profil = document.createElement('img')
                    profil.classList.add('photo-profil-video')
                    profil.src = '/imgprofile/profile.png'
                    profil.alt= 'photo de profile'

                    const titleEl = document.createElement('h3');
                    titleEl.classList.add('titrevideoC')
                    titleEl.textContent = "Aucune vidéo disponible pour le moment";
                    contenttitreprofile.appendChild(profil)
                        contenttitreprofile.appendChild(titleEl)
                        
                        card.appendChild(contenttitreprofile);
                        
    
                        // Ajouter la div au conteneur
                        container.appendChild(card);
                }else{
                    videos.forEach(video => {
                        const { titre, description, url } = video;
                        const videoId = extractVideoId(url);
                        const card = document.createElement('div')
                        card.classList.add('cardVideos')
    
                        const profil = document.createElement('img')
                        profil.classList.add('photo-profil-video')
                        profil.src = '/imgprofile/profile.png'
                        profil.alt= 'photo de profile'
    
                        const titleEl = document.createElement('h3');
                        titleEl.classList.add('titrevideoC')
                        titleEl.textContent = titre;
    
                    // Créer la description
                        const descEl = document.createElement('p');
                        descEl.classList.add('descriptionvideoC')
                        descEl.textContent = description;
    
    
                        const div = document.createElement('div')
                        div.classList.add('contentImgVideoC')
    
                        const contenttitreprofile = document.createElement('div')
                        contenttitreprofile.classList.add('contenttitreprofile')
    
                        // Créer l'image de la miniature
                        const img = document.createElement('img');
                        img.style.width =" 100%"
                        img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                        img.alt = `Aperçu de ${titre}`;
    
                        // Créer le bouton de lecture
                        const button = document.createElement('img');
                        button.classList.add('play-btnC');
                        button.src = 'icon/youtube-color2.svg'
                        
                        button.addEventListener('click', () => playVideo(videoId,div));
    
    
                        div.appendChild(img)
                        div.appendChild(button)
                        // Ajouter les éléments à la div vidéo
                        
                        contenttitreprofile.appendChild(profil)
                        contenttitreprofile.appendChild(titleEl)
                        card.appendChild(div);
                        card.appendChild(contenttitreprofile);
                        card.appendChild(descEl);
    
                        // Ajouter la div au conteneur
                        container.appendChild(card);
                    });
                }
                
                
            })
            .catch(error => console.error('Erreur lors du chargement des vidéos:', error));
}

function extractVideoId(url) {
    const match = url.match(/(?:youtube\.com\/(?:.*[?&]v=|embed\/)|youtu\.be\/)([^?&]+)/);
    return match ? match[1] : null;
}

function playVideo(videoId, container) {
    // Créer un élément iframe sécurisé
    const videoFrame = document.createElement('iframe');
    videoFrame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    videoFrame.height = "300px";
    videoFrame.style.border="none"
    videoFrame.width = "100%";
    videoFrame.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
    videoFrame.allowFullscreen = true;

    // Nettoyer la div et y insérer la vidéo
    container.textContent = ''; 
    container.appendChild(videoFrame);
}


})()