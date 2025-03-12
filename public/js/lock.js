



///////////////////////////////////////////////////////
// FORMULAIRE DE CONNEXION ///////////////////////////
/////////////////////////////////////////////////////


(()=>{
    const lebutton = document.querySelector('#submit-button');
const inputpass = document.querySelector('#password');
const inputid = document.querySelector('#id');
const lock = document.querySelector('#divlock');
const unlock = document.querySelector('#unlock')

lebutton.addEventListener('click', (event)=>{
    event.preventDefault();

    if(inputpass.value && inputid.value){

        inputid.style.border="none"
        inputpass.style.border="none"
        inputid.style.color="#000"
        inputpass.style.color="#000"
        const data = {
            pass : inputpass.value,
            id : inputid.value
        }
        const url = '/connexion'
        
        postData(url, data);
    }else{
        inputid.style.color = "red";
        inputid.style.border="3px solid red"
        inputpass.style.color = "red";
        inputpass.style.border="3px solid red"
    }
})

document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Empêche le rechargement de la page par défaut

        if (inputpass.value && inputid.value) {
            const data = {
                pass: inputpass.value,
                id: inputid.value
            };
            const url = '/connexion';
            
            postData(url, data);
        } else {
            alert('je peux pas envoyer');
        }
    }
});

// Fonction pour envoyer des données via POST
async function postData(url, data) {
    try {
        const response = await fetch(url, {
            method: 'POST', // Méthode HTTP
            headers: {
                'Content-Type': 'application/json' // Indique que le corps de la requête est en JSON
            },
            body: JSON.stringify(data) // Conversion des données en chaîne JSON
        });

        if (!response.ok) {
            
            resOverlay('L\'identifiant ou la clé fournie est invalide',true)
            
            
        }

        const result = await response.json(); // Analyse de la réponse
        unlock.style.display = "flex"
        lock.style.display = 'none'
        
        
        
        if(result.html){
            if(result.session === "admin"){
                unlock.style.display = "flex"
                lock.style.display = 'none'
                creatJsEtCssBack()
                goBack(result.html)
            }
            if (result.session === "client") {
                unlock.style.display = "flex"
                lock.style.display = 'none'
                goClient(result.html)
            }
        }else{
        
            resOverlay(result.message,true)
        }

    } catch (error) {
        
        
    }
}



function creatJsEtCssBack(){
    const js = document.createElement('script');
    js.src = 'js/back.js'
    js.id = "backjs"
    const body = document.querySelector('body')
    body.appendChild(js)
    const jsbackpage = document.createElement('script');
    jsbackpage.src = 'js/backAccueil.js';
    jsbackpage.id ='scriptBackPage';
    body.appendChild(jsbackpage);

    const css = document.createElement('link');
    css.rel='stylesheet';
    css.href='css/back.css';
    css.classList.add('dynamic-css')
    css.id = "cssback";
    const head = document.querySelector('head')
    head.appendChild(css)
    ajoutTicket()
}

function goBack(html){
    const overlay = document.createElement('div');
    overlay.classList.add('loadoverlay');

  // Création du contenu de l'overlay
    const bk = document.createElement('div');
    bk.classList.add('background')
    const logo = document.createElement('img')
    logo.src= "/logo/logotransparant.png"
    logo.classList.add('logoload')
    bk.appendChild(logo)
    

    // Création du bouton de fermeture
    
    overlay.appendChild(bk);

  // Ajout de l'overlay dans le body
    document.body.appendChild(overlay);

    document.querySelector('#lock').media= "none";

    const mainContent = document.querySelector('#main-content')
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
        
    mainContent.textContent = '';
    Array.from(doc.body.childNodes).forEach(node => {
        mainContent.appendChild(node)
    });
    
    setTimeout(() => {
        overlay.style.opacity="0"
        overlay.remove()
    }, 1000);

}

function goClient(html){
    const overlay = document.createElement('div');
    overlay.classList.add('loadoverlay');

  // Création du contenu de l'overlay
    const bk = document.createElement('div');
    bk.classList.add('background')
    const logo = document.createElement('img')
    logo.src= "/logo/logotransparant.png"
    logo.classList.add('logoload')
    bk.appendChild(logo)
    

    // Création du bouton de fermeture
    
    overlay.appendChild(bk);

  // Ajout de l'overlay dans le body
    document.body.appendChild(overlay);

    document.querySelector('#lock').media= "none";

    const mainContent = document.querySelector('#main-content')
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
        
    mainContent.textContent = '';
    Array.from(doc.body.childNodes).forEach(node => {
        mainContent.appendChild(node)
    });
    const script = document.createElement('script')
    script.src = '/js/client.js';
    script.id = "client"
    document.body.appendChild(script)
    
    setTimeout(() => {
        overlay.style.opacity="0"
        overlay.remove()
    }, 1000);
}



function ajoutTicket(){
    const contentTicket = document.createElement('div')
    contentTicket.classList.add('contentticket')

    const ticket = document.createElement('img')
    ticket.src = "icon/tickets.svg"
    ticket.style.width="100%"

    const bk = document.createElement('div')
    bk.classList.add('background')

    const logo = document.createElement('img')
    logo.src = "/logo/logotransparant.png"
    logo.classList.add('logoTicket')

    const contentlogo = document.createElement('div')
    contentlogo.classList.add('contentlogoticket')

    bk.appendChild(logo)
    contentlogo.appendChild(bk)
    contentTicket.appendChild(ticket)
    contentTicket.appendChild(contentlogo)


    document.body.appendChild(contentTicket)

    
}



function resOverlay(msg,err){
    const overlay = document.createElement('div');
    overlay.classList.add('overlayy');
    const p = document.createElement('p')
    p.classList.add("poverlay")
    if(err){
        p.style.color="red"
    }else{
        p.style.color = "#5babff"
    }
    p.textContent = msg
  
    // Création du contenu de l'overlay
    const overlayContent = document.createElement('div');
    overlayContent.classList.add('overlay-content');
    overlayContent.style.margin="0px 10px"
    overlayContent.appendChild(p)
  
    overlay.addEventListener('click', () => {
        overlay.style.opacity = "0";
        overlay.style.visibility = "hidden";
        setTimeout(() => overlay.remove(), 300); // Supprime après animation
    });
  
    // Applique l'animation d'apparition
    setTimeout(() => {
        overlay.style.opacity = "1";
        overlay.style.visibility = "visible";
    }, 10);
    // Ajout du contenu dans l'overlay
    overlay.appendChild(overlayContent);
  
    // Ajout de l'overlay dans le body
    document.body.appendChild(overlay);
    setTimeout(() => {
        overlay.remove()
    }, 5000);
}

function load(){
        
    const overlay = document.createElement('div');
    overlay.classList.add('overlayLoad');
    overlay.style.visibility="visible";
    overlay.style.opacity="1"
    console.log(overlay);

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


function ecouteOeil(nv, v) {
    // Supprime l'écouteur d'événement avant modification
    document.querySelector(`#${nv}`).removeEventListener("click", togglePasswordVisibility);

    // Changer l'affichage des icônes
    document.querySelector(`#${nv}`).style.display = "none";
    document.querySelector(`#${v}`).style.display = "block";

    // Ajouter l'écouteur d'événement sur la nouvelle icône
    document.querySelector(`#${v}`).addEventListener("click", togglePasswordVisibility);

    // Changer le type du champ mot de passe
    document.querySelector("#password").type = v === "notview" ? "text" : "password";
}

// Fonction intermédiaire pour gérer le clic
function togglePasswordVisibility() {
    const isHidden = document.querySelector("#password").type === "password";
    ecouteOeil(isHidden ? "view" : "notview", isHidden ? "notview" : "view");
}

// Ajout de l'écouteur de base
document.querySelector("#view").addEventListener("click", togglePasswordVisibility);


})()


