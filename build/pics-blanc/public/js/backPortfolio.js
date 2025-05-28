(()=>{
    let ttabretour = [];
window.datacache = window.datacache || '';
window.datacache2 = window.datacache2 || '';


async function updateStorageUsage() {
    try {
      const res = await fetch('/storage-usage', {
        credentials: 'include'
      });
  
      const data = await res.json();
      const usedGo = (data.used / (1024 ** 3)); // En Go brut
      const limitGo = (data.limit / (1024 ** 3)); // En Go brut
  
      const used = usedGo.toFixed(2); // Affiche 2 chiffres après la virgule
      const limit = limitGo.toFixed(limitGo >= 100 ? 0 : 1); // Affine selon la taille
      const percent = ((usedGo / limitGo) * 100).toFixed(1); // Calcul plus précis
  
      const fill = document.getElementById('storageFill');
      const text = document.getElementById('storageText');
  
      fill.style.width = `${percent}%`;
      fill.style.background = percent >= 90 ? 'linear-gradient(90deg, red, darkred)' : 'linear-gradient(90deg, #ff0066, #0007b9)';
      text.textContent = `Utilisation : ${used} Go / ${limit} Go (${percent}%)`;
  
      // Désactive le bouton upload si limite atteinte
      if (usedGo >= limitGo) {
        document.querySelector('#uploadButton')?.setAttribute('disabled', true);
        alert("Vous avez atteint la limite de stockage.");
      }
  
    } catch (err) {
      console.error('Erreur récupération stockage', err);
      document.getElementById('storageText').textContent = "Impossible de récupérer l'utilisation du stockage.";
    }
  }
  

function fName(folderName) {
    return folderName.replace(/_/g, ' ');
}

function retour() {
    const photos = document.querySelector('#photos')
    const videos = document.querySelector('#videos')

    if(document.querySelector('.overlayBackImg')){
        document.querySelector('.overlayBackImg').remove()
        const tab = document.querySelectorAll('.overlayBackImg')

        tab.forEach(tb =>{
            tb.remove()
        })
    }
    
    
    if(document.querySelector('.corbeil')){
        selectedImages =[]
        isSelecting = false
        isDeleteMode = false
        // document.querySelectorAll('.subcategoryclient-b').forEach(div=>{
        //     div.style.transform = "";
        //     div.style.boxShadow = "";
        // })
        content.remove()
        annuler.remove()
        all.remove()
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


function choisiPhoto() {
    const contenu = document.querySelector('#contenu')
    const cardChoice = document.querySelector('#photoOrVideo')
    cardChoice.style.display = "none"
    const photos = document.querySelector('#photos')
    photos.style.display = "flex"
    
    
    


    getContenuPhoto(); // Appel de la fonction pour charger les photos
    // ICI RAJOUT GESTION
    
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
        const response = await fetch('/getcontenuphoto',{
            credentials: 'include',
        });
        if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données');
    }
      const data = await response.json(); // Données reçues depuis le serveur
        window.datacache = data.folder
        window.datacache2 = data.desc
        creatFolderClient(data.folder,data.desc)


        

        
        
        
    } catch (error) {
        console.error('Erreur :', error);
    }
}


function creatFolderClient(datafolder,datadesc){


    const data = datafolder

    const content = document.querySelector('#photos')
    content.textContent='';

    const contentToggleSwicth = document.createElement('div')
    contentToggleSwicth.classList.add('contentToggleSwicth')

    const p = document.createElement('p')
    p.classList.add('prstDesc')
    p.style.color = "#fff"
    p.textContent = 'Votre contenu contiendra t\'il du contenu réservé aux personnes majeurs ?'

    const pinfo = document.createElement('p')
    pinfo.classList.add('checkboxinfo')
    pinfo.textContent = "En activant ce champ, vous certifiez que le contenu de votre galerie peut contenir, ou non, des images réservées à un public majeur. Toute fausse déclaration engage votre responsabilité et pourra entraîner des sanctions, notamment en cas de diffusion de contenus réservés aux adultes sans avertissement préalable.";


    const checkbox = document.createElement('input');
    checkbox.classList.add('checkbox')
    checkbox.type = 'checkbox';
    checkbox.id = 'switch';

    const label = document.createElement('label');
    label.classList.add('checkboxlabel')
    label.htmlFor = 'switch';
    label.textContent = 'Toggle';

    contentToggleSwicth.appendChild(p);
    contentToggleSwicth.appendChild(checkbox);
    contentToggleSwicth.appendChild(label);
    contentToggleSwicth.appendChild(pinfo);

    content.appendChild(contentToggleSwicth);


    let debounceTimeout;

checkbox.addEventListener('change', () => {
  const locked = checkbox.checked;
  label.classList.toggle('background-button')
  clearTimeout(debounceTimeout); // Réinitialise le timer à chaque clic

  debounceTimeout = setTimeout(() => {
    fetch('/update-locked', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ locked })
    })
    .then(res => res.json())
    .then(data => {
      console.log(data.message);
    })
    .catch(err => {
      console.error('Erreur lors de la mise à jour du fichier JSON :', err);
    });
  }, 1000); // 1 seconde de délai après le dernier changement
});

if(window.datacache2.locked){
    checkbox.checked = true;
    label.classList.add('background-button')

}



    const createStorageBar = () => {
        const photos = document.getElementById("photos");
      
        const container = document.createElement("div");
        container.className = "storage-container";
      
        const bar = document.createElement("div");
        bar.className = "storage-bar";
      
        const fill = document.createElement("div");
        fill.id = "storageFill";
        fill.className = "storage-fill";
        fill.classList.add('backgroud-button')
        fill.style.width = "0%"; // Valeur à mettre à jour dynamiquement
      
        const text = document.createElement("div");
        text.id = "storageText";
        text.className = "storage-text";
        text.textContent = ""; // À remplir dynamiquement aussi
      
        bar.appendChild(fill);
        container.appendChild(bar);
        container.appendChild(text);
        photos.appendChild(container);
      };
      
      createStorageBar();
      updateStorageUsage();

    const newfolderbutton = document.createElement('div')
    newfolderbutton.id = "new-folder-button"
    newfolderbutton.classList.add('button-add')
    const g = document.createElement('div')
    g.classList.add('background')
    const img = document.createElement('img')
    img.src = "icon/folder-add-white.svg"
    img.alt = "bouton pour ajouter une photo"
    g.appendChild(img)
    newfolderbutton.appendChild(g)
    content.appendChild(newfolderbutton)
    document.querySelector('#new-folder-button').addEventListener('click', () => {
    // Créer une overlay pour contenir le formulaire
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100%';
    overlay.style.height = '100vh';
    overlay.style.zIndex = '100000';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';

    // Créer le formulaire
    const form = document.createElement('div');
    form.classList.add('form-subfolder-creat');

    const h2 = document.createElement('h2');
    h2.classList.add('h2-subfolder');
    h2.textContent = "Nouveau dossier";

    const input = document.createElement('input');
    input.classList.add('input-subfolder');
    input.placeholder="Nom du dossier"

    const contentbutton = document.createElement('div')
    contentbutton.style.display = "flex"
    contentbutton.style.justifyContent = "center"
    contentbutton.style.alignItems = "center"
    contentbutton.style.gap = "25px"

    const createButton = document.createElement('button');
    createButton.classList.add('buttonform');
    createButton.textContent = "Créer";

    const bg = document.createElement('div');
    bg.classList.add('background-button')
    bg.appendChild(createButton)

    const closeButton = document.createElement('button');
    closeButton.classList.add('button-close-subfolder');
    closeButton.textContent = "Annuler";

    contentbutton.appendChild(bg)
    contentbutton.appendChild(closeButton)

    

    createButton.addEventListener('click', () => {
        const folderName = input.value.trim();

        load()

        if (!folderName) {
            alert('Nom du dossier principal requis');
            return;
        }

        fetch('/add-folder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ folderName }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log(`Dossier principal ${folderName} créé avec succès`);
                document.body.removeChild(overlay);
                finload()
                // Rafraîchir les données
                getContenuPhoto().then(() => {
                    let lid = `f-${folderName}`
                    document.getElementById(lid).click()
                })
                

                
                
            } else {
                finload()
                console.error(data.message);
            }
        })
        .catch(error => finload());
    });

    closeButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });

    contentbutton.appendChild(bg);
    contentbutton.appendChild(closeButton);

    form.appendChild(h2);
    form.appendChild(input);
    form.appendChild(contentbutton);

    overlay.appendChild(form);

    document.body.appendChild(overlay);
});
   
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
        const ul = document.createElement('ul')
        for (const [categorie, contenu] of Object.entries(data)) {
        
            
            const cardPhotos = document.createElement('div')
            cardPhotos.classList.add('cardPhotos','visible-card')
            cardPhotos.id = `f-${categorie}`
            const contenttitre = document.createElement('div')
            const titre = document.createElement('h2')

            const deleteCard = document.createElement('div')
            deleteCard.classList.add('deleteCardPortfolio');
            deleteCard.textContent = "Supprimer"
            deleteCard.style.zIndex = "20"
            cardPhotos.appendChild(deleteCard)

            deleteCard.addEventListener('click', async (e) => {
                e.stopPropagation()
                load()
                const name = categorie; // Nom de la catégorie / dossier
            
                try {
                    const response = await fetch('/delete-dossierphoto-folder', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ name }),
                });
              
                    const data = await response.json();
              
                if (response.ok) {
                    finload()
                    getContenuPhoto()
                    // Tu peux mettre ici une logique pour mettre à jour l'affichage
                } else {
                    finload()
                    console.error('Erreur :', data.error);
                }
                } catch (error) {
                    finload()
                    console.error('Erreur lors de la suppression du dossier :', error);
                }
              });
              

            cardPhotos.appendChild(deleteCard)
            
            titre.textContent= fName(categorie)
            contenttitre.appendChild(titre)
            cardPhotos.appendChild(contenttitre)

            
    
            cardPhotos.addEventListener('click',()=>{
                afficherPhotosAll([categorie, contenu],datadesc);
            })
            
            const div = document.createElement('div')
                div.classList.add('contentsubclient-card')
                cardPhotos.appendChild(div)
            // Vérifier si c'est une catégorie avec un tableau `images` directement
            if (Array.isArray(contenu.images)) {
                contenttitre.classList.add('folderClientWithImgage-card');
                titre.classList.add('titregrandecatimage-card');

                const img = document.createElement('img');
                img.src = contenu.images[0];
                img.alt = 'Image de fond';
                img.classList.add('background-img-fixed');
                cardPhotos.appendChild(img);
            }else{
                contenttitre.classList.add('folderClientWithImgage-card')
                titre.classList.add('titregrandecatimage-card')
                
            }
            
            // Vérifier si c'est une catégorie avec des sous-catégories
            if (typeof contenu === "object" && Object.keys(contenu).length > 0) {
    
                const tabcount = []
                for (const [sousCategorie, details] of Object.entries(contenu)) {
                    
                    tabcount.push(sousCategorie)
                    const subdiv = document.createElement('div')
                    subdiv.classList.add('subcategoryclient')
                    
                    
                
                    subdiv.addEventListener('click',(event)=>{
                        event.stopPropagation();
                        afficherPhotosAll([categorie, contenu], datadesc);
                    })
        
                    if (Array.isArray(details.images)) {
                        const l = document.createElement('div')
                        l.style.backgroundImage = `url(${details.images[0]})`;
                        subdiv.appendChild(l);

                        const count = document.createElement('span')
                        count.classList.add('countImgAlbum')
                        count.style.position ="absolute"
                        count.textContent= details.images.length

                        subdiv.appendChild(count);

                        div.appendChild(subdiv);
                    }else{
                        if (sousCategorie != "images") {
                            div.appendChild(subdiv)
                        }
                        
                    }
                }
                
    
            }
    
            ul.appendChild(cardPhotos)
            content.appendChild(ul)
    
    
    
        }
    }


    
    
    
}

function afficherPhotosAll(tabComplet, desc){

    const descriptions = desc.desc; // l'objet à l'intérieur de "desc"
    const clef = tabComplet[0];     // par exemple "Hiver"
    const valeur = descriptions[clef]; 

       // On retire l'événement précédent si nécessaire
       document.querySelector('#returnC').style.display = "flex"
       const returnCButton = document.querySelector('#returnC');
       
       returnCButton.removeEventListener('click', retour); // Ici, on retire l'événement précédent si il existe
       returnCButton.addEventListener('click', retour); // On ajoute le nouvel événement
    
    ttabretour.push(1)
    const contenu = document.querySelector('#photos')
    contenu.style.alignItems = "center"

    contenu.textContent=""
    const h2 = document.createElement('h2')
    h2.classList.add('h2seclectall')

    const container = document.createElement('div')
    h2.textContent= fName(tabComplet[0])


    const contentsubfolder = document.createElement('div')
    contentsubfolder.classList.add('selectAll')

    const discribe = document.createElement('h2')
    if(valeur){
        discribe.textContent = `${valeur}`
    }
    discribe.classList.add('descriptionPortfolio')
    
    const overlayBackImg = document.createElement('div')
    overlayBackImg.classList.add('overlayBackImg')
    document.querySelector('#contenu').appendChild(overlayBackImg)

    const divFolder = document.createElement('div')
        divFolder.classList.add('folderClientWithImgage')
        divFolder.appendChild(h2)
        const contentedit = document.createElement('div')
        contentedit.classList.add('contentedit')

        const editnom = document.createElement('button')
        
        editnom.id = 'editnom'
        editnom.textContent="Modifier Titre"
        const editimg = document.createElement('button')
        editimg.id = 'editimg'
        
        editimg.textContent="Modifier l'image"

        editnom.addEventListener('click',()=>{
            const folder = fName(tabComplet[0]); // Assuming there's an element with id 'titrefolder'
        
    
                    if (!folder) {
                        console.error('Both folder and subfolder names must be provided for editing');
                        return;
                    }
                
                    // Create an overlay for editing the subfolder name
                    const overlay = document.createElement('div');
                    overlay.style.position = 'fixed';
                    overlay.style.top = 0;
                    overlay.style.left = 0;
                    overlay.style.width = '100%';
                    overlay.style.height = '100vh';
                    overlay.style.zIndex = '100000';
                    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                    overlay.style.display = 'flex';
                    overlay.style.flexDirection = 'column';
                    overlay.style.justifyContent = 'center';
                    overlay.style.alignItems = 'center';
                
                    const form = document.createElement('div');
                    form.classList.add('form-subfolder-creat');
                
                    const h2 = document.createElement('h2');
                    h2.textContent = `Modifier le nom du dossier : ${folder}`;
                    h2.classList.add('h2-subfolder')
                
                    const input = document.createElement('input');
                    input.placeholder = "Nouveau nom du dossier";
                    input.classList.add('input-subfolder')
                
                    const contentbutton = document.createElement('div');
                    contentbutton.style.display = 'flex';
                    contentbutton.style.justifyContent = 'center';
                    contentbutton.style.alignItems = 'center';
                    contentbutton.style.gap = '25px';
                
                    const saveButton = document.createElement('button');
                    saveButton.classList.add('buttonform')
                    saveButton.textContent = 'Enregistrer';
                
                    const bg = document.createElement('div');
                    bg.classList.add('background-button')
                    bg.appendChild(saveButton)
                
                    const closeButton = document.createElement('button');
                    closeButton.classList.add('button-close-subfolder')
                    closeButton.textContent = 'Annuler';
                
                    saveButton.addEventListener('click', () => {
                        const newFolderName = input.value.trim();
                        load()
                        if (!newFolderName) {
                            finload()
                            console.error('Nouveau nom du dossier requis');
                            return;
                        }
                    
                        fetch('/edit-folder', {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            credentials: 'include',
                            body: JSON.stringify({
                                oldFolderName: folder,
                                newFolderName: newFolderName,
                            }),
                        })
                            .then(response => response.json())
                            .then(data => {
                                if (data.success) {
                                    finload()
                                    document.body.removeChild(overlay);
                                    getContenuPhoto(); // Met à jour la liste des dossiers après renommage
                                } else {
                                    finload()
                                    console.error(data.message);
                                }
                            })
                            .catch(error => finload());
                    });
                    
                
                    closeButton.addEventListener('click', () => {
                        document.body.removeChild(overlay);
                    });
                
                    contentbutton.appendChild(bg);
                    contentbutton.appendChild(closeButton);
                
                    form.appendChild(h2);
                    form.appendChild(input);
                    form.appendChild(contentbutton);
                
                    overlay.appendChild(form);
                
                    document.body.appendChild(overlay);
        })


        const bk1 = document.createElement('div')
        const bk2 = document.createElement('div')
        bk1.classList.add('background-button')
        bk2.classList.add('background-button')
        bk1.appendChild(editnom)
        bk2.appendChild(editimg)
        contentedit.appendChild(bk1)
        contentedit.appendChild(bk2)
        divFolder.appendChild(contentedit)

        contentsubfolder.appendChild(divFolder)

        const inputFile = document.createElement('input');
        bk2.appendChild(inputFile)
        inputFile.type = 'file';
        inputFile.accept = 'image/*';
        inputFile.style.position = 'absolute';
        inputFile.style.width = '100%';
        inputFile.style.height = '100%';
        inputFile.style.top = '0';
        inputFile.style.left = '0';
        inputFile.style.opacity = '0';
        inputFile.style.zIndex = '9999';
        inputFile.style.cursor = 'pointer';

    // Ajouter un event listener pour détecter le changement de fichier
        inputFile.addEventListener('change', async (event) => {

            load()
            const file = event.target.files[0];
            
            const dossier = fName(tabComplet[0]); // Dossier principal
            const sub = ''// Dossier secondaire (chaîne vide si subChoisi est vide)

            const formData = new FormData();
            formData.append('dossier', dossier);  // Ajouter le dossier principal
            formData.append('sub', sub);          // Ajouter le sous-dossier (ou chaîne vide)

            
            formData.append('photos', file); // Ajouter chaque photo au FormData
            

            

            fetch('/creat-image-portfolio', {
                method: 'POST',
                credentials: 'include',
                body: formData,
            })
            .then(response => response.json())
            .then(data => {
                finload()
                getContenuPhoto().then(async () => {
                    const cl = `#f-${data.folder}`;
                    const sub = `#${data.subFolder}`;
                
                    document.querySelector(cl).click();
                
                    
                });
                
            })
            .catch(error => {
                finload()
                console.error('Erreur lors du téléchargement des images:', error);
            });
        });

    if(tabComplet[1].images){

        if(document.querySelector('.no-photo')){
            document.querySelector('.no-photo').remove()
        }
        divFolder.style.backgroundImage=`url(${tabComplet[1].images[0]})`
        overlayBackImg.style.backgroundImage=`url(${tabComplet[1].images[0]})`

        

    }else{
        const nophoto = document.createElement('img')
        nophoto.classList.add("no-photo")
        nophoto.src = "/icon/no-photo.svg"
        nophoto.alt = "pas de photo"
        nophoto.width = "100px"
        nophoto.height = "100px"

        


        divFolder.appendChild(nophoto)
    }


    contentsubfolder.appendChild(discribe)

    const div = document.createElement('div')
    div.classList.add('contentsubclient')
    
    const ajoutsub = document.createElement('div')
                ajoutsub.id = 'addImgSub'
                ajoutsub.classList.add('subcategoryclient')
                const backgroundavecimages = document.createElement('div')
                backgroundavecimages.style.backgroundColor="#000"
                
                const img = document.createElement('img')
                img.style.width = "80%"
                img.style.aspectRatio =" 1 / 1 "
                backgroundavecimages.appendChild(img)
                img.src = "/icon/plus.svg"
                const bk = document.createElement('span')
                bk.style.padding="2px"
                bk.classList.add('background')
                bk.appendChild(backgroundavecimages)
                ajoutsub.appendChild(bk)

                bk.addEventListener('click',()=>{
                    const folder = fName(tabComplet[0]);

                        // Créer une overlay pour contenir le formulaire
                        const overlay = document.createElement('div');
                        overlay.style.position = 'fixed';
                        overlay.style.top = 0;
                        overlay.style.left = 0;
                        overlay.style.width = '100%';
                        overlay.style.height = '100vh';
                        overlay.style.zIndex = '100000';
                        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                        overlay.style.display = 'flex';
                        overlay.style.flexDirection = 'column';
                        overlay.style.justifyContent = 'center';
                        overlay.style.alignItems = 'center';
                    
                        // Créer le formulaire
                        const form = document.createElement('div');
                        form.classList.add('form-subfolder-creat');
                    
                        const h2 = document.createElement('h2');
                        h2.classList.add('h2-subfolder');
                        h2.textContent = "Nouveau sous-dossier";
                    
                        const input = document.createElement('input');
                        input.classList.add('input-subfolder');
                        
                    
                        const contentbutton = document.createElement('div')
                        contentbutton.style.display = "flex"
                        contentbutton.style.justifyContent = "center"
                        contentbutton.style.alignItems = "center"
                        contentbutton.style.gap = "25px"
                    
                        const createButton = document.createElement('button');
                        createButton.classList.add('buttonform');
                        createButton.textContent = "Créer";
                    
                        const bg = document.createElement('div');
                        bg.classList.add('background-button')
                        bg.appendChild(createButton)
                    
                        const closeButton = document.createElement('button');
                        closeButton.classList.add('button-close-subfolder');
                        closeButton.textContent = "Annuler";
                    
                        contentbutton.appendChild(bg)
                        contentbutton.appendChild(closeButton)
                    
                        // Actions pour les boutons
                        createButton.addEventListener('click', () => {
                            load()
                            const value = input.value; // Input for the subfolder name
                        
                            if (!value || !folder) {
                                finload()
                                console.error('Both folder and subfolder names must be provided');
                                return;
                            }
                        
                            console.log(`Je vais créer le sous-dossier ${value} dans ${folder}`);
                        
                            fetch('/add-sub-folder', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                credentials: 'include',
                                body: JSON.stringify({ folder, subFolder: value }),
                            })
                            .then(response => response.json())
                            .then(data => {
                                if (data.success) {
                                    console.log(`Sous-dossier ${value} créé avec succès dans ${folder}`);

                                    document.body.removeChild(overlay)
                                    finload()
                                    getContenuPhoto().then(async () => {
                                        const cl = `#f-${data.dossier}`;
                                        const sub = `#${data.sousdossier}`;
    
                                        document.querySelector(cl).click();
                                        setTimeout(() => {
                                            document.querySelector(sub).click()
                                        }, 100);

                                    
                                        
                                    });
                                    
                                    
                                } else {
                                    finload()
                                    msg.textContent=data.message;
                                }
                            })
                            .catch(error => finload());
                        });
                    
                        closeButton.addEventListener('click', () => {
                            document.body.removeChild(overlay); // Supprimer l'overlay au clic sur "Annuler"
                        });
                    
                        const msg = document.createElement('p')
                        msg.classList.add('responseform')
                    
                        // Ajout des éléments au formulaire
                        form.appendChild(h2);
                        form.appendChild(input);
                        form.appendChild(contentbutton);
                        form.appendChild(msg);
                        
                    
                        // Ajout du formulaire à l'overlay
                        overlay.appendChild(form);
                    
                        // Ajout de l'overlay au body
                        document.body.appendChild(overlay);
                    
                    
                })           


                div.appendChild(ajoutsub)
                

    

        if (Object.entries(tabComplet[1]).length > 0) {
            
            
            for (const [sousCategorie, details] of Object.entries(tabComplet[1])) {
                
                if(sousCategorie !== "images"){
    
                    const subdiv = document.createElement('div')
                    subdiv.id = sousCategorie
                    subdiv.classList.add('subcategoryclient')
                    const backgroundavecimage = document.createElement('div')
                    subdiv.appendChild(backgroundavecimage)
                    
                    
                    const count = document.createElement('span')
                    count.classList.add('countImgAlbum')
                    count.style.position ="absolute"
                    // count.textContent= details.images.length
                    if(details.images){
                        count.textContent= details.images.length
                    }else{
                        count.textContent= "0"
                    }
                    
                    
                    div.appendChild(subdiv)
                    subdiv.appendChild(count)
                    
                    
                    contenu.appendChild(contentsubfolder)
                    
    
                    subdiv.addEventListener('click',()=>{
                        imgall(details,sousCategorie,selectLayout)
                        
                    })
    
                    if (Array.isArray(details.images)) {
                        
                        backgroundavecimage.style.backgroundImage = `url(${details.images[0]})`
                        div.appendChild(subdiv)
                        
                    }
                    
                }else{
                    contenu.appendChild(contentsubfolder)
                }
    
                
            }
        }else{
            
            contenu.appendChild(contentsubfolder)
        }
        

       
        document.querySelector('#photos').appendChild(div)


        const newDesc = document.createElement('div')
        newDesc.classList.add('newDesc')
        const h2desc = document.createElement('h2')
        h2desc.classList.add('textbuttonportfolio')
        h2desc.style.textAlign = "center"
        h2desc.textContent = "Modifier la déscription"
        const inputdesc = document.createElement('input')
        const bkk = document.createElement('div')
        bkk.style.width = "auto"
        
        bkk.classList.add('background-button')
        const buttondescdesc = document.createElement('button')
        buttondescdesc.classList.add('buttonform')
        buttondescdesc.textContent = "Modifier"

        buttondescdesc.addEventListener('click', () => {
            load()

            const value = `“${document.querySelector('#newDescribe').value.trim()}”`;
            const folder = document.querySelector('.h2seclectall').textContent.trim();
          
            if (!folder || !value) {
              document.querySelector('#newDescribe').style.border = '2px solid red'
              return;
            }
          
            fetch('/update-desc', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ folder, description: value })
            })
            .then(response => response.json())
            .then(data => {
                finload()
              if (data.success) {
                document.querySelector('#newDescribe').style.border = ''
                document.querySelector('#newDescribe').value = ''
                document.querySelector('.descriptionPortfolio').textContent =  value
              } else {
                document.querySelector('#newDescribe').style.border = '2px solid red'
              }
            })
            .catch(err => {
                finload()
              document.querySelector('#newDescribe').style.border = '2px solid red'
            });
          });
          

        bkk.appendChild(buttondescdesc)
        inputdesc.classList.add('inputticket')
        inputdesc.id = "newDescribe"
        inputdesc.style.borderTopRightRadius = "50px"
        inputdesc.style.borderBottomRightRadius = "50px"
        inputdesc.style.width = "100%"
        inputdesc.style.maxWidth ="400px"
        inputdesc.type = "text"

        inputdesc.addEventListener('input',()=>{
            
            if(document.querySelector('.descriptionPortfolio')){
                document.querySelector('#newDescribe').style.border = ''
                document.querySelector('.descriptionPortfolio').textContent =  `“${inputdesc.value}”`
            }
        })

        newDesc.appendChild(h2desc)
        newDesc.appendChild(inputdesc)
        newDesc.appendChild(bkk)

        document.querySelector('#photos').appendChild(newDesc)

            const firstEntry = Object.entries(tabComplet[1])[0]; // Récupère le premier élément
            console.log(firstEntry[0]);
            if (firstEntry[0] != "images") {
                const [sousCategorie, details] = firstEntry;
                imgall( details,sousCategorie, selectLayout);
            }
      

        window.addEventListener('scroll', () => {
            const elements = document.querySelectorAll('.folderClientWithImgage');
            const windowHeight = window.innerHeight;
        
            elements.forEach(el => {
                const rect = el.getBoundingClientRect(); // position par rapport à la fenêtre
                const elementTop = rect.top;
        
                if (elementTop < windowHeight && elementTop > -rect.height) {
                    const scrollProgress = 1 - (elementTop / windowHeight); // entre 0 et 1
                    const offset = scrollProgress * 20; // 20px max de déplacement (tu peux ajuster)
        
                    el.style.transform = `translateY(${offset}px) `;
                } else {
                    // Optionnel : reset si en dehors du viewport
                    el.style.transform = `translateY(0px)`;
                }
            });
        });

}


window.selectLayout = window.selectLayout || "div"


function imgall(details, name, lelayout) {
    // Supprimer l'ancien contenu si existant
    if (document.querySelector('.contentimg')) {
        document.querySelector('.contentimg').remove();
    }

    

    const contentimg = document.createElement('div');
    contentimg.classList.add('contentimg');
    contentimg.style.width = "100%";
    document.querySelector('#photos').appendChild(contentimg);

    const div = document.createElement('div')
    div.style.display ="flex"
    div.style.flexDirection = "row-reverse"
    div.style.justifyContent="center"
    div.style.alignItems="center"
    div.style.gap = "10px"
    
    const ajoutsub = document.createElement('div')
                ajoutsub.id = 'addImgSub'
                ajoutsub.classList.add('buttonportfolio')
                const backgroundavecimages = document.createElement('div')
                backgroundavecimages.style.backgroundColor="#000"
                
                const img = document.createElement('img')
                img.style.width = "70%"
                img.style.aspectRatio =" 1 / 1 "
                backgroundavecimages.appendChild(img)
                img.src = "/icon/plus.svg"
                const bk = document.createElement('span')
                bk.classList.add('background')
                bk.appendChild(backgroundavecimages)
                ajoutsub.appendChild(bk)
                const s = document.createElement('h2')
                s.classList.add('textbuttonportfolio')
                s.textContent= 'Ajouter photos'
                div.appendChild(s)

                div.appendChild(ajoutsub)
                
                const input = document.createElement("input");
                input.type = "file";
                input.id = "downloadphotoportfolio";
                input.accept = "image/*";
                input.multiple = true;

                ajoutsub.appendChild(input)

                input.addEventListener('change',(event)=>{
                    load()
                    console.log('je fonctionne');
                    const dossier = document.querySelector('.h2seclectall').textContent; // Dossier principal
                    const sub = fName(name) // Dossier secondaire (chaîne vide si subChoisi est vide)

                    const formData = new FormData();
                    formData.append('dossier', dossier);  // Ajouter le dossier principal
                    formData.append('sub', sub);          // Ajouter le sous-dossier (ou chaîne vide)

                    Array.from(event.target.files).forEach(file => {
                        formData.append('photos', file); // Ajouter chaque photo au FormData
                    });

                    

                    fetch('/creat-image-portfolio', {
                        method: 'POST',
                        credentials: 'include',
                        body: formData,
                    })
                    .then(response => response.json())
                    .then(data => {
                        finload()
                        getContenuPhoto().then(async () => {
                            const cl = `#f-${data.folder}`;
                            const sub = `#${data.subFolder}`;
                        
                            document.querySelector(cl).click();
                        
                            try {
                                const subFolderEl = await waitForElement(sub);
                                subFolderEl.click();
                        
                                // Autres actions ici
                            } catch (e) {
                                console.error(e);
                            }
                        });
                    })
                    .catch(error => {
                        finload()
                        console.error('Erreur lors du téléchargement des images:', error);
                    });
                })
                
                
    const div2 = document.createElement('div')
    div2.style.display ="flex"
    div2.style.flexDirection = "row-reverse"
    div2.style.justifyContent="center"
    div2.style.alignItems="center"
    div2.style.gap = "10px"

    const editsub = document.createElement('div')
                editsub.id = 'editSub'
                editsub.classList.add('buttonportfolio')
                const backgroundavecimages2 = document.createElement('div')
                backgroundavecimages2.style.backgroundColor="#000"
                
                const img2 = document.createElement('img')
                img2.style.width = "70%"
                img2.style.aspectRatio =" 1 / 1 "
                backgroundavecimages2.appendChild(img2)
                img2.src = "/icon/edit.svg"
                const bk2 = document.createElement('span')
                
                bk2.classList.add('background')
                bk2.appendChild(backgroundavecimages2)
                editsub.appendChild(bk2)
                const s2 = document.createElement('h2')
                s2.classList.add('textbuttonportfolio')
                s2.textContent= `Modifier le nom de ${fName(name)}`
                div2.appendChild(s2)

                div2.appendChild(editsub)  
                
                bk2.addEventListener('click',()=>{
                    const folder = document.querySelector('.h2seclectall').textContent; // Assuming there's an element with id 'titrefolder'
       
                    const oldSubFolder = document.querySelector('#select-sub').textContent;
                    console.log(oldSubFolder); // Assuming sub.subcategoryName contains the current subfolder name
                
                    if (!folder || !oldSubFolder) {
                        console.error('Both folder and subfolder names must be provided for editing');
                        return;
                    }
                
                    // Create an overlay for editing the subfolder name
                    const overlay = document.createElement('div');
                    overlay.style.position = 'fixed';
                    overlay.style.top = 0;
                    overlay.style.left = 0;
                    overlay.style.width = '100%';
                    overlay.style.height = '100vh';
                    overlay.style.zIndex = '100000';
                    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                    overlay.style.display = 'flex';
                    overlay.style.flexDirection = 'column';
                    overlay.style.justifyContent = 'center';
                    overlay.style.alignItems = 'center';
                
                    const form = document.createElement('div');
                    form.classList.add('form-subfolder-creat');
                
                    const h2 = document.createElement('h2');
                    h2.textContent = `Modifier le sous-dossier : ${oldSubFolder}`;
                    h2.classList.add('h2-subfolder')
                
                    const input = document.createElement('input');
                    input.placeholder = "Nouveau nom du sous-dossier";
                    input.classList.add('input-subfolder')
                    input.value = oldSubFolder;
                
                    const contentbutton = document.createElement('div');
                    contentbutton.style.display = 'flex';
                    contentbutton.style.justifyContent = 'center';
                    contentbutton.style.alignItems = 'center';
                    contentbutton.style.gap = '25px';
                
                    const saveButton = document.createElement('button');
                    saveButton.classList.add('buttonform')
                    saveButton.textContent = 'Enregistrer';

                    const bg = document.createElement('div');
                    bg.classList.add('background-button')
                    bg.appendChild(saveButton)
                
                    const closeButton = document.createElement('button');
                    closeButton.classList.add('button-close-subfolder')
                    closeButton.textContent = 'Annuler';
                
                    saveButton.addEventListener('click', () => {
                        const newSubFolder = input.value;
                        load()
                        if (!newSubFolder || newSubFolder === oldSubFolder) {
                            console.error('Provide a valid new name for the subfolder');
                            return;
                        }
                
                        fetch('/edit-sub-folder', {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            credentials: 'include',
                            body: JSON.stringify({ folder, oldSubFolder, newSubFolder }),
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                console.log(`Sous-dossier renommé en ${newSubFolder} dans ${folder}`);
                                finload()
                                document.body.removeChild(overlay);
                                getContenuPhoto().then(() => {
                                    const cl = `f-${data.dossier}`
                                    document.querySelector(`#${cl}`).click()
                                    // Autres actions à exécuter après
                                });;
                                
                            } else {
                                finload()
                                console.error(data.message);
                            }
                        })
                        .catch(error => finload());
                    });
                
                    closeButton.addEventListener('click', () => {
                        document.body.removeChild(overlay);
                    });
                
                    contentbutton.appendChild(bg);
                    contentbutton.appendChild(closeButton);
                
                    form.appendChild(h2);
                    form.appendChild(input);
                    form.appendChild(contentbutton);
                
                    overlay.appendChild(form);
                
                    document.body.appendChild(overlay);
                })
                
    const div3 = document.createElement('div')
    div3.style.display ="flex"
    div3.style.flexDirection = "row-reverse"
    div3.style.justifyContent="center"
    div3.style.alignItems="center"
    div3.style.gap = "10px"

    const supsub = document.createElement('div')
                supsub.id = 'supSub'
                supsub.classList.add('buttonportfolio')
                const backgroundavecimages3 = document.createElement('div')
                backgroundavecimages3.style.backgroundColor="#000"
                
                const img3 = document.createElement('img')
                img3.style.width = "70%"
                img3.style.aspectRatio =" 1 / 1 "
                backgroundavecimages3.appendChild(img3)
                img3.src = "/icon/remove.svg"
                const bk3 = document.createElement('span')
                
                bk3.classList.add('background')
                bk3.appendChild(backgroundavecimages3)
                supsub.appendChild(bk3)
                const s3 = document.createElement('h2')
                s3.classList.add('textbuttonportfolio')
                s3.textContent= `Supprimer ${fName(name)}`
                div3.appendChild(s3)

                bk3.addEventListener('click',()=>{
                    load()
                    const folder = document.querySelector('.h2seclectall').textContent; // Assuming there's an element with id 'titrefolder'
       
                    const subFolder = name;// Assuming there's an element with id 'titrefolder'
                   
                
                    if (!folder || !subFolder) {
                        console.error('Both folder and subfolder names must be provided for deletion');
                        finload()
                        return;
                    }
                
                    
                
                    fetch('/remove-sub-folder', {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                        body: JSON.stringify({ folder, subFolder }),
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            finload()
                            getContenuPhoto().then(() => {
                                const cl = `f-${data.dossier}`
                                
                                document.querySelector(`#${cl}`).click()
                                // Autres actions à exécuter après
                            });;
                        } else {
                            finload()
                            console.error(data.message);
                        }
                    })
                    .catch(error => finload());
                })

                div3.appendChild(supsub)

    const outils = document.createElement('div');
    outils.classList.add('outils');
    const contentsubclient = document.createElement('div')
    contentsubclient.classList.add('contentButtonsubclient')
    contentsubclient.appendChild(div3)
    contentsubclient.appendChild(div2)
    contentsubclient.appendChild(div)
    contentimg.appendChild(outils);
    contentimg.appendChild(contentsubclient)
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
    h2.id = "select-sub"
    h2.textContent = fName(name);
    outils.appendChild(h2);

    const layout = document.createElement('img');
    layout.classList.add('layout');
    layout.src = "/icon/layout.svg";
    outils.appendChild(layout);

    const imgs = document.createElement('div');
    imgs.classList.add('contentToutesPhotos');
    contentimg.appendChild(imgs);


    if (lelayout === 'div') {

        if(details.images){
            details.images.forEach(img => {
                const div = document.createElement('div');
                const limg = document.createElement('img');
                limg.classList.add('visible')
                limg.src = img;
                limg.classList.add('animphoto');
                limg.setAttribute("fetchpriority", "high");
                limg.setAttribute("decoding", "sync");
                limg.setAttribute("draggable", "false");
                limg.addEventListener('contextmenu', e => e.preventDefault());

                div.classList.add('subcategoryclient-b');
                div.appendChild(limg);
                imgs.appendChild(div);


                div.addEventListener('mouseup', startPressTimer);
                div.addEventListener('touchend', startPressTimer, { passive: true });

                div.addEventListener('mousedown', initPressStartTime);
                div.addEventListener('touchstart', initPressStartTime, { passive: true });

                div.addEventListener('click', handleClick);

                function initPressStartTime() {
                    pressStartTime = Date.now();
                    clearInterval(pressTimer);
                }

                function startPressTimer() {
                    const elapsed = Date.now() - pressStartTime;
                    if (elapsed > 500) {
                        selectedMode = true;
                        if (!document.querySelector('.corbeil')) {
                            addDeleteImg(div);
                        }
                        deleteImg(div)
                    }
                }

                function handleClick() {
                    if (selectedMode) {
                        deleteImg(div);
                    } else {
                        showOverlay(limg.src);
                    }
                }

                
            });
        }
            

    }
    else if (lelayout === 'img') {
        const imgs2 = document.createElement('div')
        imgs2.classList.add('imgsMansory')
        imgs.appendChild(imgs2)
    

        if(details.images){
            details.images.forEach(img => {
            
                const limg = document.createElement('img');
                limg.classList.add('visible')
                limg.style.width = '100%';
                limg.style.boxShadow = '0px 0px 20px rgba(0, 0, 0, 0.11)'
                limg.style.height = 'auto';
                limg.style.marginBottom = '2px';
                limg.style.breakInside = 'avoid';
                limg.loading = "lazy";
                limg.src = img;
        
                limg.addEventListener('contextmenu', e => e.preventDefault());
                limg.addEventListener('click', () => showOverlay(img));
    
                
                imgs2.appendChild(limg);
            });
        }
        
    }
}


let selectedMode = false
let selectedImages = [];
let pressStartTime = 0;
let pressTimer = null;


function deleteImg(div) {
    console.log('je selectiopn bien');
     // La div cliquée
    const img = div.querySelector('img')       // L'image dans la div


    if (selectedImages.length === 0) {
        // Si rien n'est sélectionné, on ajoute l'image à selectedImages
        selectedImages.push(img.src);
        div.style.transform = "scale(0.9)";
        div.style.boxShadow = "0px 0px 10px red";
    } else {
        // Si une image est déjà sélectionnée, on parcourt selectedImages
        let found = false;  // Variable pour savoir si l'image est déjà sélectionnée

        selectedImages.forEach((src, index) => {
            if (src === img.src) {
                // Si l'image est déjà sélectionnée, on la retire
                div.style.transform = "";
                div.style.boxShadow = "";
                selectedImages.splice(index, 1);  // Retirer l'image du tableau
                found = true;  // Marque que l'image a été trouvée et supprimée
            }
        });

        // Si l'image n'était pas trouvée (non sélectionnée), on l'ajoute
        if (!found) {
            selectedImages.push(img.src);
            div.style.transform = "scale(0.9)";
            div.style.boxShadow = "0px 0px 10px red";
        }
    }

    
}




// ✅ Empêche la réactivation du mode sélection si déjà actif
function addDeleteImg(div) {


    const content = document.createElement('div')
    const img = document.createElement('img')
    img.src = '/icon/poubelle.svg'
    img.alt = "svg bouton pour supprimer les images"
    content.classList.add('corbeil')
    content.appendChild(img)

    document.querySelector('#admin').appendChild(content)

    content.classList.add('content-corbeil')

    const annuler = document.createElement('div')
    annuler.classList.add('annuler')
    const retour = document.createElement('img')
    retour.alt = 'svg bouton pour annuler la suppression'
    retour.src = '/icon/return-svgrepo-com.svg'
    annuler.appendChild(retour)
    document.querySelector('#admin').appendChild(annuler)

    const all = document.createElement('div')
    all.classList.add('all')
    const bk = document.createElement('div')
    bk.classList.add('background')
    const p = document.createElement('p')
    p.textContent='All'
    bk.appendChild(p)
    all.appendChild(bk)
    document.querySelector('#admin').appendChild(all)

    // ✅ Annulation propre du mode sélection
    annuler.addEventListener('click',(event)=>{
        event.stopPropagation();
        resetSelectionMode();
    });

    all.addEventListener('click',(event)=>{
        event.stopPropagation();
        selectedImages = []
        document.querySelectorAll('.subcategoryclient-b').forEach(div => {
            const img = div.querySelector('img'); 
            if (img) {
                selectedImages.push(img.src); 
            }
            div.style.transform = "scale(0.9)";
            div.style.boxShadow = "0px 0px 10px red";
        });
    });

    content.addEventListener('click', async (event) => {
        event.stopPropagation();
        
        if (selectedImages.length === 0) {
            resetSelectionMode();
            return;
        }

        try {
            load()
            const response = await fetch('/delete-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ imagePaths: selectedImages })
            });

            const result = await response.json();

            if (response.ok) {
                finload()
                resetSelectionMode();
    
                getContenuPhoto().then(async () => {
                    const cl = `#f-${result.folder}`;
                    const sub = `#${result.subfolder}`;
                
                    document.querySelector(cl).click();
                
                    try {
                        const subFolderEl = await waitForElement(sub);
                        subFolderEl.click();
                
                        // Autres actions ici
                    } catch (e) {
                        console.error(e);
                    }
                });
            } else {
                finload()
                console.warn("Certaines images n'ont pas pu être supprimées:", result.errors);
            }
        } catch (error) {
            finload()
            console.error("Erreur lors de la suppression des images:", error);
        }
    });
}

function waitForElement(selector, timeout = 3000) {
    return new Promise((resolve, reject) => {
        const start = Date.now();

        const interval = setInterval(() => {
            const element = document.querySelector(selector);
            if (element) {
                clearInterval(interval);
                resolve(element);
            } else if (Date.now() - start > timeout) {
                clearInterval(interval);
                reject(`L'élément ${selector} n'est pas apparu dans le DOM`);
            }
        }, 100); // check every 100ms
    });
}


// ✅ Fonction pour bien remettre tout à zéro après la suppression/annulation
function resetSelectionMode() {
 // ✅ déjà désactivé

    
    
    clearInterval(pressTimer);
    selectedMode = false
    selectedImages = [];
    pressStartTime = 0;



    document.querySelectorAll('.subcategoryclient-b').forEach(div => {
        div.style.transform = "";
        div.style.boxShadow = "";
    });

    document.querySelectorAll('.corbeil, .annuler, .all').forEach(el => el.remove());

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



function fetchvideo(){
    const container = document.querySelector('#videos')
        fetch('/get-videos',{
            credentials: 'include',
        })
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



function load(){
        
    const overlay = document.createElement('div');
    overlay.classList.add('overlayLoad');
    overlay.style.visibility="visible";
    overlay.style.opacity="1"
    console.log(overlay);
    const loadiv = document.createElement('div')
    loadiv.classList.add('loaderecrit')
    overlay.appendChild(loadiv)
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



})()