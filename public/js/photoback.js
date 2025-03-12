

if (typeof newobserver === "undefined") {
    // Créer un observer qui détecte les changements dans le DOM
const newobserver = new MutationObserver((mutationsList, observer) => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            // Vérifier si #navback a été ajouté au DOM
            const nav = document.getElementById('return');
            if (nav) {
                nav.remove(); // Supprimer l'élément dès qu'il est détecté

                // Réinjecter #navback dans body
                document.body.appendChild(nav); // Ajouter navback dans body
                
                observer.disconnect(); // Arrêter l'observation après suppression et réinjection
            }
        }
    }
});

// Observer les changements dans le DOM
const newconfig = { childList: true, subtree: true };
newobserver.observe(document.body, newconfig);

}




document.querySelector('#return').addEventListener('click',()=>{
    document.querySelector('#contenuPhotoVideo').classList.toggle('dnone', true);
    document.querySelector('#contenuPhotoVideo').classList.toggle('dflex', false);
    document.querySelector('#parentportfolio').classList.toggle('dflex', true);
    document.querySelector('#parentportfolio').classList.toggle('dnone', false);
    document.querySelector('#jsportfoliopv').remove()
    document.querySelector('#return').remove()
    setTimeout(() => {
        const script = document.createElement('script')
        script.id="jsportfoliopv"
        document.body.appendChild(script)
    }, 500);
})



window.objfolders = window.objfolders || {}; // Ne le redéclare pas s'il existe déjà

window.count = window.count || 1
window.chemin = window.chemin || document.querySelector('#chemin')

async function getContenuPhoto() {
    try {
        const response = await fetch('/getcontenuphoto');
        if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données');
    }
      const data = await response.json(); // Données reçues depuis le serveur
        creatFolder(count , data)
        objfolders = data
        console.log(data);
    } catch (error) {
        console.error('Erreur :', error);
    }
}
getContenuPhoto();

window.subChoisi = window.subChoisi || ''

function after(){
    document.querySelector('#after').addEventListener('click',(event)=>{
        event.stopPropagation()
        subChoisi = ''
        const n = Object.values(objfolders).length;
        const test2 =document.querySelector('.containerLogoFolder')
        test2.classList.add('animrotate')
        setTimeout(() => {
            
            test2.classList.remove('animrotate')
            
        }, 250);
    
        if(count < n){
            count++
            creatFolder(count, objfolders)
        }else{
            count = 1
            creatFolder(count, objfolders)
        }
    
    })
}
after()
before()
function before(){
    document.querySelector('#before').addEventListener('click', (event) => {
        event.stopPropagation()
        subChoisi = ''
        
        const n = Object.values(objfolders).length;
        const test2 =document.querySelector('.containerLogoFolder')
        test2.classList.add('animrotatemoins')
        setTimeout(() => {
            test2.classList.remove('animrotatemoins')
            
        }, 250);
    
        if (count > 1) {
            count--;
            creatFolder(count, objfolders)
        } else {
            count = n;
            creatFolder(count, objfolders)
        }
    
    });
}


function touchFolder() {
            document.querySelector('#countPhoto').textContent="0";
            document.querySelector('#countPhoto').style.backgroundColor = "rgb(193, 52, 52)"
            const tabEls  = document.querySelectorAll('.contentsoussvgfolder')
            tabEls.forEach(tabEl =>{
                tabEl.style.transform = 'scale(1)'
            })
}

function creatFolder(count, data) {
    document.querySelector('#afficherphotos').textContent="";
    document.querySelector('#countPhoto').textContent="0";
    const categoryKeys = Object.keys(data);
    const firstCategoryKey = categoryKeys[count - 1];
    const firstCategory = data[firstCategoryKey];
    document.querySelector('#chemin').textContent = `${firstCategoryKey}/`
    

    if (Number(document.querySelector('#countPhoto').textContent) === 0) {
        document.querySelector('#countPhoto').style.backgroundColor = "#c13434";
    }else{
        document.querySelector('#countPhoto').style.backgroundColor = "#fff";
    }
    
    

    if (firstCategory.images && Object.values(firstCategory).length > 1) {
        
        // Gérer les sous-dossiers et les images
        const subfolders = Object.entries(firstCategory)
            .filter(([key]) => key !== "images") // Exclure la clé "images"
            .map(([subcategoryName, subcategoryData]) => ({
                subcategoryName,
                images: subcategoryData.images || [],
            }));
    
        // Créer les sous-dossiers en premier
        creatSubFolders(subfolders);
    
        // Afficher les images principales après avoir géré les sous-dossiers
        addImages(firstCategory.images);
    
        // Ajout d'une interaction pour réafficher les images principales au clic sur le dossier principal
        const svgFolder = document.querySelector('#contentsvgfolder');
        if (svgFolder) {
        // Supprime tous les anciens gestionnaires d'événements
        const newSvgFolder = svgFolder.cloneNode(true);
        svgFolder.replaceWith(newSvgFolder);
        after()
        before()
        edit()
        remove()

        // Ajoute un nouvel événement click
        newSvgFolder.addEventListener('click', () => {
            document.querySelector('#chemin').textContent = `${firstCategoryKey}/`
            touchFolder()
            addImages(firstCategory.images);
            subChoisi = ''
            
            });
        }
    }else if (firstCategory.images) {
        // Gérer les cas où il n'y a que des images
        creatSubFolders(null); // Aucun sous-dossier
        addImages(firstCategory.images);

        const svgFolder = document.querySelector('#contentsvgfolder');
        if (svgFolder) {
            // Supprime tous les anciens gestionnaires d'événements
            const newSvgFolder = svgFolder.cloneNode(true);
            svgFolder.replaceWith(newSvgFolder);
            after()
            before()
            edit()
            remove()


            // Ajoute un nouvel événement click
            newSvgFolder.addEventListener('click', () => {
                touchFolder()
                addImages(firstCategory.images);
                subChoisi = ''
                
            });
        }
    } else {

        // Gérer les cas où il n'y a que des sous-dossiers
        const subfolders = Object.entries(firstCategory).map(([subcategoryName, subcategoryData]) => ({
            subcategoryName,
            images: subcategoryData.images || [],
        }));
        creatSubFolders(subfolders);
        const newSvgFolder = document.querySelector('#contentsvgfolder').cloneNode(true);
            document.querySelector('#contentsvgfolder').replaceWith(newSvgFolder);
            after()
            before()
            edit()
            remove()

            newSvgFolder.addEventListener('click', () => {
            document.querySelector('#afficherphotos').textContent=""
            document.querySelector('#chemin').textContent = `${firstCategoryKey}/`
            
            subChoisi = ''
            
            touchFolder()
        });
    }

    // Met à jour le titre du dossier
    const affichageNom = firstCategoryKey.replace(/_/g, ' ');
    document.querySelector('#titrefolder').textContent = affichageNom;
    
    
}



function creatSubFolders(tabsub) {
    
    const parent = document.querySelector('#lesSousDossiers');
    const allsubfolder = document.querySelectorAll('.contentsoussvgfolder');
    if (allsubfolder) {
        allsubfolder.forEach(folder => folder.remove());
    }

    if (!tabsub) {
        console.log('Pas de sous-dossiers');
        document.querySelector('#countsubFolder').textContent = "0"
        document.querySelector('#countsubFolder').style.backgroundColor = "#c13434"
    } else {
        document.querySelector('#countsubFolder').textContent = tabsub.length;
        document.querySelector('#countsubFolder').style.backgroundColor = "#fff"
        tabsub.forEach(sub => {
            const div = document.createElement('div');
            div.classList.add('contentsoussvgfolder');

            const h3 = document.createElement('h3');
            h3.classList.add('titresousdossier');
            h3.textContent = sub.subcategoryName;

            const div2 = document.createElement('div');
            div2.style.position = 'relative';

            const svg = document.createElement('img');
            svg.alt = "Icône d'un dossier en SVG, cliquez dessus pour afficher les photos";
            svg.classList.add('svgsousFolder');
            svg.src = 'icon/folder.svg';

            const divlogo = document.createElement('div');
            divlogo.classList.add('containerLogosousFolder');

            const background = document.createElement('div');
            background.classList.add('background');

            const logo = document.createElement('img');
            logo.classList.add('imgsousFolder');
            logo.src = 'logo/logotransparant.png';
            logo.alt = 'Logo siteUp';

            const remove = document.createElement('div');
            remove.classList.add('removesubfolder');
            const bg = document.createElement('div')
            bg.classList.add('background')
            const svgremove = document.createElement('img')
            svgremove.src = "icon/remove.svg"
            remove.appendChild(bg)
            bg.appendChild(svgremove)
            remove.addEventListener('click', () => {
                const folder = document.querySelector('#titrefolder').textContent; // Assuming there's an element with id 'titrefolder'
                const subFolder = sub.subcategoryName; // Assuming sub.subcategoryName contains the subfolder name
            
                if (!folder || !subFolder) {
                    console.error('Both folder and subfolder names must be provided for deletion');
                    return;
                }
            
                console.log(`Je vais supprimer le sous-dossier ${subFolder} du dossier ${folder}`);
            
                fetch('/remove-sub-folder', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ folder, subFolder }),
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        getContenuPhoto();
                    } else {
                        console.error(data.message);
                    }
                })
                .catch(error => console.error('Erreur:', error));
            });

            const edit = document.createElement('div');
            edit.classList.add('editsubfolder');
            const bgedit = document.createElement('div')
            bgedit.classList.add('background')
            const svgedit = document.createElement('img')
            svgedit.src = "icon/folder-edit.svg"
            edit.appendChild(bgedit)
            bgedit.appendChild(svgedit)
            
            edit.addEventListener('click', () => {
                const folder = document.querySelector('#titrefolder').textContent; // Assuming there's an element with id 'titrefolder'
                const oldSubFolder = sub.subcategoryName; // Assuming sub.subcategoryName contains the current subfolder name
            
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
            
                    if (!newSubFolder || newSubFolder === oldSubFolder) {
                        console.error('Provide a valid new name for the subfolder');
                        return;
                    }
            
                    fetch('/edit-sub-folder', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ folder, oldSubFolder, newSubFolder }),
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            console.log(`Sous-dossier renommé en ${newSubFolder} dans ${folder}`);
                            document.body.removeChild(overlay);
                            getContenuPhoto();
                        } else {
                            console.error(data.message);
                        }
                    })
                    .catch(error => console.error('Erreur:', error));
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

            parent.appendChild(div);
            div.appendChild(h3);
            div.appendChild(div2);
            div2.appendChild(svg);
            div2.appendChild(divlogo);
            div2.appendChild(edit)
            div2.appendChild(remove)
            divlogo.appendChild(background);
            background.appendChild(logo);

            // Gestion des sous-dossiers : cliquer pour afficher les images
            div.addEventListener('click', () => {
                const tabEls  = document.querySelectorAll('.contentsoussvgfolder')
                tabEls.forEach(tabEl =>{
                    tabEl.style.transform = 'scale(1)'
                })
                logo.classList.add('animrotate')
                subChoisi = sub.subcategoryName
                document.querySelector('#chemin').textContent = `${document.querySelector('#titrefolder').textContent}/${sub.subcategoryName}`
                setTimeout(() => {logo.classList.remove('animrotate')}, 250);
                addImages(sub.images);
                div.style.transform = 'scale(1.2)'
                document.querySelector('#contentsvgfolder').style.transform = 'scale(1)'
            });
        });
    }
}



function addImages(tabsrc) {
    
    const parent = document.querySelector('#afficherphotos');
    parent.textContent = "";
    document.querySelector('#countPhoto').textContent = tabsrc.length;
    if (Number(document.querySelector('#countPhoto').textContent) === 0) {
        document.querySelector('#countPhoto').style.backgroundColor = "#c13434";
    }else{
        document.querySelector('#countPhoto').style.backgroundColor = "#fff";
    }

    let delay = 0; // Pour l'affichage progressif

    tabsrc.forEach((src, index) => {
        const imgDiv = document.createElement('div');
        imgDiv.classList.add('img-gallery');

        // Loader pendant le chargement de l'image
        const loader = document.createElement('div');
        loader.classList.add('loader');
        imgDiv.appendChild(loader);

        const img = new Image();
        img.src = src;
        

        img.onload = () => {
            imgDiv.style.backgroundImage = `url(${src})`;
            setTimeout(() => {
                imgDiv.classList.add('loaded'); // Ajout d'un effet CSS
                loader.remove();
                parent.appendChild(imgDiv);

            }, delay);
            delay += 100; // Décalage entre les images
        };

        img.onerror = () => {
            loader.remove();
            console.error(`Erreur de chargement de l'image : ${src}`);
        };

        imgDiv.addEventListener("click",()=>{
            deleteImg(src,imgDiv)
        })
    });
}



function deleteImg(src,img) {
    console.log('Je vais supprimer : ' + src);

    fetch('/delete-img-portfolio', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ src }), // Envoi du chemin du fichier à supprimer
    })
        .then((response) => {
            if (response.ok) {
                img.remove()
                let countphoto = document.querySelector('#countPhoto').textContent
                document.querySelector('#countPhoto').textContent = countphoto - 1
                getContenuPhoto();
            } else {
                console.error('Erreur lors de la suppression de l\'image.');
            }
        })
        .catch((err) => {
            console.error('Erreur de connexion au serveur :', err);
        });
}

/////////////////////////////////////////////////////////
/////GESTION DES SUB FOLDERS ///////////////////////////
///////////////////////////////////////////////////////


// CREATE /////////////////////////////////////////////
document.querySelector('#new-subfolder-button').addEventListener('click', () => {
    const folder = document.querySelector('#titrefolder').textContent;

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
    input.placeholder="Nom du sous-dossier"

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
        const folder = document.querySelector('#titrefolder').textContent; // Assuming there's an input field with id 'folder'
        const value = input.value; // Input for the subfolder name
    
        if (!value || !folder) {
            console.error('Both folder and subfolder names must be provided');
            return;
        }
    
        console.log(`Je vais créer le sous-dossier ${value} dans ${folder}`);
    
        fetch('/add-sub-folder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ folder, subFolder: value }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log(`Sous-dossier ${value} créé avec succès dans ${folder}`);
                document.body.removeChild(overlay)
                getContenuPhoto();
                
            } else {
                msg.textContent=data.message;
            }
        })
        .catch(error => console.error('Erreur:', error));
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

    // Fermer le formulaire si l'utilisateur clique en dehors
//     overlay.addEventListener('click', (e) => {
//         if (e.target === overlay) {
//             document.body.removeChild(overlay);
//         }
//     });
 });


////////////////////////////////////////
///FOLDER PRINCIPAL////////////////////
////////////////////////////////////////////////////

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

    let folderplus = Object.values(objfolders).length + 1

    createButton.addEventListener('click', () => {
        const folderName = input.value;

        if (!folderName) {
            console.error('Nom du dossier principal requis');
            return;
        }

        fetch('/add-folder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ folderName }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log(`Dossier principal ${folderName} créé avec succès`);
                document.body.removeChild(overlay);
                
                // Rafraîchir les données
                getContenuPhoto().then(() => {
                    // Trouver l'index du nouveau dossier
                    const folderNames = Object.keys(objfolders).sort();
                    const newIndex = folderNames.indexOf(folderName);

                    if (newIndex !== -1) {
                        count = newIndex + 1; // Ajustez `count` à l'index (1-indexé si nécessaire)
                        document.querySelector('#afficherphotos').textContent="";

                        creatFolder(count, objfolders)
                    }
                });
            } else {
                console.error(data.message);
            }
        })
        .catch(error => console.error('Erreur:', error));
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



remove()
function remove(){
    document.querySelector('.removefolder').addEventListener('click', () => {
        const folder = document.querySelector('#titrefolder').textContent;
    
        // Création d'une overlay pour la confirmation
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
    
        // Contenu de l'overlay
        const confirmationBox = document.createElement('div');
        confirmationBox.classList.add('form-subfolder-creat');
    
        const message = document.createElement('p');
        message.classList.add('h2-subfolder')
        message.textContent = `Êtes-vous sûr de vouloir supprimer le dossier "${folder}" ?`;
    
        const contentbutton = document.createElement('div')
        contentbutton.style.display = "flex"
        contentbutton.style.justifyContent = "center"
        contentbutton.style.alignItems = "center"
        contentbutton.style.gap = "25px"
    
    
        
    
        const createButton = document.createElement('button');
        createButton.classList.add('buttonform');
        createButton.textContent = 'Valider';
        createButton.addEventListener('click', () => {
            fetch('/remove-folder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ folderName: folder }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log(`Dossier ${folder} supprimé avec succès.`);
                    document.body.removeChild(overlay);
                    count--
                    getContenuPhoto();
                } else {
                    console.error(data.message);
                }
            })
            .catch(error => console.error('Erreur:', error));
        });
    
        const bg = document.createElement('div');
        bg.classList.add('background-button')
        bg.appendChild(createButton)
    
        contentbutton.appendChild(bg)
    
        const closeButton = document.createElement('button');
        closeButton.classList.add('button-close-subfolder');
        closeButton.textContent = 'Annuler';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });
    
        contentbutton.appendChild(closeButton)
    
        
    
        confirmationBox.appendChild(message);
        confirmationBox.appendChild(contentbutton);
    
        overlay.appendChild(confirmationBox);
    
        document.body.appendChild(overlay);
    });
}

edit()
function edit(){
    document.querySelector('.editfolder').addEventListener('click', () => {
        const folder = document.querySelector('#titrefolder').textContent; // Assuming there's an element with id 'titrefolder'
        
    
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
        
            if (!newFolderName) {
                console.error('Nouveau nom du dossier requis');
                return;
            }
        
            fetch('/edit-folder', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    oldFolderName: folder,
                    newFolderName: newFolderName,
                }),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        console.log(data.message);
                        document.body.removeChild(overlay);
                        getContenuPhoto(); // Met à jour la liste des dossiers après renommage
                    } else {
                        console.error(data.message);
                    }
                })
                .catch(error => console.error('Erreur:', error));
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
}


document.querySelector('#downloadphotoportfolio').addEventListener('change', (event) => { 
    console.log('je fonctionne');
    const dossier = document.querySelector('#titrefolder').textContent; // Dossier principal
    const sub = subChoisi || ''; // Dossier secondaire (chaîne vide si subChoisi est vide)

    const formData = new FormData();
    formData.append('dossier', dossier);  // Ajouter le dossier principal
    formData.append('sub', sub);          // Ajouter le sous-dossier (ou chaîne vide)

    Array.from(event.target.files).forEach(file => {
        formData.append('photos', file); // Ajouter chaque photo au FormData
    });

    console.log('jenvoie '+ formData);

    fetch('/creat-image-portfolio', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        getContenuPhoto();
    })
    .catch(error => {
        console.error('Erreur lors du téléchargement des images:', error);
    });
});

