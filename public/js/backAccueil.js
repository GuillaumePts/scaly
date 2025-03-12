
function navBackAccueil(page) {
    const carrousel = document.querySelector('#lecarrou');
    const profile = document.querySelector('#profile');
    const service = document.querySelector('#trois');
    const img = document.querySelector('#illustration-accueil');

    const pagesConfig = {
        carrousel: {
            show: carrousel,
            hide: [profile, service, img],
            functions: [afficherImageCarrou] // Stocke la référence de la fonction sans l’exécuter
        },
        profile: {
            show: profile,
            hide: [carrousel, service, img],
            functions: [appelContenuProfile, appelContenuTextProfile]
        },
        img: {
            show: img,
            hide: [profile, carrousel, service],
            functions: [getIllustration]
        },
        services: {
            show: service,
            hide: [profile, carrousel, img],
            functions: [appelServices]
        }
    };

    // Vérifie si la page existe
    if (pagesConfig[page]) {
        const { show, hide, functions } = pagesConfig[page];

        // Affiche la page correspondante
        show.classList.remove('dnone');
        show.classList.add('dflex');

        // Cache les autres pages
        hide.forEach(element => {
            element.classList.remove('dflex');
            element.classList.add('dnone');
        });

        // ✅ Exécute les fonctions avec ou sans paramètre selon leur nom
        if (functions) {
            functions.forEach(fn => {
                if (typeof fn === 'function') {
                    if (fn.name === 'afficherImageCarrou') {
                        fn('imgMob'); // Appelle avec un paramètre si nécessaire
                    } else {
                        fn(); // Exécute normalement
                    }
                } else {
                    console.error("L'élément de la liste functions n'est pas une fonction :", fn);
                }
            });
        }
    } else {
        // Cas par défaut si aucune correspondance trouvée
        carrousel.classList.remove('dnone');
        carrousel.classList.add('dflex');
        profile.classList.add('dnone');
        profile.classList.remove('dflex');
        service.classList.add('dnone');
        service.classList.remove('dflex');
        img.classList.add('dnone');
        img.classList.remove('dflex');
    }
}


// ///////////////////////////////////////////////////////////////
///////////////////GESTION DE LA PAGE DACCUEIL //////////////////
////////////////////////////////////////////////////////////////

// ////////////CARROUS//////////////////////////


afficherImageCarrou('imgMob')

// afficher les images présente
function afficherImageCarrou(dossier){
    if(document.querySelector('#conteneurdesimages')){
        document.querySelector('#conteneurdesimages').textContent=""
    }
    fetch(`/imagecarrou?folder=${dossier}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des images.');
        }
        return response.json();
    })
    .then(data => {
        // console.log('Images récupérées :', data.images);
        console.log(data);
        if(dossier === 'imgMob'){
            const conteneur = document.querySelector('#imgM')
            const div = document.createElement('div')
            div.id = 'conteneurdesimages'
            conteneur.appendChild(div)
            let compteur = 0;
            data.images.forEach(img =>{
                const limg = document.createElement('img')
                limg.src = img
                limg.classList.add('imgm')
                limg.alt = 'image pour le diaporama au format petit écran'
                limg.addEventListener('click', ()=>{
                    supprimerImageCarrou(img);
                })
                div.appendChild(limg)
                compteur++;
                if (compteur === data.images.length) {
                    scrollImgCarrou('.imgm', '#imgM');

                }
            })
            
        }
    })
    .catch(error => {
        console.error('Erreur :', error);
    });
}

// GESTION ANIMATION SCROLL///////// 

function scrollImgCarrouLightOptimized(clas, conteneur) {
    const section = document.querySelector(conteneur);
    const images = document.querySelectorAll(clas);

    // Fonction pour gérer le scroll de manière limitée (debounce)
    let isScrolling = false;

    section.addEventListener('scroll', () => {
        if (isScrolling) return;

        isScrolling = true;

        requestAnimationFrame(() => {
            const sectionRect = section.getBoundingClientRect();
            const sectionCenter = sectionRect.left + sectionRect.width / 2;

            images.forEach((img) => {
                const imgRect = img.getBoundingClientRect();
                const imgCenter = imgRect.left + imgRect.width / 2;

                // Vérifier si l'image est proche du centre
                if (Math.abs(imgCenter - sectionCenter) < imgRect.width / 2 + 30) {
                    // Agrandir uniquement si nécessaire
                    if (img.style.width !== "250px") {
                        img.style.width = "250px";
                        img.style.height = "300px";
                    }
                } else {
                    // Réduire uniquement si nécessaire
                    if (img.style.width !== "200px") {
                        img.style.width = "200px";
                        img.style.height = "250px";
                    }
                }
            });

            isScrolling = false;
        });
    });
}

function scrollImgCarrouLight(clas, conteneur) {
    const section = document.querySelector(conteneur);
    const images = document.querySelectorAll(clas);

    // Mémorisation des états des images pour éviter les recalculs inutiles
    const imageStates = new Map();

    section.addEventListener('scroll', () => {
        // Calculer une seule fois les dimensions de la section
        const sectionRect = section.getBoundingClientRect();
        const sectionCenter = sectionRect.left + sectionRect.width / 2;

        images.forEach((img) => {
            const imgRect = img.getBoundingClientRect();
            const imgCenter = imgRect.left + imgRect.width / 2;

            // Vérifier si l'image est proche du centre
            const isCentered = Math.abs(imgCenter - sectionCenter) < imgRect.width / 2 + 30;
            const prevState = imageStates.get(img);

            if (isCentered && prevState !== "centered") {
                // L'image est proche du centre, agrandir
                imageStates.set(img, "centered");
                img.style.width = "250px";
                img.style.height = "300px";
            } else if (!isCentered && prevState !== "not-centered") {
                // L'image n'est pas proche du centre, revenir à sa taille normale
                imageStates.set(img, "not-centered");
                img.style.width = "150px";
                img.style.height = "200px";
            }
        });
    });
}



function scrollImgCarrou(clas, conteneur) {
    const section = document.querySelector(conteneur);
    const images = document.querySelectorAll(clas);

    // Fonction pour centrer l'image
    const centerImage = (img, sectionRect) => {
        const imgRect = img.getBoundingClientRect();
        const imgCenter = imgRect.left + imgRect.width / 2;
        const sectionCenter = sectionRect.left + sectionRect.width / 2;

        if (Math.abs(imgCenter - sectionCenter) < imgRect.width / 2 + 30) {
            const offset = imgCenter - sectionCenter;
            section.scrollLeft += offset; // Ajuste le scroll
        }
    };

    // Gestionnaire de scroll
    let isScrolling;

    section.addEventListener('scroll', () => {
        // Effacer tout temporisateur en cours
        window.clearTimeout(isScrolling);

        // Calculer une seule fois la sectionRect
        const sectionRect = section.getBoundingClientRect();

        // Parcours des images pour grandir celles proches du centre pendant le scroll
        images.forEach((img) => {
            const imgRect = img.getBoundingClientRect();
            const imgCenter = imgRect.left + imgRect.width / 2;
            const sectionCenter = sectionRect.left + sectionRect.width / 2;

            // Agrandir l'image si elle est proche du centre pendant le scroll
            if (Math.abs(imgCenter - sectionCenter) < imgRect.width / 2 + 30) {
                img.style.width = "250px";
            } else {
                img.style.width = "200px";

            }
        });

        // Marquer que le scroll est en cours
        isScrolling = true;
    });

    // Délai après le scroll pour détecter quand l'utilisateur a arrêté de faire défiler
    section.addEventListener('scroll', () => {
        // Quand le scroll est terminé, appliquer le centrage forcé
        clearTimeout(isScrolling);
        isScrolling = setTimeout(() => {
            const sectionRect = section.getBoundingClientRect();
            images.forEach((img) => {
                const imgRect = img.getBoundingClientRect();
                const imgCenter = imgRect.left + imgRect.width / 2;
                const sectionCenter = sectionRect.left + sectionRect.width / 2;

                // Si l'image est proche du centre, effectuer un centrage forcé
                if (Math.abs(imgCenter - sectionCenter) < imgRect.width / 2 + 30) {
                    centerImage(img, sectionRect);
                }
            });
        }, 150); // Délai après l'arrêt du scroll (ajuste selon tes besoins)
    });
}




///////////////////////////////

// Fonction pour supprimer une image
function supprimerImageCarrou(imgPath) {
    fetch('/delete-image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imagePath: imgPath }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur lors de la suppression de l\'image.');
        }
        return response.json();
    })
    .then(data => {
        // console.log(data.message); // Message de confirmation
        // Optionnel : rafraîchir la liste des images
        document.querySelector('#imgM').textContent=''
        afficherImageCarrou('imgMob'); // Recharger les images
    })
    .catch(error => {
        console.error('Erreur :', error);
    });
}







function downloadPhoto(el, errBalise, type) {
    const files = el.target.files;
    
    if (files.length > 0) {
        const file = files[0];

        // Vérifier si le fichier est une image
        if (file.type.startsWith("image/")) {
            // console.log("Fichier image sélectionné :", file.name);

            const reader = new FileReader();

            reader.onload = (e) => {
                // Préparer les données pour l'envoi au backend
                const formData = new FormData();
                formData.append("image", file);
                formData.append("description", type)
                // Envoyer les données avec fetch
                fetch('/download-image-carrou', {
                    method: 'POST',
                    body: formData,
                })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Erreur lors de l'envoi de l'image au backend");
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log("Réponse du backend :", data);
                    document.querySelector('#imgM').textContent=''
                    afficherImageCarrou('imgMob'); // Recharger les images
                    
                })
                .catch((error) => {
                    console.error("Erreur :", error);
                    if (errBalise === '#errMob') {
                        document.querySelector('#errMob').textContent = "Erreur lors de l'envoi de l'image.";
                    }
                    if (errBalise === '#errpc') {
                        document.querySelector('#errpc').textContent = "Erreur lors de l'envoi de l'image.";
                    }
                });
            };

            reader.readAsDataURL(file); // Facultatif : lire le fichier si nécessaire pour un prétraitement
        } else {
            // Gérer les erreurs si le fichier n'est pas une image
            if (errBalise === '#errMob') {
                document.querySelector('#errMob').textContent = "Le fichier sélectionné n'est pas une image.";
            }
            if (errBalise === '#errpc') {
                document.querySelector('#errpc').textContent = "Le fichier sélectionné n'est pas une image.";
            }
        }
    } else {
        // Gérer les erreurs si aucun fichier n'est sélectionné
        if (errBalise === '#errMob') {
            document.querySelector('#errMob').textContent = "Aucun fichier sélectionné.";
        }
        if (errBalise === '#errpc') {
            document.querySelector('#errpc').textContent = "Aucun fichier sélectionné.";
        }
    }
}



//////////////GESTION PROFILE////////////////////////////////

function appelContenuProfile(){
    console.log('je suis exécuté et je suis appelcontenuprofile' );
    fetch('/envoi-photo-profile')
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des données.');
        }
        return response.json(); // Parse la réponse en JSON
    })
    .then(data => {
        
        const cheminImgProfile = document.querySelector('#bulleProfileImg');
         // Nettoyer la chaîne pour éviter les caractères invisibles
        
        if(data.message == false){
            cheminImgProfile.style.backgroundImage = `url('logo/siteup.png')`
        }else{
            cheminImgProfile.style.backgroundImage = `url(/imgprofile/${data.source})`
        }
    })
    .catch(error => {
        console.error('Erreur :', error);
    });
}






///////////GESTION DU TEXTE/////////////////



function appelContenuTextProfile(){
    
    fetch('/envoi-text-profile')
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des données.');
        }
        return response.json(); // Parse la réponse en JSON
    })
    .then(data => {
        
        const pTextPresentation = document.querySelector('#text-presentation');
        pTextPresentation.textContent= data.textProfile
    })
    .catch(error => {
        console.error('Erreur :', error);
    });
};





function appelServices(){
    const contentServices = document.querySelector('#content-services');
    contentServices.textContent=""
    console.log('coucou je suis texte');
    fetch('/envoi-services')
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des données.');
        }
        return response.json(); // Parse la réponse en JSON
    })
    .then(datas => {
        
        // console.log('Données récupérées :', datas);
        const arrayServices = datas.textProfile // Traitez les données ici
        if(arrayServices.length === 0){
            const p = document.createElement('p')
            p.textContent= "Aucune préstation n'est proposé pour le moment"
            p.classList.add('err')
            const li = document.createElement('li')
            li.appendChild(p)
            contentServices.appendChild(li)
        }
        arrayServices.forEach(data =>{
            creatLiServices(data)
        })
        
    })
    .catch(error => {
        console.error('Erreur :', error);
    });
}

function creatLiServices(service){
    const contentServices = document.querySelector('#content-services');
    
    const li = document.createElement('li')
    const p = document.createElement('p')
    const div = document.createElement('div')
    contentServices.appendChild(li)
    p.textContent= service
    li.appendChild(p)
    li.appendChild(div)
    // Créer un élément SVG
    const svgNamespace = "http://www.w3.org/2000/svg";
    const svgElement = document.createElementNS(svgNamespace, "svg");
    svgElement.addEventListener('click', ()=>{
        editService(service)
    })

    // Définir les attributs de l'élément SVG
    svgElement.setAttribute("width", "40px");
    svgElement.setAttribute("height", "40px");
    svgElement.setAttribute("viewBox", "0 0 24 24");
    svgElement.setAttribute("fill", "none");

    // Ajouter le premier chemin (path)
    const pathElement = document.createElementNS(svgNamespace, "path");
    pathElement.setAttribute("fill-rule", "evenodd");
    pathElement.setAttribute("clip-rule", "evenodd");
    pathElement.setAttribute(
    "d",
    "M21.1213 2.70705C19.9497 1.53548 18.0503 1.53547 16.8787 2.70705L15.1989 4.38685L7.29289 12.2928C7.16473 12.421 7.07382 12.5816 7.02986 12.7574L6.02986 16.7574C5.94466 17.0982 6.04451 17.4587 6.29289 17.707C6.54127 17.9554 6.90176 18.0553 7.24254 17.9701L11.2425 16.9701C11.4184 16.9261 11.5789 16.8352 11.7071 16.707L19.5556 8.85857L21.2929 7.12126C22.4645 5.94969 22.4645 4.05019 21.2929 2.87862L21.1213 2.70705ZM18.2929 4.12126C18.6834 3.73074 19.3166 3.73074 19.7071 4.12126L19.8787 4.29283C20.2692 4.68336 20.2692 5.31653 19.8787 5.70705L18.8622 6.72357L17.3068 5.10738L18.2929 4.12126ZM15.8923 6.52185L17.4477 8.13804L10.4888 15.097L8.37437 15.6256L8.90296 13.5112L15.8923 6.52185ZM4 7.99994C4 7.44766 4.44772 6.99994 5 6.99994H10C10.5523 6.99994 11 6.55223 11 5.99994C11 5.44766 10.5523 4.99994 10 4.99994H5C3.34315 4.99994 2 6.34309 2 7.99994V18.9999C2 20.6568 3.34315 21.9999 5 21.9999H16C17.6569 21.9999 19 20.6568 19 18.9999V13.9999C19 13.4477 18.5523 12.9999 18 12.9999C17.4477 12.9999 17 13.4477 17 13.9999V18.9999C17 19.5522 16.5523 19.9999 16 19.9999H5C4.44772 19.9999 4 19.5522 4 18.9999V7.99994Z"
    );
    pathElement.setAttribute("fill", "#000000");

    // Ajouter le chemin au SVG
    svgElement.appendChild(pathElement);
    div.appendChild(svgElement)

    // Créer un nouvel élément SVG
    const svgNamespace2 = "http://www.w3.org/2000/svg";
    const svgElement2 = document.createElementNS(svgNamespace2, "svg");
    svgElement2.addEventListener('click', ()=>{
        suppService(service)
    })

    // Définir les attributs du nouvel élément SVG
    svgElement2.setAttribute("fill", "#c13434");
    svgElement2.setAttribute("width", "40px");
    svgElement2.setAttribute("height", "40px");
    svgElement2.setAttribute("viewBox", "-1.7 0 20.4 20.4");
    svgElement2.setAttribute("class", "cf-icon-svg");

    // Ajouter le chemin (path) au nouvel élément SVG
    const pathElement2 = document.createElementNS(svgNamespace2, "path");
    pathElement2.setAttribute(
    "d",
    "M16.417 10.283A7.917 7.917 0 1 1 8.5 2.366a7.916 7.916 0 0 1 7.917 7.917zm-6.804.01 3.032-3.033a.792.792 0 0 0-1.12-1.12L8.494 9.173 5.46 6.14a.792.792 0 0 0-1.12 1.12l3.034 3.033-3.033 3.033a.792.792 0 0 0 1.12 1.119l3.032-3.033 3.033 3.033a.792.792 0 0 0 1.12-1.12z"
    );

    // Ajouter le chemin au SVG
    svgElement2.appendChild(pathElement2);
    div.appendChild(svgElement2)
}

function editService(el){
    const readNewServices = document.querySelector('#read-new-services');
    suppService(el, true)
    readNewServices.value = el
    readNewServices.scrollIntoView({
        behavior: "smooth", // Animation fluide
        block: "center",     // Aligner le haut de l'élément avec le haut du conteneur
    });
}

function suppService(el, arg) {
    // console.log('Je vais supprimer : ' + el);

    if (el.length !== 0) {
        fetch(`/remove-service?service=${encodeURIComponent(el)}`, { // Passer la donnée dans l'URL
            method: 'DELETE', // Méthode HTTP DELETE
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de la suppression du service.');
            }
            return response.json(); // Extraction de la réponse JSON
        })
        .then(data => {
            if(arg){
                appelServices();
            }else{
                gestionErrValid('#messageService', data.message, data.erreur )
                appelServices();
            }
        })
        .catch(error => {
            console.error('Erreur :', error); // Gestion des erreurs
        });
    }
}










////////////////////////////////////////////////////////
// GESTION ILLUSTRATION ACCUEIL////////////////////
///////////////////////

function gestionErrValid(span, message,err){
    const conteneur = document.querySelector(span)
    conteneur.textContent= message
    err === true ? conteneur.classList.add('err') : conteneur.classList.add('valid')

    setTimeout(() => {
        conteneur.textContent=""
        conteneur.classList.remove('err', 'valid');
    }, 3000);
}

function getIllustration(){
    const llustrationImg = document.querySelector('#img-illustration')
    fetch('/getillustration')
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des données.');
        }
        return response.json(); // Parse la réponse en JSON
    })
    .then(data => {
            
            const timestamp = new Date().getTime();
            llustrationImg.src = `/imgaccueil/${data.src}?t=${timestamp}`;
    })
    .catch(error => {
        console.error('Erreur :', error);
    });
}



if (btnMenuBack) {
    // Vérifie si l'écouteur a déjà été attaché
    if (!btnMenuBack.hasAttribute('data-listener-attached')) {
        btnMenuBack.addEventListener('click', async () => {
            afficherImageCarrou('imgMob')
            if(document.querySelector('#returnC')){
                document.querySelector('#returnC').style.display ="none"
            }
            // Charger le HTML
            if (htmlBackCache.length === 0) {
                await cachePageBack(); // S'assurer que la requête est bien effectuée
            }
        
            let html = htmlBackCache[0];
            if (!html) {
                console.error("htmlBackCache est toujours vide après fetch.");
                return;
            }
        
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
        
            const mainContent = document.querySelector('#main-content');
            mainContent.textContent = ''; // Vider le contenu existant
        
            Array.from(doc.body.childNodes).forEach(node => {
                mainContent.appendChild(node);
            });
        
            const oldScript = document.querySelector('#backjs');
            // Charger le JavaScript après l'insertion du HTML
            
            if (oldScript) {
                oldScript.remove();
                console.log("Script supprimé !");
            }
            
            const newScript = document.createElement('script');
            newScript.id = 'backjs';
            newScript.src = `js/back.js?v=${new Date().getTime()}`; // 🔥 Ajoute un timestamp
            document.body.appendChild(newScript);
        
        
            // Activer les styles en dernier
            setTimeout(() => {
                const tabClass = document.querySelectorAll('.dynamic-css');
                tabClass.forEach(css => {
                    css.media = (css.id === 'cssback') ? 'all' : 'none';
                });
                
            }, 50); // Petit délai pour éviter un flash visuel
            activeEcouteur();
            document.querySelector('#scriptBackPage').src=""
        });

        // Marquer que l'écouteur a été ajouté
        btnMenuBack.setAttribute('data-listener-attached', 'true');
        
    } else {
        console.log("L'écouteur d'événement est déjà attaché.");
    }
}


activeEcouteur()


function activeEcouteur(){

    const downloadMob = document.querySelector('#downloadMobile');
const divImgProfile = document.querySelector('#bulleProdileImg');
const fileInputProfile = document.querySelector('#downloadProfile');


const buttonReadingPresentation = document.querySelector('#button-reading-presentation')

const buttonReadingServices = document.querySelector('#button-reading-services')

    downloadMob.addEventListener('change',(event)=>{
        downloadPhoto(event, '#errMob','mobile')
        console.log("yo");
    })


    fileInputProfile.addEventListener('change', (event) => {
        console.log("salut");
        const files = event.target.files;

    if (files.length > 0) {
        const file = files[0];

        // Vérifie si le fichier est une image
        if (file.type.startsWith("image/")) {
            // Filtrer le nom du fichier
            const originalName = file.name;
            const filteredName = originalName
                .toLowerCase() // Convertir en minuscules
                .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
                .replace(/[^a-z0-9.-]/g, ''); // Supprimer les caractères spéciaux sauf . et -

            // console.log('Nom du fichier filtré :', filteredName);

            // Créer une copie du fichier avec le nom filtré
            const filteredFile = new File([file], filteredName, { type: file.type });

            const formData = new FormData();
            formData.append('profileImage', filteredFile);

            // Envoyer l'image au backend
            fetch('/upload-profile-image', {
                method: 'POST',
                body: formData,
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur lors du téléchargement de l\'image.');
                }
                return response.json();
            })
            .then(data => {
                gestionErrValid('#messageImgProfile',data.message,data.erreur)
                appelContenuProfile();
            })
            .catch(error => {
                console.error('Erreur :', error);
            });
        } else {
            console.error('Le fichier sélectionné n\'est pas une image.');
        }
    } else {
        console.error('Aucun fichier sélectionné.');
    }
    });

    buttonReadingPresentation.addEventListener('click', () => {
        const readingPresentation = document.querySelector('#read-new-presentation')
        const newText = readingPresentation.value;
        
        if (newText.length !== 0) {
            fetch('/edit-text-profil', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: newText }),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur lors de la mise à jour du texte.');
                }
                return response.json();
            })
            .then(data => {
                readingPresentation.value = ''
                appelContenuTextProfile()
                gestionErrValid('#messageTextProfile',data.message,data.erreur)
            })
            .catch(error => {
                console.error('Erreur :', error);
            });
        }
    });


    const readNewServices = document.querySelector('#read-new-services');
    // Si l'écouteur n'est pas déjà attaché, on ajoute l'écouteur
    buttonReadingServices.addEventListener('click', () => {
        if (navigator.vibrate) {
            navigator.vibrate(20); // Fait vibrer le téléphone pendant 200ms
        } else {
            // console.log("La vibration n'est pas supportée par ce navigateur.");
        }
        if (readNewServices.value.length !== 0) {
            const newService = readNewServices.value;
            fetch('/creat-prestation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ service: newService }),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur lors de la mise à jour du texte.');
                }
                return response.json();
            })
            .then(data => {

                // console.log('Texte mis à jour avec succès :'+ data);
                readNewServices.value= ""
                gestionErrValid('#messageService', data.message, data.erreur )
                appelServices();
            })
            .catch(error => {
                console.error('Erreur :', error);
            });
        }
    });


    
    document.querySelector('#downloadIllustration').addEventListener('change', (event) => {
        const files = event.target.files;

        if (files.length > 0) {
            const file = files[0];
    
            // Vérifie si le fichier est une image
            if (file.type.startsWith("image/")) {
                // Filtrer le nom du fichier
                const originalName = file.name;
                const filteredName = originalName
                    .toLowerCase() // Convertir en minuscules
                    .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
                    .replace(/[^a-z0-9.-]/g, ''); // Supprimer les caractères spéciaux sauf . et -
    
    
                // Créer une copie du fichier avec le nom filtré
                const filteredFile = new File([file], filteredName, { type: file.type });
    
                const formData = new FormData();
                formData.append('illustration', filteredFile);
    
                // Envoyer l'image au backend
                fetch('/changeillustration', {
                    method: 'POST',
                    body: formData,
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erreur lors du téléchargement de l\'image.');
                    }
                    return response.json();
                })
                .then(data => {
                    gestionErrValid('#messageIllustration', data.message, data.erreur )
                    getIllustration()
                    document.querySelector('#img-illustration').remove()
                    const img = document.createElement('img')
                    img.id = "img-illustration"
                    img.src = "/imgaccueil/illustration.png"
                    img.alt = "illustration de l'image d'accueil"
                    document.querySelector('#content-illustration-img').appendChild(img)
                })
                .catch(error => {
                    console.error('Erreur :', error);
                });
            } else {
                console.error('Le fichier sélectionné n\'est pas une image.');
            }
        } else {
            console.error('Aucun fichier sélectionné.');
        }
    });

}