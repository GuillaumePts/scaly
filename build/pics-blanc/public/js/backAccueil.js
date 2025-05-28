
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
            functions: [getIllustration, fetchVideoSrc]
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


    fetch('/get-imgaccueil')
    .then(response => response.json())
    .then(data => {
        if (data.success) {

            document.querySelector('#img-illustration').style.src = `/imgaccueil/${data.files[0]}`
        } else {
            console.error('Erreur lors de la récupération des images:', data.message);
        }
    })
    .catch(error => {
        console.error('Erreur réseau ou serveur:', error);
    });


// afficher les images présente
function afficherImageCarrou(dossier){

    document.querySelector('#imgM').textContent=""

    fetch(`/imagecarrou?folder=${dossier}`,{
        credentials: 'include',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des images.');
        }
        return response.json();
    })
    .then(data => {
        
        if(dossier === 'imgMob'){
            const conteneur = document.querySelector('#imgM')
            const div = document.createElement('div')
            div.classList.add('conteneurdesimages')
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
    load()
    fetch('/delete-image-carrou', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ imagePath: imgPath }),
    })
    .then(response => {
        if (!response.ok) {
            finload()
            throw new Error('Erreur lors de la suppression de l\'image.');
            
        }
        
        return response.json();
    })
    .then(data => {
        finload()
        afficherImageCarrou('imgMob'); // Recharger les images
        
    })
    .catch(error => {
        console.error('Erreur :', error);
        finload()
    });
}







function downloadPhoto(el, errBalise, type) {
    load()
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
                    credentials: 'include',
                })
                .then((response) => {
                    if (!response.ok) {
                        // finload()
                        throw new Error("Erreur lors de l'envoi de l'image au backend");
                    }
                    // finload()
                    return response.json();
                    
                })
                .then((data) => {
                    finload()
                    afficherImageCarrou('imgMob'); // Recharger les images
                    console.log(data);
                })
                .catch((error) => {
                    console.error("Erreur :", error);
                    if (errBalise === '#errMob') {
                        document.querySelector('#errMob').textContent = "Erreur lors de l'envoi de l'image.";
                    }
                });
            };

            reader.readAsDataURL(file); // Facultatif : lire le fichier si nécessaire pour un prétraitement
        } else {
            // finload()
            // Gérer les erreurs si le fichier n'est pas une image
            if (errBalise === '#errMob') {
                document.querySelector('#errMob').textContent = "Le fichier sélectionné n'est pas une image.";
            }
            
        }
    } else {
        // finload()
        // Gérer les erreurs si aucun fichier n'est sélectionné
        if (errBalise === '#errMob') {
            document.querySelector('#errMob').textContent = "Aucun fichier sélectionné.";
        }
        
    }
}



//////////////GESTION PROFILE////////////////////////////////

function appelContenuProfile(){
    
    fetch('/envoi-photo-profile',{
        credentials: 'include',
    })
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
    
    fetch('/envoi-text-profile',{
        credentials: 'include',
    })
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
    
    fetch('/envoi-services',{
        credentials: 'include',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des données.');
        }
        return response.json(); // Parse la réponse en JSON
    })
    .then(datas => {
        
        

        const arrayServices = datas.textProfile // Traitez les données ici
        if(arrayServices.length === 0){
            const p = document.createElement('p')
            p.textContent= "Aucune préstation n'est proposé pour le moment"
            p.classList.add('err')
            const li = document.createElement('li')
            li.appendChild(p)
            contentServices.appendChild(li)
        }else{

            const contentCard = document.createElement('div')
                contentCard.style.width = '100%'
                contentCard.style.position= "relative"
                contentCard.style.display = "flex"
                contentCard.style.justifyContent = "center"
                contentCard.style.alignItems= "center"
                contentCard.style.flexWrap = "wrap"
                contentCard.style.gap = "50px"

            arrayServices.forEach(prestation => {
                const nom = prestation.nom;
                const prix = prestation.prix;
                const description = prestation.des;
                const image = prestation.img;
                const id = prestation.id
            

                



                const card = document.createElement('div')
                card.classList.add('prstCard')
                card.style.marginTop = "60px"
                card.style.cursor = "pointer"
                card.id = id;

                

                // Bouton "Modifier Titre"

                const buttonTitre = document.createElement("button");
                buttonTitre.classList.add('deleteCardPortfolio')
                buttonTitre.style.zIndex = "20"
                buttonTitre.style.border = "none"
                buttonTitre.textContent = "Supprimer";

                buttonTitre.addEventListener('click', (e) => {
                    e.stopPropagation()
                     // tu as cette variable dispo
                
                    fetch('/delete-service', {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include',
                        body: JSON.stringify({ id: card.id })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            // supprime la card du DOM si tu veux ici
                            appelServices()
                        } else {
                            document.querySelector('.err').textContent = data.message || "Erreur inconnue";
                        }
                    })
                    .catch(err => {
                        document.querySelector('.err').textContent = "Erreur serveur";
                        console.error(err);
                    });
                });
                

                card.appendChild(buttonTitre)


                card.addEventListener('click',()=>{
                    document.querySelector('#titreh3service').textContent = "Modifier une prestations"
                    document.querySelector('#titreinput').value = nom
                    document.querySelector('#prixinput').value = prix
                    document.querySelector('#descinput').value = description

                    

                    document.querySelector('#titreservice').textContent = nom;
                    document.querySelector('#prixservice').textContent = prix;
                    document.querySelector('#descservice').textContent = description;

                    document.querySelector('#imgdelanewcard').src = image

                    document.querySelector('#buttonaddservice').style.display="none"
                    document.querySelector('#buttonputservice').style.display="flex"
                    document.querySelector('#removebuttonputservice').style.display="flex"

                    putService(card.id)

                    document.querySelector('#removebuttonputservice').addEventListener('click',()=>{

                    document.querySelector('#titreh3service').textContent = "Ajouter une prestations"
                    document.querySelector('#titreinput').value = ''
                    document.querySelector('#prixinput').value = ''
                    document.querySelector('#descinput').value = ''

                    document.querySelector('#titreservice').textContent = '';
                    document.querySelector('#prixservice').textContent = '';
                    document.querySelector('#descservice').textContent = '';
                    document.querySelector('#imgdelanewcard').src = ''

                    document.querySelector('#buttonaddservice').style.display="flex"
                    document.querySelector('#buttonputservice').style.display="none"
                    document.querySelector('#removebuttonputservice').style.display="none"

                    })

                    document.querySelector('#newCardForm').scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                })

                
                
                
                


                // Insertion dans le parent
                
    
    
                const div = document.createElement('div')
                div.classList.add('prstContentimg')
    
    
                const divimg = document.createElement('div')
                divimg.classList.add('prstdivimg') 
    
                const img = document.createElement('img')
                img.src = image;
                img.alt = "illustration de la prestations"
                img.classList.add('prstImg')
                img.style.cursor = "pointer"
    
    
                const svgNS = "http://www.w3.org/2000/svg";
    
    // Création du conteneur SVG
                const svg = document.createElementNS(svgNS, "svg");
                svg.setAttribute("viewBox", "0 0 960 541");
    
                svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
                svg.setAttribute("style", "shape-rendering: geometricPrecision;");
                svg.setAttribute("preserveAspectRatio", "none");
                svg.classList.add("prstSvg");
    
                // Création du path
                const path = document.createElementNS(svgNS, "path");
                path.setAttribute("d", "M0 490L32 463.7C64 437.3 128 384.7 192 369.2C256 353.7 320 375.3 384 399.2C448 423 512 449 576 439.3C640 429.7 704 384.3 768 376.3C832 368.3 896 397.7 928 412.3L960 427L960 541L928 541C896 541 832 541 768 541C704 541 640 541 576 541C512 541 448 541 384 541C320 541 256 541 192 541C128 541 64 541 32 541L0 541Z");
                path.setAttribute("fill", "#FFFFFF");
    
                // Ajout du path dans le svg
                svg.appendChild(path);
    
                const content = document.createElement('div')
                content.classList.add('prstContent')

                
    
                const profile = document.createElement('div')
                profile.classList.add('prstProfile')
    
                const titre = document.createElement('h2')
                titre.textContent = nom;
                titre.classList.add('prstTitre')
    
                const price = document.createElement('p')
                price.textContent = prix;
                price.classList.add('prstPrice')
    
                const desc = document.createElement('p')
                desc.textContent = description;
                desc.classList.add('prstDesc')
    
    
                content.appendChild(svg)
                content.appendChild(profile)
                content.appendChild(titre)
                content.appendChild(price)
                content.appendChild(desc)
    
    
                divimg.appendChild(img)
    
                div.appendChild(divimg)
    
                
                card.appendChild(div)
                card.appendChild(content)

    
                contentCard.appendChild(card)
                document.querySelector('#content-services').appendChild(contentCard)
                // Tu peux ici les utiliser comme tu veux (les injecter dans le DOM, etc.)
            });

            
    
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        
                        currentVisibleCard = entry.target;
                        
                    } else {
    
                        if (currentVisibleCard === entry.target) {
                            currentVisibleCard = null;
                        }
                    }
                });
            }, { threshold: 0.8 });
    
            document.querySelectorAll('.prstCard').forEach(card => observer.observe(card));
    
            let currentVisibleCard = null;
    
            let ticking = false;
    
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (currentVisibleCard) {
                    const img = currentVisibleCard.querySelector('.prstImg');
                    const rect = currentVisibleCard.getBoundingClientRect();
    
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        // Décalage selon position dans la vue, pour effet de scroll fluide
                        const scrollRatio = 1 - (rect.top / window.innerHeight); // de 0 à 1
                        const maxOffset = 70; // px max de décalage
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
        
        document.querySelector('#addNewImg').addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;
        
            const reader = new FileReader();
        
            reader.onload = function(e) {
                document.querySelector('#imgdelanewcard').src = e.target.result;
            };
        
            reader.readAsDataURL(file);
        });



        document.querySelector('#titreinput').addEventListener('input',()=>{
            document.querySelector('#titreservice').textContent = document.querySelector('#titreinput').value
        })

        document.querySelector('#prixinput').addEventListener('input',()=>{
            document.querySelector('#prixservice').textContent = document.querySelector('#prixinput').value
        })

        document.querySelector('#descinput').addEventListener('input',()=>{
            document.querySelector('#descservice').textContent = document.querySelector('#descinput').value
        })


        document.querySelector('#buttonaddservice').addEventListener('click', async (e) => {
            e.preventDefault();
            const titre = document.querySelector('#titreinput').value.trim();
            const prix = document.querySelector('#prixinput').value.trim();
            const desc = document.querySelector('#descinput').value.trim();
            const imgFile = document.querySelector('#addNewImg').files[0];
            const errEl = document.querySelector('#errService');

            if (!titre || !prix || !desc || !imgFile) {
                finload()
                errEl.textContent = 'Tous les champs sont obligatoires, n\'oubliez pas l\'image.';
                return;
            }

            load();

            const formData = new FormData();
            formData.append('titre', titre);
            formData.append('prix', prix);
            formData.append('desc', desc);
            formData.append('img', imgFile);

            fetch('/add-prestation', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    errEl.textContent = data.error;
                }else {
                    // ou tu peux juste ajouter dynamiquement la carte
                    document.querySelector('#addNewImg').value = ''; // reset input file
                    document.querySelector('#titreinput').value = '';
                    document.querySelector('#prixinput').value = '';
                    document.querySelector('#descinput').value = '';
                    document.querySelector('#titreservice').textContent = '';
                    document.querySelector('#prixservice').textContent = '';
                    document.querySelector('#descservice').textContent = '';
                    document.querySelector('#imgdelanewcard').src = ''
                    errEl.value =  ''
                
                       appelServices()
                       finload()
                       document.querySelector('#content-services').scrollIntoView({
                           behavior: 'smooth',
                           block: 'start'
                       });
                       
                       
                         
                }
            })
            .catch(err => {
                console.error(err);
                errEl.textContent = "Une erreur est survenue.";
            });
                });


    })
    .catch(error => {
        console.error('Erreur :', error);
    });
}





function putService(id) {
    const buttonPut = document.querySelector('#buttonputservice');

    // Supprimer tout ancien listener en clonant le bouton
    const resetButtonPutService = () => {
        const newButton = buttonPut.cloneNode(true);
        buttonPut.parentNode.replaceChild(newButton, buttonPut);
        return newButton;
    };

    const currentPutBtn = resetButtonPutService();

    currentPutBtn.addEventListener('click', () => {
        load();

        const lid = id;
        const titre = document.querySelector('#titreinput').value.trim();
        const prixx = document.querySelector('#prixinput').value.trim();
        const desc = document.querySelector('#descinput').value.trim();
        const imgFile = document.querySelector('#addNewImg').files[0]; // Nouvelle image
        const errEl = document.querySelector('#errService');

        // Vérifier que les champs texte sont remplis
        if (!titre || !prixx || !desc) {
            errEl.textContent = "Tous les champs doivent être remplis !";
            console.log(titre);
            console.log(prixx);
            console.log(desc);
            return;
        }

        // Créer le FormData
        const formData = new FormData();
        formData.append("id", lid);
        formData.append("nom", titre);
        formData.append("prix", prixx);
        formData.append("des", desc);

        // Ajouter l'image si une nouvelle a été sélectionnée
        if (imgFile) {
            formData.append("img", imgFile);
        }

        console.log(formData);
        // Envoi des données au serveur
        fetch('/update-service', {
            method: 'POST',
            body: formData,
            credentials: 'include',
        })
        .then(res => res.json())
        .then(data => {
            finload();
            if (data.success) {
                const contentServices = document.querySelector('#content-services');
                contentServices.textContent = "";
                appelServices();

                document.querySelector('#newCardForm').scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Reset du formulaire
                document.querySelector('#titreh3service').textContent = "Ajouter une prestation";
                document.querySelector('#titreinput').value = '';
                document.querySelector('#prixinput').value = '';
                document.querySelector('#descinput').value = '';
                document.querySelector('#titreservice').textContent = '';
                document.querySelector('#prixservice').textContent = '';
                document.querySelector('#descservice').textContent = '';
                document.querySelector('#imgdelanewcard').src = '';
                document.querySelector('#buttonaddservice').style.display = "flex";
                document.querySelector('#buttonputservice').style.display = "none";
                document.querySelector('#removebuttonputservice').style.display = "none";

                errEl.textContent = '';
            } else {
                errEl.textContent = data.message || "Erreur inconnue";
            }
        })
        .catch(err => {
            finload();
            console.error(err);
            errEl.textContent = "Erreur serveur";
        });
    });
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
    fetch('/getillustration',{
        credentials: 'include',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des données.');
        }
        return response.json(); // Parse la réponse en JSON
    })
    .then(data => {
            
            const timestamp = new Date().getTime();
            llustrationImg.src = `/imgaccueil/${data.src}`;
    })
    .catch(error => {
        console.error('Erreur :', error);
    });
}



 // Appelle cette fonction au chargement ou quand tu veux mettre à jour



// if (document.querySelector('#unlock')) {
//     // Vérifie si l'écouteur a déjà été attaché
//     if (!document.querySelector('#unlock').hasAttribute('data-listener-attached')) {
//         document.querySelector('#unlock').addEventListener('click', async () => {
//             document.querySelector('#charging').style.opacity = "1"
//             document.querySelector('#charging').style.display = "flex"
//             afficherImageCarrou('imgMob')
//             if(document.querySelector('#returnC')){
//                 document.querySelector('#returnC').style.display ="none"
//             }
//             // Charger le HTML
//             if (htmlBackCache.length === 0) {
//                 await cachePageBack(); // S'assurer que la requête est bien effectuée
//             }
        
//             let html = htmlBackCache[0];
//             if (!html) {
//                 console.error("htmlBackCache est toujours vide après fetch.");
//                 return;
//             }
        
//             const parser = new DOMParser();
//             const doc = parser.parseFromString(html, 'text/html');
        
//             const mainContent = document.querySelector('#main-content');
//             mainContent.textContent = ''; // Vider le contenu existant
        
//             Array.from(doc.body.childNodes).forEach(node => {
//                 mainContent.appendChild(node);
//             });
        
//             const oldScript = document.querySelector('#backjs');
//             // Charger le JavaScript après l'insertion du HTML
            
//             if (oldScript) {
//                 oldScript.remove();
//                 console.log("Script supprimé !");
//             }
            
//             const newScript = document.createElement('script');
//             newScript.id = 'backjs';
//             newScript.src = `js/back.js?v=${new Date().getTime()}`; // 🔥 Ajoute un timestamp
//             document.body.appendChild(newScript);
        
        
//             // Activer les styles en dernier
//             setTimeout(() => {
//                 const tabClass = document.querySelectorAll('.dynamic-css');
//                 tabClass.forEach(css => {
//                     css.media = (css.id === 'cssback') ? 'all' : 'none';
//                 });
                
//             }, 50); // Petit délai pour éviter un flash visuel
//             activeEcouteur();
//             document.querySelector('#scriptBackPage').src=""
//             setTimeout(() => {
//                 document.querySelector('#charging').style.opacity = "0"
//                 document.querySelector('#charging').style.display = "none"
//             }, 1500);
//         });

//         // Marquer que l'écouteur a été ajouté
//         document.querySelector('#unlock').setAttribute('data-listener-attached', 'true');
        
//     } else {
//         console.log("L'écouteur d'événement est déjà attaché.");
//     }
// }


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


    document.querySelector('#downloadProfile').addEventListener('change', (event) => {
        load()
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
                credentials: 'include',
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur lors du téléchargement de l\'image.');
                }
                return response.json();
            })
            .then(data => {
                finload()
                appelContenuProfile();
            })
            .catch(error => {
                console.error('Erreur :', error);
                finload()
            });
        } else {
            console.error('Le fichier sélectionné n\'est pas une image.');
        }
    } else {
        console.error('Aucun fichier sélectionné.');
    }
    });

    buttonReadingPresentation.addEventListener('click', () => {
        load()
        const readingPresentation = document.querySelector('#read-new-presentation')
        const newText = readingPresentation.value;
        
        if (newText.length !== 0) {
            fetch('/edit-text-profil', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ text: newText }),
            })
            .then(response => {
                if (!response.ok) {
                    finload()
                    throw new Error('Erreur lors de la mise à jour du texte.');
                }
                
                return response.json();
            })
            .then(data => {
                finload()
                readingPresentation.value = ''
                appelContenuTextProfile()
                gestionErrValid('#messageTextProfile',data.message,data.erreur)
            })
            .catch(error => {
                finload()
                console.error('Erreur :', error);
            });
        }
    });


    



    
    document.querySelector('#downloadIllustration').addEventListener('change', (event) => {
        load()
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
                    credentials: 'include',
                })
                .then(response => {
                    
                    if (!response.ok) {
                        finload()
                        throw new Error('Erreur lors du téléchargement de l\'image.');
                        
                    }
                    return response.json();
                })
                .then(data => {
                    finload()
                    gestionErrValid('#messageIllustration', data.message, data.erreur )
                    getIllustration()
                    
                })
                .catch(error => {
                    
                    console.error('Erreur :', error);
                });
            } else {
                console.error('Le fichier sélectionné n\'est pas une image.');
                finload()
            }
        } else {
            console.error('Aucun fichier sélectionné.');
            finload()
        }
    });


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
    

}