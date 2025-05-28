// (()=>{
//     let ttabretour = [];
// window.datacache = window.datacache || '';


// function retour() {
//     const photos = document.querySelector('#photos')
//     const videos = document.querySelector('#videos')
    
    
//     if(ttabretour.length !==0){
//         if(photos){
            
//             photos.textContent='';
//             creatFolderClient(datacache)
//             ttabretour=[]

//         }
//     }else{
//         const cardChoice = document.querySelector('#photoOrVideo')
//         cardChoice.style.display = "flex"
//         if(photos){
//             photos.style.display="none"
//             photos.textContent=''
//         }
    
//         if(videos){
//             videos.style.display="none"
//             videos.textContent=''
//         }
    
        
//         if(document.querySelector('#returnC')){
            
//             document.querySelector('#returnC').style.display="none"
//         }
//     }
    
// }




// function addEvent(){
//     document.querySelector('#photoc').addEventListener('click', ()=>{
//         choisiPhoto()
        
//     })

//     document.querySelector('#videoc').addEventListener('click', ()=>{
//         choisiVideo()
//     })
// }
// addEvent()


// function choisiPhoto() {
//     const contenu = document.querySelector('#contenu')
//     const cardChoice = document.querySelector('#photoOrVideo')
//     cardChoice.style.display = "none"
//     const photos = document.querySelector('#photos')
//     photos.style.display = "flex"
//     document.querySelector('#returnC').style.display = "flex"
    
//     // On retire l'événement précédent si nécessaire
//     const returnCButton = document.querySelector('#returnC');
//     returnCButton.removeEventListener('click', retour); // Ici, on retire l'événement précédent si il existe
//     returnCButton.addEventListener('click', retour); // On ajoute le nouvel événement

//     getContenuPhoto(); // Appel de la fonction pour charger les photos
// }



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

// async function getContenuPhoto() {
//     try {
//         const response = await fetch('/getcontenuphoto');
//         if (!response.ok) {
//         throw new Error('Erreur lors de la récupération des données');
//     }
//       const data = await response.json(); // Données reçues depuis le serveur
//         creatFolderClient(data)
//         datacache=data
//     } catch (error) {
//         console.error('Erreur :', error);
//     }
// }


// function creatFolderClient(data){

//     const content = document.querySelector('#photos')
   
//     if(Object.keys(data).length === 0){
//         const card = document.createElement('div')
//         card.classList.add('cardVideos')

//         const contenttitreprofile = document.createElement('div')
//             contenttitreprofile.classList.add('contenttitreprofile')
//         const profil = document.createElement('img')
//         profil.classList.add('photo-profil-video')
//         profil.src = '/imgprofile/profile.png'
//         profil.alt= 'photo de profile'

//         const titleEl = document.createElement('h3');
//         titleEl.classList.add('titrevideoC')
//         titleEl.textContent = "Aucune photo disponible pour le moment";
//         contenttitreprofile.appendChild(profil)
//             contenttitreprofile.appendChild(titleEl)
            
//             card.appendChild(contenttitreprofile);
            

//             // Ajouter la div au conteneur
//             content.appendChild(card);
//     }else{
        
//         for (const [categorie, contenu] of Object.entries(data)) {
        
//             const cardPhotos = document.createElement('div')
//             cardPhotos.classList.add('cardPhotos')
//             const contenttitre = document.createElement('div')
//             const titre = document.createElement('h2')
//             const affichageNom = categorie.replace(/_/g, ' ');
//             titre.textContent= affichageNom
//             contenttitre.appendChild(titre)
//             cardPhotos.appendChild(contenttitre)
    
//             cardPhotos.addEventListener('click',()=>{
//                 afficherPhotosAll([categorie, contenu])
//             })
            
//             const div = document.createElement('div')
//                 div.classList.add('contentsubclient')
//                 cardPhotos.appendChild(div)
//             // Vérifier si c'est une catégorie avec un tableau `images` directement
//             if (Array.isArray(contenu.images)) {
                
//                 contenttitre.classList.add('folderClientWithImgage')
//                 titre.classList.add('titregrandecatimage')
//                 contenttitre.style.backgroundImage = `url(${contenu.images[0]})`

                

                
//             }else{
//                 contenttitre.classList.add('folderClient')
//                 titre.classList.add('titregrandecat')
                
//             }
            
//             // Vérifier si c'est une catégorie avec des sous-catégories
//             if (typeof contenu === "object" && Object.keys(contenu).length > 0) {
    
//                 const tabcount = []
//                 for (const [sousCategorie, details] of Object.entries(contenu)) {
                    
//                     tabcount.push(sousCategorie)
//                     const subdiv = document.createElement('div')
//                     subdiv.classList.add('subcategoryclient-select')
//                     const subtitre = document.createElement('h2')
//                     subtitre.classList.add('subtitre')
//                     subtitre.textContent=sousCategorie
//                     subdiv.appendChild(subtitre)

                    
                
//                     subdiv.addEventListener('click',(event)=>{
//                         event.stopPropagation();
//                         afficherPhotosAll([categorie, contenu], [sousCategorie, details] )
//                     })
        
//                     if (Array.isArray(details.images)) {
//                         subdiv.style.backgroundImage = `url(${details.images[0]})`
//                         div.appendChild(subdiv)
//                         // cardPhotos.appendChild(div)
//                     }
//                 }
//                 if (tabcount.length < 4) {
//                     for (let i = tabcount.length; i < 4; i++) {
//                         const d = document.createElement('div')
//                         d.classList.add('subcategoryclient-select')
//                         div.appendChild(d)
//                     }
//                     tabcount.forEach(el=>{
//                         if(el == "images"){
//                             const d = document.createElement('div')
//                             d.classList.add('subcategoryclient-select')
//                             div.appendChild(d)
//                         }
//                     })
//                 }
    
//             }else{
//                 for (let i = 0; i != 4; i++) {
//                     const d = document.createElement('div')
//                     d.classList.add('subcategoryclient-select')
//                     div.appendChild(d)
//                 }
//                 cardPhotos.style.display="none"
//             }
    
            
//             content.appendChild(cardPhotos)
    
    
    
//         }
//     }


    
    
    
// }

// function afficherPhotosAll(tabComplet, tabSousFolder){

//     ttabretour.push(1)
//     const contenu = document.querySelector('#photos')
//     contenu.style.justifyContent = "start"
//     contenu.style.alignItems = "center"
//     contenu.style.padding = "0 10px"
//     contenu.textContent=""
//     const h2 = document.createElement('h2')
//     const container = document.createElement('div')
//     h2.textContent=tabComplet[0]
//     console.log(ttabretour);
//     const contentsubfolder = document.createElement('div')
//     contentsubfolder.classList.add('selectAll')

//     if(tabComplet[1].images){

//         const divFolder = document.createElement('div')
//         divFolder.classList.add('folderClientWithImgage')
//         divFolder.style.backgroundImage=`url(${tabComplet[1].images[0]})`
//         divFolder.appendChild(h2)
//         h2.classList.add('titregrandecatimage')

//         if(tabComplet[1].images.length > 1){
//             // ici gérer quand plusieurs images
//             const sudivfolder = document.createElement('div')
//             sudivfolder.style.borderBottom = "2px solid #666";
//             sudivfolder.style.paddingBottom = "10px"
//             sudivfolder.classList.add('contentsubclient')
//             sudivfolder.appendChild(divFolder)
            

//             tabComplet[1].images.forEach(img =>{
//                 const div = document.createElement('div')
//                 div.classList.add('subcategoryclient')
//                 div.style.backgroundImage=`url(${img})`
//                 sudivfolder.appendChild(div)
//             })

//             contenu.appendChild(sudivfolder)

            

//         }else{
//             contentsubfolder.appendChild(divFolder)
//             divFolder.style.borderBottom = "2px solid #666";
//             divFolder.style.paddingBottom = "10px"
//         }
        
//     }else{
//         // quand pas d'images
//         h2.classList.add('titregrandecat')
//         contentsubfolder.appendChild(h2)
        
//     }

    
    


//     if (typeof tabComplet[1] === "object" && Object.keys(tabComplet[1]).length > 0) {

//         const div = document.createElement('div')
//         div.classList.add('contentsubclient')

//         for (const [sousCategorie, details] of Object.entries(tabComplet[1])) {

//             if(sousCategorie !== "images"){

//                 const subdiv = document.createElement('div')
//                 subdiv.id = sousCategorie
//                 subdiv.classList.add('subcategoryclient')
//                 const backgroundavecimage = document.createElement('div')
//                 subdiv.appendChild(backgroundavecimage)
//                 const subtitre = document.createElement('h2')
//                 subtitre.classList.add('h2outil')
//                 subtitre.textContent= sousCategorie
//                 subdiv.appendChild(subtitre)
                
//                 div.appendChild(subdiv)
//                 contentsubfolder.appendChild(div)
//                 contenu.appendChild(contentsubfolder)

//                 subdiv.addEventListener('click',()=>{
//                     imgall(details,sousCategorie,selectLayout)
                    
//                 })

//                 if (Array.isArray(details.images)) {
//                     backgroundavecimage.style.backgroundImage = `url(${details.images[0]})`
//                     div.appendChild(subdiv)
                    
//                 }
                
//             }

            
//         }

//     }

    
    
//     if(tabSousFolder){
//         imgall(tabSousFolder[1],tabSousFolder[0],selectLayout)
//     }
    


// }


// window.selectLayout = window.selectLayout || "div"

// function imgall(details, name, lelayout) {
//     // Supprimer l'ancien contenu si existant
//     if (document.querySelector('.contentimg')) {
//         document.querySelector('.contentimg').remove();
//     }

//     // const els = document.querySelectorAll('.subcategoryclient');
//     // els.forEach(el => {
//     //     el.style.borderRadius = "";
//     // });
//     // document.querySelector(`#${name}`).style.borderRadius = "50%";

//     const contentimg = document.createElement('div');
//     contentimg.classList.add('contentimg');
//     contentimg.style.width = "100%";
//     document.querySelector('#photos').appendChild(contentimg);

//     const outils = document.createElement('div');
//     outils.classList.add('outils');
//     contentimg.appendChild(outils);
//     outils.scrollIntoView({ behavior: 'smooth', block: 'start' });
//     outils.addEventListener('click',()=>{
//         // Création de l'overlay
//   const overlay = document.createElement('div');
//   overlay.classList.add('overlayy');

//   // Création du contenu de l'overlay
//   const overlayContent = document.createElement('div');
//   overlayContent.classList.add('overlay-content');

//   // Création du bouton de fermeture
//   const closeBtn = document.createElement('button');
//   closeBtn.classList.add('close-btn');
//   closeBtn.textContent = '✖';

//   const layoutDiv = document.createElement('img')
//   layoutDiv.classList.add('layoutbutton')
//   layoutDiv.src = "icon/layout-div.svg"
//   const layoutImg = document.createElement('img')
//   layoutImg.classList.add('layoutbutton')
//   layoutImg.style.transform = "rotate(90deg)"
//   layoutImg.src = "icon/layout-img.svg"

//   // Ajout des éléments dans le contenu
//   overlayContent.appendChild(closeBtn);
//   overlayContent.appendChild(layoutDiv)
//   overlayContent.appendChild(layoutImg)

//   layoutDiv.addEventListener('click',()=>{
//       window.selectLayout = "div"
//       imgall(details,name,"div")
//       overlay.style.opacity = "0";
//       overlay.style.visibility = "hidden";
//       setTimeout(() => overlay.remove(), 300); 
//   })

//   layoutImg.addEventListener('click',()=>{
//       window.selectLayout = "img"
//       imgall(details,name,"img")
//       overlay.style.opacity = "0";
//       overlay.style.visibility = "hidden";
//       setTimeout(() => overlay.remove(), 300); 
//   })

//   // Ajout du contenu dans l'overlay
//   overlay.appendChild(overlayContent);

//   // Ajout de l'overlay dans le body
//   document.body.appendChild(overlay);

//   // Ajout d'un événement pour fermer l'overlay
//   closeBtn.addEventListener('click', () => {
//       overlay.style.opacity = "0";
//       overlay.style.visibility = "hidden";
//       setTimeout(() => overlay.remove(), 300); // Supprime après animation
//   });

//   // Applique l'animation d'apparition
//   setTimeout(() => {
//       overlay.style.opacity = "1";
//       overlay.style.visibility = "visible";
//   }, 10);
//   })

//     const h2 = document.createElement('h2');
//     h2.classList.add('h2outil');
//     h2.textContent = name;
//     outils.appendChild(h2);

//     const layout = document.createElement('img');
//     layout.classList.add('layout');
//     layout.src = "/icon/layout.svg";
//     outils.appendChild(layout);

//     const imgs = document.createElement('div');
//     imgs.classList.add('contentsubclient');
//     contentimg.appendChild(imgs);

//     // Initialisation de l'observateur
//     const observer = new IntersectionObserver((entries) => {
//         entries.forEach(entry => {
//             if (entry.intersectionRatio > 0) {
//                 entry.target.classList.add('visible');
//             }
//             if (entry.boundingClientRect.top > window.innerHeight || entry.boundingClientRect.bottom < 0) {
//                 entry.target.classList.remove('visible');
//             }
//         });
//     }, { 
//         threshold: 0, 
//         rootMargin: "0px"
//     });

//     // Ajout des images et observation
//     if (lelayout === 'div') {
//         details.images.forEach(img => {
//             const div = document.createElement('div');
//             const limg = document.createElement('img');

//             limg.src = img;
//             limg.classList.add('animphoto');
//             limg.setAttribute("fetchpriority", "high");
//             limg.setAttribute("decoding", "sync");

//             div.appendChild(limg);
//             div.classList.add('subcategoryclient-b');
//             imgs.appendChild(div);

//             observer.observe(limg); // Observer l'image

//             div.addEventListener('click', () => {
//                 showOverlay(img);
//             });
//             div.addEventListener('mousemove', (e) => {
//                 const { offsetX, offsetY, target } = e;
//                 const xRotation = ((offsetY / target.offsetHeight) - 0.5) * 20;
//                 const yRotation = ((offsetX / target.offsetWidth) - 0.5) * 20;
            
//                 target.style.transform = `perspective(800px) rotateX(${xRotation}deg) rotateY(${yRotation}deg)`;
//             });
            
//             div.addEventListener('mouseleave', (e) => {
//                 e.target.style.transform = 'perspective(800px) rotateX(0) rotateY(0)';
//             });


//         });
//     } else if (lelayout === 'img') {
//         details.images.forEach(img => {
//             const limg = document.createElement('img');
//             limg.style.width = '100%';
//             limg.loading = "lazy";
//             limg.src = img;
//             imgs.appendChild(limg);

//             observer.observe(limg); // Observer l'image

//             limg.addEventListener('click', () => {
//                 showOverlay(img);
//             });
//             limg.addEventListener('mousemove', (e) => {
//                 const { offsetX, offsetY, target } = e;
//                 const xRotation = ((offsetY / target.offsetHeight) - 0.5) * 20;
//                 const yRotation = ((offsetX / target.offsetWidth) - 0.5) * 20;
            
//                 target.style.transform = `perspective(800px) rotateX(${xRotation}deg) rotateY(${yRotation}deg)`;
//             });
            
//             limg.addEventListener('mouseleave', (e) => {
//                 e.target.style.transform = 'perspective(800px) rotateX(0) rotateY(0)';
//             });
//         });
//     }
// }


// // Fonction pour afficher l'overlay
// function showOverlay(imgSrc) {

//     const overlay = document.createElement('div');
//     overlay.classList.add('overlayy');

//     const overlayContent = document.createElement('img');
//     overlayContent.src = imgSrc;
//     overlayContent.style.width = "90%";
//     overlayContent.style.maxHeight = "100vh";
//     overlayContent.addEventListener('touchmove', (e) => {
//         const touch = e.touches[0]; // Premier point de contact
//         const { clientX, clientY } = touch;
        
//         const rect = e.target.getBoundingClientRect(); // Dimensions de l'élément
//         const offsetX = clientX - rect.left;
//         const offsetY = clientY - rect.top;
    
//         const xRotation = ((offsetY / rect.height) - 0.5) * 20;
//         const yRotation = ((offsetX / rect.width) - 0.5) * 20;
    
//         e.target.style.transform = `perspective(800px) rotateX(${xRotation}deg) rotateY(${yRotation}deg)`;
//     });
    
//     overlayContent.addEventListener('touchend', (e) => {
//         e.target.style.transform = 'perspective(800px) rotateX(0) rotateY(0)';
//     });
    

//     overlay.appendChild(overlayContent);
//     document.body.appendChild(overlay);

//     setTimeout(() => {
//         overlay.style.opacity = "1";
//         overlay.style.visibility = "visible";
//     }, 10);

//     overlayContent.addEventListener('click', () => {
//         overlay.style.opacity = "0";
//         overlay.style.visibility = "hidden";

//         setTimeout(() => overlay.remove(), 300);
//     });

//     overlay.addEventListener('click', () => {
//         overlay.style.opacity = "0";
//         overlay.style.visibility = "hidden";
//         setTimeout(() => overlay.remove(), 300);
//     });
// }



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


// })()
// // ancien
// function creatSubFolders(tabsub) {
    
//     const parent = document.querySelector('#lesSousDossiers');
//     const allsubfolder = document.querySelectorAll('.contentsoussvgfolder');
//     if (allsubfolder) {
//         allsubfolder.forEach(folder => folder.remove());
//     }

//     if (!tabsub) {
//         console.log('Pas de sous-dossiers');
//         document.querySelector('#countsubFolder').textContent = "0"
//         document.querySelector('#countsubFolder').style.backgroundColor = "#c13434"
//     } else {
//         document.querySelector('#countsubFolder').textContent = tabsub.length;
//         document.querySelector('#countsubFolder').style.backgroundColor = "#fff"
//         tabsub.forEach(sub => {
//             const div = document.createElement('div');
//             div.classList.add('contentsoussvgfolder');

//             const h3 = document.createElement('h3');
//             h3.classList.add('titresousdossier');
//             h3.textContent = sub.subcategoryName;

//             const div2 = document.createElement('div');
//             div2.style.position = 'relative';

//             const svg = document.createElement('img');
//             svg.alt = "Icône d'un dossier en SVG, cliquez dessus pour afficher les photos";
//             svg.classList.add('svgsousFolder');
//             svg.src = 'icon/folder.svg';

//             const divlogo = document.createElement('div');
//             divlogo.classList.add('containerLogosousFolder');

//             const background = document.createElement('div');
//             background.classList.add('background');

//             const logo = document.createElement('img');
//             logo.classList.add('imgsousFolder');
//             logo.src = 'logo/logotransparant.png';
//             logo.alt = 'Logo siteUp';

//             const remove = document.createElement('div');
//             remove.classList.add('removesubfolder');
//             const bg = document.createElement('div')
//             bg.classList.add('background')
//             const svgremove = document.createElement('img')
//             svgremove.src = "icon/remove.svg"
//             remove.appendChild(bg)
//             bg.appendChild(svgremove)
//             remove.addEventListener('click', () => {
//                 const folder = document.querySelector('#titrefolder').textContent; // Assuming there's an element with id 'titrefolder'
//                 const subFolder = sub.subcategoryName; // Assuming sub.subcategoryName contains the subfolder name
            
//                 if (!folder || !subFolder) {
//                     console.error('Both folder and subfolder names must be provided for deletion');
//                     return;
//                 }
            
//                 console.log(`Je vais supprimer le sous-dossier ${subFolder} du dossier ${folder}`);
            
//                 fetch('/remove-sub-folder', {
//                     method: 'DELETE',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify({ folder, subFolder }),
//                 })
//                 .then(response => response.json())
//                 .then(data => {
//                     if (data.success) {
//                         getContenuPhoto();
//                     } else {
//                         console.error(data.message);
//                     }
//                 })
//                 .catch(error => console.error('Erreur:', error));
//             });

//             const edit = document.createElement('div');
//             edit.classList.add('editsubfolder');
//             const bgedit = document.createElement('div')
//             bgedit.classList.add('background')
//             const svgedit = document.createElement('img')
//             svgedit.src = "icon/folder-edit.svg"
//             edit.appendChild(bgedit)
//             bgedit.appendChild(svgedit)
            
//             edit.addEventListener('click', () => {
//                 const folder = document.querySelector('#titrefolder').textContent; // Assuming there's an element with id 'titrefolder'
//                 const oldSubFolder = sub.subcategoryName; // Assuming sub.subcategoryName contains the current subfolder name
            
//                 if (!folder || !oldSubFolder) {
//                     console.error('Both folder and subfolder names must be provided for editing');
//                     return;
//                 }
            
//                 // Create an overlay for editing the subfolder name
//                 const overlay = document.createElement('div');
//                 overlay.style.position = 'fixed';
//                 overlay.style.top = 0;
//                 overlay.style.left = 0;
//                 overlay.style.width = '100%';
//                 overlay.style.height = '100vh';
//                 overlay.style.zIndex = '100000';
//                 overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
//                 overlay.style.display = 'flex';
//                 overlay.style.flexDirection = 'column';
//                 overlay.style.justifyContent = 'center';
//                 overlay.style.alignItems = 'center';
            
//                 const form = document.createElement('div');
//                 form.classList.add('form-subfolder-creat');
            
//                 const h2 = document.createElement('h2');
//                 h2.textContent = `Modifier le sous-dossier : ${oldSubFolder}`;
//                 h2.classList.add('h2-subfolder')
            
//                 const input = document.createElement('input');
//                 input.placeholder = "Nouveau nom du sous-dossier";
//                 input.classList.add('input-subfolder')
//                 input.value = oldSubFolder;
            
//                 const contentbutton = document.createElement('div');
//                 contentbutton.style.display = 'flex';
//                 contentbutton.style.justifyContent = 'center';
//                 contentbutton.style.alignItems = 'center';
//                 contentbutton.style.gap = '25px';
            
//                 const saveButton = document.createElement('button');
//                 saveButton.classList.add('buttonform')
//                 saveButton.textContent = 'Enregistrer';

//                 const bg = document.createElement('div');
//                 bg.classList.add('background-button')
//                 bg.appendChild(saveButton)
            
//                 const closeButton = document.createElement('button');
//                 closeButton.classList.add('button-close-subfolder')
//                 closeButton.textContent = 'Annuler';
            
//                 saveButton.addEventListener('click', () => {
//                     const newSubFolder = input.value;
            
//                     if (!newSubFolder || newSubFolder === oldSubFolder) {
//                         console.error('Provide a valid new name for the subfolder');
//                         return;
//                     }
            
//                     fetch('/edit-sub-folder', {
//                         method: 'PUT',
//                         headers: {
//                             'Content-Type': 'application/json',
//                         },
//                         body: JSON.stringify({ folder, oldSubFolder, newSubFolder }),
//                     })
//                     .then(response => response.json())
//                     .then(data => {
//                         if (data.success) {
//                             console.log(`Sous-dossier renommé en ${newSubFolder} dans ${folder}`);
//                             document.body.removeChild(overlay);
//                             getContenuPhoto();
//                         } else {
//                             console.error(data.message);
//                         }
//                     })
//                     .catch(error => console.error('Erreur:', error));
//                 });
            
//                 closeButton.addEventListener('click', () => {
//                     document.body.removeChild(overlay);
//                 });
            
//                 contentbutton.appendChild(bg);
//                 contentbutton.appendChild(closeButton);
            
//                 form.appendChild(h2);
//                 form.appendChild(input);
//                 form.appendChild(contentbutton);
            
//                 overlay.appendChild(form);
            
//                 document.body.appendChild(overlay);
//             });

//             parent.appendChild(div);
//             div.appendChild(h3);
//             div.appendChild(div2);
//             div2.appendChild(svg);
//             div2.appendChild(divlogo);
//             div2.appendChild(edit)
//             div2.appendChild(remove)
//             divlogo.appendChild(background);
//             background.appendChild(logo);

//             // Gestion des sous-dossiers : cliquer pour afficher les images
//             div.addEventListener('click', () => {
//                 const tabEls  = document.querySelectorAll('.contentsoussvgfolder')
//                 tabEls.forEach(tabEl =>{
//                     tabEl.style.transform = 'scale(1)'
//                 })
//                 logo.classList.add('animrotate')
//                 subChoisi = sub.subcategoryName
//                 document.querySelector('#chemin').textContent = `${document.querySelector('#titrefolder').textContent}/${sub.subcategoryName}`
//                 setTimeout(() => {logo.classList.remove('animrotate')}, 250);
//                 addImages(sub.images);
//                 div.style.transform = 'scale(1.2)'
//                 document.querySelector('#contentsvgfolder').style.transform = 'scale(1)'
//             });
//         });
//     }
// }

// function overlayRemove(){

// }



// function addImages(tabsrc) {
    
//     const parent = document.querySelector('#afficherphotos');
//     parent.textContent = "";
//     document.querySelector('#countPhoto').textContent = tabsrc.length;
//     if (Number(document.querySelector('#countPhoto').textContent) === 0) {
//         document.querySelector('#countPhoto').style.backgroundColor = "#c13434";
//     }else{
//         document.querySelector('#countPhoto').style.backgroundColor = "#fff";
//     }

//     let delay = 0; // Pour l'affichage progressif

//     tabsrc.forEach((src, index) => {
//         const imgDiv = document.createElement('div');
//         imgDiv.classList.add('img-gallery');

//         // Loader pendant le chargement de l'image
//         const loader = document.createElement('div');
//         loader.classList.add('loader');
//         imgDiv.appendChild(loader);

//         const img = new Image();
//         img.src = src;
        

//         img.onload = () => {
//             imgDiv.style.backgroundImage = `url(${src})`;
//             setTimeout(() => {
//                 imgDiv.classList.add('loaded'); // Ajout d'un effet CSS
//                 loader.remove();
//                 parent.appendChild(imgDiv);

//             }, delay);
//             delay += 100; // Décalage entre les images
//         };

//         img.onerror = () => {
//             loader.remove();
//             console.error(`Erreur de chargement de l'image : ${src}`);
//         };

//         imgDiv.addEventListener("click",()=>{
//             deleteImg(src,imgDiv)
//         })
//     });
// }



// function deleteImg(src,img) {
//     console.log('Je vais supprimer : ' + src);

//     fetch('/delete-img-portfolio', {
//         method: 'DELETE',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ src }), // Envoi du chemin du fichier à supprimer
//     })
//         .then((response) => {
//             if (response.ok) {
//                 img.remove()
//                 let countphoto = document.querySelector('#countPhoto').textContent
//                 document.querySelector('#countPhoto').textContent = countphoto - 1
//                 getContenuPhoto();
//             } else {
//                 console.error('Erreur lors de la suppression de l\'image.');
//             }
//         })
//         .catch((err) => {
//             console.error('Erreur de connexion au serveur :', err);
//         });
// }

// /////////////////////////////////////////////////////////
// /////GESTION DES SUB FOLDERS ///////////////////////////
// ///////////////////////////////////////////////////////


// // CREATE /////////////////////////////////////////////
// // document.querySelector('#new-subfolder-button').addEventListener('click', () => {
// //     const folder = document.querySelector('#titrefolder').textContent;

// //     // Créer une overlay pour contenir le formulaire
// //     const overlay = document.createElement('div');
// //     overlay.style.position = 'fixed';
// //     overlay.style.top = 0;
// //     overlay.style.left = 0;
// //     overlay.style.width = '100%';
// //     overlay.style.height = '100vh';
// //     overlay.style.zIndex = '100000';
// //     overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
// //     overlay.style.display = 'flex';
// //     overlay.style.flexDirection = 'column';
// //     overlay.style.justifyContent = 'center';
// //     overlay.style.alignItems = 'center';

// //     // Créer le formulaire
// //     const form = document.createElement('div');
// //     form.classList.add('form-subfolder-creat');

// //     const h2 = document.createElement('h2');
// //     h2.classList.add('h2-subfolder');
// //     h2.textContent = "Nouveau sous-dossier";

// //     const input = document.createElement('input');
// //     input.classList.add('input-subfolder');
// //     input.placeholder="Nom du sous-dossier"

// //     const contentbutton = document.createElement('div')
// //     contentbutton.style.display = "flex"
// //     contentbutton.style.justifyContent = "center"
// //     contentbutton.style.alignItems = "center"
// //     contentbutton.style.gap = "25px"

// //     const createButton = document.createElement('button');
// //     createButton.classList.add('buttonform');
// //     createButton.textContent = "Créer";

// //     const bg = document.createElement('div');
// //     bg.classList.add('background-button')
// //     bg.appendChild(createButton)

// //     const closeButton = document.createElement('button');
// //     closeButton.classList.add('button-close-subfolder');
// //     closeButton.textContent = "Annuler";

// //     contentbutton.appendChild(bg)
// //     contentbutton.appendChild(closeButton)

// //     // Actions pour les boutons
// //     createButton.addEventListener('click', () => {
// //         const folder = document.querySelector('#titrefolder').textContent; // Assuming there's an input field with id 'folder'
// //         const value = input.value; // Input for the subfolder name
    
// //         if (!value || !folder) {
// //             console.error('Both folder and subfolder names must be provided');
// //             return;
// //         }
    
// //         console.log(`Je vais créer le sous-dossier ${value} dans ${folder}`);
    
// //         fetch('/add-sub-folder', {
// //             method: 'POST',
// //             headers: {
// //                 'Content-Type': 'application/json',
// //             },
// //             body: JSON.stringify({ folder, subFolder: value }),
// //         })
// //         .then(response => response.json())
// //         .then(data => {
// //             if (data.success) {
// //                 console.log(`Sous-dossier ${value} créé avec succès dans ${folder}`);
// //                 document.body.removeChild(overlay)
// //                 getContenuPhoto();
                
// //             } else {
// //                 msg.textContent=data.message;
// //             }
// //         })
// //         .catch(error => console.error('Erreur:', error));
// //     });

// //     closeButton.addEventListener('click', () => {
// //         document.body.removeChild(overlay); // Supprimer l'overlay au clic sur "Annuler"
// //     });

// //     const msg = document.createElement('p')
// //     msg.classList.add('responseform')

// //     // Ajout des éléments au formulaire
// //     form.appendChild(h2);
// //     form.appendChild(input);
// //     form.appendChild(contentbutton);
// //     form.appendChild(msg);
    

// //     // Ajout du formulaire à l'overlay
// //     overlay.appendChild(form);

// //     // Ajout de l'overlay au body
// //     document.body.appendChild(overlay);

// //     // Fermer le formulaire si l'utilisateur clique en dehors
// // //     overlay.addEventListener('click', (e) => {
// // //         if (e.target === overlay) {
// // //             document.body.removeChild(overlay);
// // //         }
// // //     });
// //  });


// ////////////////////////////////////////
// ///FOLDER PRINCIPAL////////////////////
// ////////////////////////////////////////////////////

// // document.querySelector('#new-folder-button').addEventListener('click', () => {
// //     // Créer une overlay pour contenir le formulaire
// //     const overlay = document.createElement('div');
// //     overlay.style.position = 'fixed';
// //     overlay.style.top = 0;
// //     overlay.style.left = 0;
// //     overlay.style.width = '100%';
// //     overlay.style.height = '100vh';
// //     overlay.style.zIndex = '100000';
// //     overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
// //     overlay.style.display = 'flex';
// //     overlay.style.flexDirection = 'column';
// //     overlay.style.justifyContent = 'center';
// //     overlay.style.alignItems = 'center';

// //     // Créer le formulaire
// //     const form = document.createElement('div');
// //     form.classList.add('form-subfolder-creat');

// //     const h2 = document.createElement('h2');
// //     h2.classList.add('h2-subfolder');
// //     h2.textContent = "Nouveau dossier";

// //     const input = document.createElement('input');
// //     input.classList.add('input-subfolder');
// //     input.placeholder="Nom du dossier"

// //     const contentbutton = document.createElement('div')
// //     contentbutton.style.display = "flex"
// //     contentbutton.style.justifyContent = "center"
// //     contentbutton.style.alignItems = "center"
// //     contentbutton.style.gap = "25px"

// //     const createButton = document.createElement('button');
// //     createButton.classList.add('buttonform');
// //     createButton.textContent = "Créer";

// //     const bg = document.createElement('div');
// //     bg.classList.add('background-button')
// //     bg.appendChild(createButton)

// //     const closeButton = document.createElement('button');
// //     closeButton.classList.add('button-close-subfolder');
// //     closeButton.textContent = "Annuler";

// //     contentbutton.appendChild(bg)
// //     contentbutton.appendChild(closeButton)

// //     let folderplus = Object.values(objfolders).length + 1

// //     createButton.addEventListener('click', () => {
// //         const folderName = input.value;

// //         if (!folderName) {
// //             console.error('Nom du dossier principal requis');
// //             return;
// //         }

// //         fetch('/add-folder', {
// //             method: 'POST',
// //             headers: {
// //                 'Content-Type': 'application/json',
// //             },
// //             body: JSON.stringify({ folderName }),
// //         })
// //         .then(response => response.json())
// //         .then(data => {
// //             if (data.success) {
// //                 console.log(`Dossier principal ${folderName} créé avec succès`);
// //                 document.body.removeChild(overlay);
                
// //                 // Rafraîchir les données
// //                 getContenuPhoto().then(() => {
// //                     // Trouver l'index du nouveau dossier
// //                     const folderNames = Object.keys(objfolders).sort();
// //                     const newIndex = folderNames.indexOf(folderName);

// //                     if (newIndex !== -1) {
// //                         count = newIndex + 1; // Ajustez `count` à l'index (1-indexé si nécessaire)
// //                         document.querySelector('#afficherphotos').textContent="";

// //                         creatFolder(count, objfolders)
// //                     }
// //                 });
// //             } else {
// //                 console.error(data.message);
// //             }
// //         })
// //         .catch(error => console.error('Erreur:', error));
// //     });

// //     closeButton.addEventListener('click', () => {
// //         document.body.removeChild(overlay);
// //     });

// //     contentbutton.appendChild(bg);
// //     contentbutton.appendChild(closeButton);

// //     form.appendChild(h2);
// //     form.appendChild(input);
// //     form.appendChild(contentbutton);

// //     overlay.appendChild(form);

// //     document.body.appendChild(overlay);
// // });




// function remove(){
//     document.querySelector('.removefolder').addEventListener('click', () => {


//         const folder = document.querySelector('#titrefolder').textContent.trim().replace(/\s+/g, "_");


    
//         // Création d'une overlay pour la confirmation
//         const overlay = document.createElement('div');
//         overlay.style.position = 'fixed';
//         overlay.style.top = 0;
//         overlay.style.left = 0;
//         overlay.style.width = '100%';
//         overlay.style.height = '100vh';
//         overlay.style.zIndex = '100000';
//         overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
//         overlay.style.display = 'flex';
//         overlay.style.flexDirection = 'column';
//         overlay.style.justifyContent = 'center';
//         overlay.style.alignItems = 'center';
    
//         // Contenu de l'overlay
//         const confirmationBox = document.createElement('div');
//         confirmationBox.classList.add('form-subfolder-creat');
    
//         const message = document.createElement('p');
//         message.classList.add('h2-subfolder')
//         message.textContent = `Êtes-vous sûr de vouloir supprimer le dossier "${folder}" ?`;
    
//         const contentbutton = document.createElement('div')
//         contentbutton.style.display = "flex"
//         contentbutton.style.justifyContent = "center"
//         contentbutton.style.alignItems = "center"
//         contentbutton.style.gap = "25px"
    
    
        
    
//         const createButton = document.createElement('button');
//         createButton.classList.add('buttonform');
//         createButton.textContent = 'Valider';
//         createButton.addEventListener('click', () => {
//             fetch('/remove-folder', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ folderName: folder }),
//             })
//             .then(response => response.json())
//             .then(data => {
//                 if (data.success) {
//                     console.log(`Dossier ${folder} supprimé avec succès.`);
//                     document.body.removeChild(overlay);
//                     count--
//                     getContenuPhoto();
//                 } else {
//                     console.error(data.message);
//                 }
//             })
//             .catch(error => console.error('Erreur:', error));
//         });
    
//         const bg = document.createElement('div');
//         bg.classList.add('background-button')
//         bg.appendChild(createButton)
    
//         contentbutton.appendChild(bg)
    
//         const closeButton = document.createElement('button');
//         closeButton.classList.add('button-close-subfolder');
//         closeButton.textContent = 'Annuler';
//         closeButton.addEventListener('click', () => {
//             document.body.removeChild(overlay);
//         });
    
//         contentbutton.appendChild(closeButton)
    
        
    
//         confirmationBox.appendChild(message);
//         confirmationBox.appendChild(contentbutton);
    
//         overlay.appendChild(confirmationBox);
    
//         document.body.appendChild(overlay);
//     });
// }


// function edit(){
//     document.querySelector('.editfolder').addEventListener('click', () => {
//         b const folder = document.querySelector('#titrefolder').textContent; // Assuming there's an element with id 'titrefolder'
        
    
//         if (!folder) {
//             console.error('Both folder and subfolder names must be provided for editing');
//             return;
//         }
    
//         // Create an overlay for editing the subfolder name
//         const overlay = document.createElement('div');
//         overlay.style.position = 'fixed';
//         overlay.style.top = 0;
//         overlay.style.left = 0;
//         overlay.style.width = '100%';
//         overlay.style.height = '100vh';
//         overlay.style.zIndex = '100000';
//         overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
//         overlay.style.display = 'flex';
//         overlay.style.flexDirection = 'column';
//         overlay.style.justifyContent = 'center';
//         overlay.style.alignItems = 'center';
    
//         const form = document.createElement('div');
//         form.classList.add('form-subfolder-creat');
    
//         const h2 = document.createElement('h2');
//         h2.textContent = `Modifier le nom du dossier : ${folder}`;
//         h2.classList.add('h2-subfolder')
    
//         const input = document.createElement('input');
//         input.placeholder = "Nouveau nom du dossier";
//         input.classList.add('input-subfolder')
    
//         const contentbutton = document.createElement('div');
//         contentbutton.style.display = 'flex';
//         contentbutton.style.justifyContent = 'center';
//         contentbutton.style.alignItems = 'center';
//         contentbutton.style.gap = '25px';
    
//         const saveButton = document.createElement('button');
//         saveButton.classList.add('buttonform')
//         saveButton.textContent = 'Enregistrer';
    
//         const bg = document.createElement('div');
//         bg.classList.add('background-button')
//         bg.appendChild(saveButton)
    
//         const closeButton = document.createElement('button');
//         closeButton.classList.add('button-close-subfolder')
//         closeButton.textContent = 'Annuler';
    
//         saveButton.addEventListener('click', () => {
//             const newFolderName = input.value.trim();
        
//             if (!newFolderName) {
//                 console.error('Nouveau nom du dossier requis');
//                 return;
//             }
        
//             fetch('/edit-folder', {
//                 method: 'PUT',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     oldFolderName: folder,
//                     newFolderName: newFolderName,
//                 }),
//             })
//                 .then(response => response.json())
//                 .then(data => {
//                     if (data.success) {
//                         console.log(data.message);
//                         document.body.removeChild(overlay);
//                         getContenuPhoto(); // Met à jour la liste des dossiers après renommage
//                     } else {
//                         console.error(data.message);
//                     }
//                 })
//                 .catch(error => console.error('Erreur:', error));
//         });
        
    
//         closeButton.addEventListener('click', () => {
//             document.body.removeChild(overlay);
//         });
    
//         contentbutton.appendChild(bg);
//         contentbutton.appendChild(closeButton);
    
//         form.appendChild(h2);
//         form.appendChild(input);
//         form.appendChild(contentbutton);
    
//         overlay.appendChild(form);
    
//         document.body.appendChild(overlay);
//     });
// }


// // document.querySelector('#downloadphotoportfolio').addEventListener('change', (event) => { 
// //     console.log('je fonctionne');
// //     const dossier = document.querySelector('#titrefolder').textContent; // Dossier principal
// //     const sub = subChoisi || ''; // Dossier secondaire (chaîne vide si subChoisi est vide)

// //     const formData = new FormData();
// //     formData.append('dossier', dossier);  // Ajouter le dossier principal
// //     formData.append('sub', sub);          // Ajouter le sous-dossier (ou chaîne vide)

// //     Array.from(event.target.files).forEach(file => {
// //         formData.append('photos', file); // Ajouter chaque photo au FormData
// //     });

// //     console.log('jenvoie '+ formData);

// //     fetch('/creat-image-portfolio', {
// //         method: 'POST',
// //         body: formData,
// //     })
// //     .then(response => response.json())
// //     .then(data => {
// //         getContenuPhoto();
// //     })
// //     .catch(error => {
// //         console.error('Erreur lors du téléchargement des images:', error);
// //     });
// // });

