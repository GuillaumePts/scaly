// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// ::::::::::GESTION DU MENU ET INITIALISATION DU CONTENU///////////////////////////////
// ////////////////////////////////////////////////////////////////////////////////////

async function cachePageBack(){
    try {
        console.log("🟢 Début de cachePageBack()");
        
        const result = await fetch('/admin');
        if (!result.ok) {
            throw new Error(`Erreur HTTP : ${result.status}`);
        }

        const data = await result.json();

        if (data.html) {
            htmlBackCache.push(data.html);
        } else {
            console.error("🔴 Donnée HTML absente de la réponse.");
        }
    } catch (error) {
        console.error("🔴 Erreur dans cachePageBack :", error);
    }
}

async function logout(){
    try {
        const response = await fetch('logout')
        if(!response.ok){
            throw new Error(`HTTP error! status: ${response.status}`);
        }else{
            unlock.style.display = "none"
            lock.style.display = 'flex'
            // Sélectionner l'élément par son ID
            const elementjs = document.getElementById('backjs');
            const elementcss = document.querySelector('#cssback')
            document.querySelector('.contentticket').remove()

            // Vérifier si l'élément existe pour éviter les erreurs
            if (elementjs) {
                elementjs.remove(); // Supprime l'élément du DOM
            } else {
                // console.log('L\'élément avec cet ID n\'existe pas.');
            }
            if (elementcss) {
                elementcss.remove(); // Supprime l'élément du DOM
            } else {
                // console.log('L\'élément avec cet ID n\'existe pas.');
            }

            location.reload();

        }
    } catch (error) {
        console.log(error);
    }
}

function navBack(page) {
    const scrollcontenu = document.querySelector('#contenu')
    const backAccueil = document.querySelector('#backAccueil');
    const backContact = document.querySelector('#backContact');
    const backPortfolio = document.querySelector('#backPortfolio');
    const backTicket = document.querySelector('#backTicket')
    const scriptBackPage = document.querySelector('#scriptBackPage')

    scrollcontenu.scrollIntoView({
        behavior: 'smooth', // Défilement fluide
        block: 'start',     // Aligne l'élément au début de la vue
    });

    const pagesConfig = {
        accueil: {
            show: backAccueil,
            hide: [backContact, backPortfolio,backTicket]
        },
        contact: {
            show: backContact,
            hide: [backAccueil, backPortfolio,backTicket]
        },
        portfolio: {
            show: backPortfolio,
            hide: [backAccueil, backContact,backTicket]
        },
        ticket:{
            show: backTicket,
            hide : [backAccueil,backContact, backPortfolio]
        }
    };
    
    // Si la page existe dans la configuration
    if (pagesConfig[page]) {
        const { show, hide } = pagesConfig[page];
        
        // Affiche la page correspondante
        show.classList.remove('dnone');
        show.classList.add('dflex');
        const nomJs = show.id
        reloadScript(scriptBackPage, `js/${nomJs}.js`)

        scriptBackPage.onload = function() {
            // console.log('Le script a été chargé et exécuté');
            // Vous pouvez maintenant exécuter des fonctions définies dans le script ou faire d'autres actions.
        };

        if(show == backPortfolio){
            document.querySelector('#parentportfolio').classList.add('gradient')
        }else{
            document.querySelector('#parentportfolio').classList.remove('gradient')
        }
        
        // Cache les autres pages
        hide.forEach(element => {
            element.classList.remove('dflex');
            element.classList.add('dnone');
        });
    } else {
        // Cas par défaut si aucune correspondance trouvée
        backAccueil.classList.remove('dnone');
        backAccueil.classList.add('dflex');
        backContact.classList.add('dnone');
        backContact.classList.remove('dflex');
        backPortfolio.classList.add('dnone');
        backPortfolio.classList.remove('dflex');
    }
    
}

function reloadScript(scriptElement, src) {
    // Supprimer le script actuel du DOM
    scriptElement.remove();

    // Créer un nouvel élément script
    const newScript = document.createElement('script');
    newScript.id = 'scriptBackPage'
    newScript.src = src

    document.body.appendChild(newScript);
}


(()=>{
    

cachePageBack()

if(!document.querySelector('#navback')){
    // Créer un observer qui détecte les changements dans le DOM
window.observer =  window.observer || new MutationObserver((mutationsList, observer) => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            // Vérifier si #navback a été ajouté au DOM
            const nav = document.getElementById('navback');
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
window.config = window.config || { childList: true, subtree: true };
observer.observe(document.body, window.config);
}


window.btnMenuBack= window.btnMenuBack || document.querySelector('#admin')
window.htmlBackCache = window.htmlBackCache || []










document.querySelector('.contentticket').addEventListener('click',()=>{
    navBack('ticket')
})


























///////////////////////////////////////////////////////////////////
////////MODIF HEADER ET FOOTER////////////////////////////////////
/////////////////////////////////////////////////////////////////


const h = document.querySelector('#grandtitre')
h.style.position="relative";

const modifh = document.createElement('div')
modifh.classList.add('modifh1')
const bkh1 = document.createElement('div')
bkh1.classList.add('background')
const svgh1 = document.createElement('img');
svgh1.src='/icon/edit.svg'
svgh1.classList.add('svgh1')




bkh1.appendChild(svgh1)
modifh.appendChild(bkh1)
h.appendChild(modifh)


document.querySelector('.modifh1').addEventListener('click',()=>{
    
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
    h2.textContent = `Modifier le titre : ${h.textContent} `;
    h2.classList.add('h2-subfolder')

    const input = document.createElement('input');
    input.classList.add('input-subfolder')
    input.value = h.textContent;

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
        const newS = input.value;


        fetch('/edit-h1', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({newS }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                
                overlay.remove()
                globalback(data)
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

    document.body.appendChild(overlay)
})



const sign = document.querySelector('#signature')
sign.style.position="relative";

const modifsign= document.createElement('div')
modifsign.classList.add('modifsign')
const bksign = document.createElement('div')
bksign.classList.add('background')
const svgsign = document.createElement('img');
svgsign.src='/icon/edit.svg'
svgsign.classList.add('svgsign')

modifsign.addEventListener('click',()=>{
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
    h2.textContent = `Modifier la signature : ${sign.textContent} `;
    h2.classList.add('h2-subfolder')

    const input = document.createElement('input');
    input.classList.add('input-subfolder')
    input.value = sign.textContent;

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
        const newS = input.value;


        fetch('/edit-signature', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({newS }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                
                overlay.remove()
                globalback(data)
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

})

bksign.appendChild(svgsign)
modifsign.appendChild(bksign)
sign.appendChild(modifsign)


function globalback(data){
    fetch('/globale')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erreur lors de la récupération des contacts');
                    }
                    return response.json();
                })
                .then(data => {
                    
                    const titreh1 = document.querySelector('h1')
                    const signature  = document.querySelector('#signature')
                    
                    
                    

                    
                    // Vérifier s'il y a un premier nœud de texte
                    if (titreh1.firstChild && titreh1.firstChild.nodeType === Node.TEXT_NODE) {
                        titreh1.firstChild.nodeValue = data.titre;
                    } else {
                        titreh1.insertBefore(document.createTextNode(data.titre), titreh1.firstChild);
                    }

                    // Vérifier s'il y a un premier nœud de texte
                    if (signature.firstChild && signature.firstChild.nodeType === Node.TEXT_NODE) {
                        signature.firstChild.nodeValue = data.signature;
                    } else {
                        signature.insertBefore(document.createTextNode(data.signature), signature.firstChild);
                    }
                    
                })
                .catch(error => {
                    console.error('Erreur:', error);
                });
}



})()
