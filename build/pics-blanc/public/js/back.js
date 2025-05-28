// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// ::::::::::GESTION DU MENU ET INITIALISATION DU CONTENU///////////////////////////////
// ////////////////////////////////////////////////////////////////////////////////////

(() => {
    function moveOrRemoveNavback() {
        const navback = document.getElementById('navback');

        if (navback) {
            // Vérifie s'il existe déjà un navback dans body
            const existingNavbackInBody = Array.from(document.body.children).find(
                (el) => el.id === 'navback'
            );

            if (existingNavbackInBody && existingNavbackInBody !== navback) {
                // S'il existe déjà un #navback dans body différent de celui détecté, on SUPPRIME le nouveau
                navback.remove();
            } else if (navback.parentNode !== document.body) {
                // Sinon, si le navback est ailleurs, on le déplace
                document.body.appendChild(navback);
            }
        }
    }

    // Vérifie immédiatement au cas où
    moveOrRemoveNavback();

    // Observe ensuite les ajouts dans le DOM
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === 1) {
                    if (node.id === 'navback') {
                        moveOrRemoveNavback();
                    } else {
                        const found = node.querySelector('#navback');
                        if (found) {
                            moveOrRemoveNavback();
                        }
                    }
                }
            }
        }
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
})();




function backnavadd(){
    if(!document.querySelector('#navbackcontentButton')){
        const div = document.createElement('div')
    div.id='navbackcontentButton'

    const svg = document.createElement('img')
    svg.alt = "logo du menu"
    svg.src = "/icon/menuback.svg"

    div.appendChild(svg)
    document.body.appendChild(div)

    div.addEventListener('click',()=>{
        document.getElementById('navback').classList.toggle('hide')
        document.getElementById('navback').classList.toggle('show')
    })
    }
    
}
backnavadd()

async function cachePageBack(){
    try {
        console.log("🟢 Début de cachePageBack()");
        
        const result = await fetch('/admin',{
            credentials: 'include'
        });
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
        const response = await fetch('logout',{
            credentials: 'include'
        })
        if(!response.ok){
            throw new Error(`HTTP error! status: ${response.status}`);
        }else{
            unlock.style.display = "none"
            lock.style.display = 'flex'
            // Sélectionner l'élément par son ID
            const elementjs = document.getElementById('backjs');
            const elementcss = document.querySelector('#cssback')

            
            document.querySelector('#admin').removeEventListener('click', logout);

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


document.querySelector('#deconnexion').addEventListener('click',logout)


function navBack(page) {

    if(document.querySelector('.corbeil')){
        document.querySelector('.corbeil').remove()
        document.querySelector('.annuler').remove()
        document.querySelector('.all').remove()
    }

    if(document.querySelector('.overlayBackImg')){
        document.querySelector('.overlayBackImg').remove()
        const tab = document.querySelectorAll('.overlayBackImg')

        tab.forEach(tb =>{
            tb.remove()
        })
    }

    document.getElementById('navback').classList.toggle('hide')
    document.getElementById('navback').classList.toggle('show')
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


// if(!document.querySelector('#navback')){
//     // Créer un observer qui détecte les changements dans le DOM
// window.observer =  window.observer || new MutationObserver((mutationsList, observer) => {
//     for (const mutation of mutationsList) {
//         if (mutation.type === 'childList') {
//             // Vérifier si #navback a été ajouté au DOM
//             const nav = document.getElementById('navback');
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
// window.config = window.config || { childList: true, subtree: true };
// observer.observe(document.body, window.config);
// }


window.btnMenuBack= window.btnMenuBack || document.querySelector('#admin')
window.htmlBackCache = window.htmlBackCache || []






































///////////////////////////////////////////////////////////////////
////////MODIF HEADER ET FOOTER////////////////////////////////////
/////////////////////////////////////////////////////////////////


const h = document.querySelector('#grandtitre')
h.style.position="relative";

if(!document.querySelector('.modifh1')){
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
            credentials: 'include',
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



}



const sign = document.querySelector('#signature')
sign.style.position="relative";

if (!document.querySelector('.modifsign')) {
    
const modifsign= document.createElement('div')
modifsign.classList.add('modifsign')
const bksign = document.createElement('div')
bksign.classList.add('background')
const svgsign = document.createElement('img');
svgsign.src='/icon/edit.svg'
svgsign.classList.add('svgsign')

bksign.appendChild(svgsign)
modifsign.appendChild(bksign)
sign.appendChild(modifsign)



document.querySelector('.modifsign').addEventListener('click',()=>{
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
            credentials: 'include',
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



}



function globalback(data){
    fetch('/globale',{
        credentials: 'include',
    })
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



// 



})()
