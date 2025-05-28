// if (typeof newobserver === "undefined") {
//     // Créer un observer qui détecte les changements dans le DOM
// const newobserver = new MutationObserver((mutationsList, observer) => {
//     for (const mutation of mutationsList) {
//         if (mutation.type === 'childList') {
//             // Vérifier si #navback a été ajouté au DOM
//             const nav = document.getElementById('return');
//             if (nav) {
//                 nav.remove(); // Supprimer l'élément dès qu'il est détecté

//                 // Réinjecter #navback dans body
//                 document.body.appendChild(nav); // Ajouter navback dans body
                
//                 observer.disconnect(); // Arrêter l'observation après suppression et réinjection
//             }
//         }
//     }
// });

// // Observer les changements dans le DOM
// const newconfig = { childList: true, subtree: true };
// newobserver.observe(document.body, newconfig);

// }




// document.querySelector('#return').addEventListener('click',()=>{
//     document.querySelector('#contenuPhotoVideo').classList.toggle('dnone', true);
//     document.querySelector('#contenuPhotoVideo').classList.toggle('dflex', false);
//     document.querySelector('#parentportfolio').classList.toggle('dflex', true);
//     document.querySelector('#parentportfolio').classList.toggle('dnone', false);
    
//     document.querySelector('#jsportfoliopv').remove()
//     document.querySelector('#return').remove()
//     document.querySelector('#add-camera').remove()
//     setTimeout(() => {
//         const script = document.createElement('script')
//         script.id="jsportfoliopv"
//         document.body.appendChild(script)
        
        
//     }, 500);
// })




// function loadVideos() {
//     fetch('/get-videos')
//         .then(response => response.json())
//         .then(videos => {
//             const container = document.querySelector('#videoscontent');
//             container.textContent = ''; // Vide le contenu de manière sécurisée

//             videos.forEach(video => {
//                 const { titre, description, url } = video;
//                 const videoId = extractVideoId(url);
//                 if (!videoId) return; // Ignore si l'ID est invalide

//                 // Créer la div qui contiendra la miniature, le titre et la description
//                 const videoDiv = document.createElement('div');
//                 videoDiv.classList.add('video-thumbnail');

//                 const contentbutton = document.createElement('div')
//                 contentbutton.classList.add('contentbutton')

//                 const backedit  = document.createElement('div')
//                 backedit.classList.add('background')

//                 const svgedit = document.createElement('img')
//                 svgedit.src = "icon/edit.svg"

//                 const backsupp = document.createElement('div')
//                 backsupp.classList.add('background')

//                 const svgsupp = document.createElement('img')
//                 svgsupp.src = "icon/remove.svg"

//                 svgsupp.addEventListener('click', () => {
//                     // Création de l'overlay
//                     const overlay = document.createElement('div');
//                     overlay.style.position = 'fixed';
//                     overlay.style.top = 0;
//                     overlay.style.left = 0;
//                     overlay.style.width = '100%';
//                     overlay.style.height = '100vh';
//                     overlay.style.zIndex = '100000';
//                     overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
//                     overlay.style.display = 'flex';
//                     overlay.style.flexDirection = 'column';
//                     overlay.style.justifyContent = 'center';
//                     overlay.style.alignItems = 'center';
                
//                     // Contenu de l'overlay
//                     const confirmationBox = document.createElement('div');
//                     confirmationBox.classList.add('form-subfolder-creat');
                
//                     const message = document.createElement('p');
//                     message.classList.add('h2-subfolder');
//                     message.textContent = `Êtes-vous sûr de vouloir supprimer la vidéo "${titre}" ?`;
                
//                     const contentbutton = document.createElement('div');
//                     contentbutton.style.display = "flex";
//                     contentbutton.style.justifyContent = "center";
//                     contentbutton.style.alignItems = "center";
//                     contentbutton.style.gap = "25px";
                
//                     // Bouton de confirmation
//                     const confirmButton = document.createElement('button');
//                     confirmButton.classList.add('buttonform');
//                     confirmButton.textContent = 'Valider';
//                     confirmButton.addEventListener('click', async () => {
//                         const response = await fetch('/remove-video', {
//                             method: 'DELETE',
//                             headers: {
//                                 'Content-Type': 'application/json',
//                             },
//                             body: JSON.stringify({ url }) // Suppression via l'URL
//                         });
                
//                         const result = await response.json();
                
//                         if (response.ok) {
//                             document.body.removeChild(overlay);
//                             loadVideos(); // Recharge les vidéos après suppression
//                         } else {
//                             alert(result.error);
//                         }
//                     });
                
//                     const bg = document.createElement('div');
//                     bg.classList.add('background-button');
//                     bg.appendChild(confirmButton);
                
//                     contentbutton.appendChild(bg);
                
//                     // Bouton d'annulation
//                     const closeButton = document.createElement('button');
//                     closeButton.classList.add('button-close-subfolder');
//                     closeButton.textContent = 'Annuler';
//                     closeButton.addEventListener('click', () => {
//                         document.body.removeChild(overlay);
//                     });
                
//                     contentbutton.appendChild(closeButton);
                
//                     confirmationBox.appendChild(message);
//                     confirmationBox.appendChild(contentbutton);
//                     overlay.appendChild(confirmationBox);
//                     document.body.appendChild(overlay);
//                 });
                

//                 svgedit.addEventListener('click',()=>{
//                     const overlay = document.createElement('div');
//                     overlay.style.position = 'fixed';
//                     overlay.style.top = 0;
//                     overlay.style.left = 0;
//                     overlay.style.width = '100%';
//                     overlay.style.height = '100vh';
//                     overlay.style.zIndex = '100000';
//                     overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
//                     overlay.style.display = 'flex';
//                     overlay.style.flexDirection = 'column';
//                     overlay.style.justifyContent = 'center';
//                     overlay.style.alignItems = 'center';
                
//                     const form = document.createElement('div');
//                     form.classList.add('form-subfolder-creat');

//                     const h2 = document.createElement('h2')
//                     h2.classList.add('h2-subfolder')
//                     h2.textContent = `Modification de : ${titre}`

//                     const contentUrl = document.createElement('div')
//                     contentUrl.style.width = '100%'
//                     contentUrl.style.display = "flex"
//                     contentUrl.style.justifyContent = "center"
//                     contentUrl.style.flexDirection = "column"
//                     contentUrl.style.alignItems = "center"
//                     contentUrl.style.gap = "25px"
//                     const contenTitre = document.createElement('div')
//                     contenTitre.style.width = '100%'
//                     contenTitre.style.display = "flex"
//                     contenTitre.style.justifyContent = "center"
//                     contenTitre.style.flexDirection = "column"
//                     contenTitre.style.alignItems = "center"
//                     contenTitre.style.gap = "25px"
//                     const contentDescription = document.createElement('div')
//                     contentDescription.style.width = '100%'
//                     contentDescription.style.display = "flex"
//                     contentDescription.style.justifyContent = "center"
//                     contentDescription.style.flexDirection = "column"
//                     contentDescription.style.alignItems = "center"
//                     contentDescription.style.gap = "25px"
                    

//                     const inputurl = document.createElement('input')
//                     inputurl.classList.add('input-subfolder')
//                     inputurl.value = url;
//                     const inputTitre = document.createElement('input')
//                     inputTitre.classList.add('input-subfolder')
//                     inputTitre.value= titre
//                     const inputDescription = document.createElement('textarea')
//                     inputDescription.classList.add('input-subfolder')
//                     inputDescription.value = description

//                     const titreUrl = document.createElement('h3')
//                     titreUrl.classList.add('h2-subfolder')
//                     titreUrl.textContent = 'Lien de votre vidéo'
//                     const titreTitre = document.createElement('h3')
//                     titreTitre.classList.add('h2-subfolder')
//                     titreTitre.textContent = 'Titre'
//                     const titreDescription = document.createElement('h3')
//                     titreDescription.classList.add('h2-subfolder')
//                     titreDescription.textContent = 'Déscription'

//                     contentUrl.appendChild(titreUrl)
//                     contentUrl.appendChild(inputurl)
//                     contenTitre.appendChild(titreTitre)
//                     contenTitre.appendChild(inputTitre)
//                     contentDescription.appendChild(titreDescription)
//                     contentDescription.appendChild(inputDescription)



//                     const contentbutton = document.createElement('div');
//                     contentbutton.style.display = 'flex';
//                     contentbutton.style.justifyContent = 'center';
//                     contentbutton.style.alignItems = 'center';
//                     contentbutton.style.gap = '25px';
                
//                     const saveButton = document.createElement('button');
//                     saveButton.classList.add('buttonform')
//                     saveButton.textContent = 'Enregistrer';
//                     saveButton.addEventListener('click', async () => {
//                         const updatedUrl = inputurl.value.trim();
//                         const updatedTitre = inputTitre.value.trim();
//                         const updatedDescription = inputDescription.value.trim();
                
//                         if (!updatedUrl || !updatedTitre || !updatedDescription) {
//                             alert('Veuillez remplir tous les champs.');
//                             return;
//                         }
                
//                         const response = await fetch('/edit-video', {
//                             method: 'PUT',
//                             headers: { 'Content-Type': 'application/json' },
//                             body: JSON.stringify({ oldUrl: video.url, url: updatedUrl, titre: updatedTitre, description: updatedDescription })
//                         });
                
//                         const result = await response.json();
                
//                         if (response.ok) {
//                             document.body.removeChild(overlay);
//                             loadVideos(); // Recharge les vidéos pour afficher la modification
//                         } else {
//                             alert(result.error);
//                         }
//                     });

//                     const bg = document.createElement('div');
//                     bg.classList.add('background-button')
//                     bg.appendChild(saveButton)
                
//                     const closeButton = document.createElement('button');
//                     closeButton.classList.add('button-close-subfolder')
//                     closeButton.textContent = 'Annuler';

//                     closeButton.addEventListener('click', () => {
//                         document.body.removeChild(overlay);
//                     });

//                     contentbutton.appendChild(bg);
//                     contentbutton.appendChild(closeButton);
                
                    
//                     form.appendChild(h2);
//                     form.appendChild(contentUrl);
//                     form.appendChild(contenTitre);
//                     form.appendChild(contentDescription);
//                     form.appendChild(contentbutton);
                
//                     overlay.appendChild(form);
                
//                     document.body.appendChild(overlay);
//                 })
                
//                 backedit.appendChild(svgedit)
//                 backsupp.appendChild(svgsupp)

//                 contentbutton.appendChild(backsupp)
//                 contentbutton.appendChild(backedit)
                

//                 // Créer le titre
//                 const titleEl = document.createElement('h3');
//                 titleEl.classList.add('titrevideo')
//                 titleEl.textContent = titre;

//                 // Créer la description
//                 const descEl = document.createElement('p');
//                 descEl.classList.add('descriptionvideo')
//                 descEl.textContent = description;


//                 const div = document.createElement('div')
//                 div.classList.add('contentImgVideo')

//                 // Créer l'image de la miniature
//                 const img = document.createElement('img');
//                 img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
//                 img.alt = `Aperçu de ${titre}`;

//                 // Créer le bouton de lecture
//                 const button = document.createElement('img');
//                 button.classList.add('play-btn');
//                 button.src = 'icon/youtube-color2.svg'
//                 const conteneur  =  
//                 button.addEventListener('click', () => playVideo(videoId,div));


//                 div.appendChild(img)
//                 div.appendChild(button)
//                 div.appendChild(contentbutton)
//                 // Ajouter les éléments à la div vidéo
                
                
//                 videoDiv.appendChild(div);
//                 videoDiv.appendChild(titleEl);
//                 videoDiv.appendChild(descEl);

//                 // Ajouter la div au conteneur
//                 container.appendChild(videoDiv);
//             });
//         })
//         .catch(error => console.error('Erreur lors du chargement des vidéos:', error));
// }

// function extractVideoId(url) {
//     const match = url.match(/(?:youtube\.com\/(?:.*[?&]v=|embed\/)|youtu\.be\/)([^?&]+)/);
//     return match ? match[1] : null;
// }

// function playVideo(videoId, container) {
//     // Créer un élément iframe sécurisé
//     const videoFrame = document.createElement('iframe');
//     videoFrame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
//     videoFrame.width = "100%";
//     videoFrame.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
//     videoFrame.allowFullscreen = true;

//     // Nettoyer la div et y insérer la vidéo
//     container.textContent = ''; 
//     container.appendChild(videoFrame);
// }


// loadVideos()


// document.querySelector('#add-camera').addEventListener('click',()=>{
//     const overlay = document.createElement('div');
//                     overlay.style.position = 'fixed';
//                     overlay.style.top = 0;
//                     overlay.style.left = 0;
//                     overlay.style.width = '100%';
//                     overlay.style.height = '100vh';
//                     overlay.style.zIndex = '100000';
//                     overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
//                     overlay.style.display = 'flex';
//                     overlay.style.flexDirection = 'column';
//                     overlay.style.justifyContent = 'center';
//                     overlay.style.alignItems = 'center';
                
//                     const form = document.createElement('div');
//                     form.classList.add('form-subfolder-creat');

//                     const h2 = document.createElement('h2')
//                     h2.classList.add('h2-subfolder')
//                     h2.textContent = `Ajouter une vidéo`

//                     const contentUrl = document.createElement('div')
//                     contentUrl.style.width = '100%'
//                     contentUrl.style.display = "flex"
//                     contentUrl.style.justifyContent = "center"
//                     contentUrl.style.flexDirection = "column"
//                     contentUrl.style.alignItems = "center"
//                     contentUrl.style.gap = "25px"
//                     const contenTitre = document.createElement('div')
//                     contenTitre.style.width = '100%'
//                     contenTitre.style.display = "flex"
//                     contenTitre.style.justifyContent = "center"
//                     contenTitre.style.flexDirection = "column"
//                     contenTitre.style.alignItems = "center"
//                     contenTitre.style.gap = "25px"
//                     const contentDescription = document.createElement('div')
//                     contentDescription.style.width = '100%'
//                     contentDescription.style.display = "flex"
//                     contentDescription.style.justifyContent = "center"
//                     contentDescription.style.flexDirection = "column"
//                     contentDescription.style.alignItems = "center"
//                     contentDescription.style.gap = "25px"
                    

//                     const inputurl = document.createElement('input')
//                     inputurl.classList.add('input-subfolder')
                    
//                     const inputTitre = document.createElement('input')
//                     inputTitre.classList.add('input-subfolder')
                    
//                     const inputDescription = document.createElement('textarea')
//                     inputDescription.classList.add('input-subfolder')
                    

//                     const titreUrl = document.createElement('h3')
//                     titreUrl.classList.add('h3-subfolder')
//                     titreUrl.textContent = 'Lien de votre vidéo'
//                     const titreTitre = document.createElement('h3')
//                     titreTitre.classList.add('h3-subfolder')
//                     titreTitre.textContent = 'Titre'
//                     const titreDescription = document.createElement('h3')
//                     titreDescription.classList.add('h3-subfolder')
//                     titreDescription.textContent = 'Déscription'

//                     contentUrl.appendChild(titreUrl)
//                     contentUrl.appendChild(inputurl)
//                     contenTitre.appendChild(titreTitre)
//                     contenTitre.appendChild(inputTitre)
//                     contentDescription.appendChild(titreDescription)
//                     contentDescription.appendChild(inputDescription)



//                     const contentbutton = document.createElement('div');
//                     contentbutton.style.display = 'flex';
//                     contentbutton.style.justifyContent = 'center';
//                     contentbutton.style.alignItems = 'center';
//                     contentbutton.style.gap = '25px';
                
//                     const saveButton = document.createElement('button');
//                     saveButton.classList.add('buttonform')
//                     saveButton.textContent = 'Enregistrer';

//                     saveButton.addEventListener('click', async () => {
//                         const url = inputurl.value.trim();
//                         const titre = inputTitre.value.trim();
//                         const description = inputDescription.value.trim();
                    
//                         if (!url || !titre || !description) {
//                             alert('Veuillez remplir tous les champs.');
//                             return;
//                         }
                    
//                         const response = await fetch('/add-video', {
//                             method: 'POST',
//                             headers: { 'Content-Type': 'application/json' },
//                             body: JSON.stringify({ url, titre, description })
//                         });
                    
//                         const result = await response.json();
                    
//                         if (response.ok) {
                            
//                             document.body.removeChild(overlay);
//                             loadVideos(); // Recharge les vidéos pour afficher la nouvelle
//                         } else {
//                             alert(result.error);
//                         }
//                     });
                    

//                     const bg = document.createElement('div');
//                     bg.classList.add('background-button')
//                     bg.appendChild(saveButton)
                
//                     const closeButton = document.createElement('button');
//                     closeButton.classList.add('button-close-subfolder')
//                     closeButton.textContent = 'Annuler';

//                     closeButton.addEventListener('click', () => {
//                         document.body.removeChild(overlay);
//                     });

//                     contentbutton.appendChild(bg);
//                     contentbutton.appendChild(closeButton);
                
                    
//                     form.appendChild(h2);
//                     form.appendChild(contentUrl);
//                     form.appendChild(contenTitre);
//                     form.appendChild(contentDescription);
//                     form.appendChild(contentbutton);
                
//                     overlay.appendChild(form);
                
//                     document.body.appendChild(overlay);
// })