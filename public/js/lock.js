



///////////////////////////////////////////////////////
// FORMULAIRE DE CONNEXION ///////////////////////////
/////////////////////////////////////////////////////


(()=>{
    const lebutton = document.querySelector('#submit-button');
const inputpass = document.querySelector('#password');
const inputid = document.querySelector('#id');
const lock = document.querySelector('#divlock');
const unlock = document.querySelector('#unlock')

document.getElementById('submit-button').addEventListener('click', async function() {
    load()
    const email = document.getElementById('id').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
    });

    const data = await response.json();
    if (response.ok) {
        finload()
        goback()
        window.clientData = data.user;
        console.log(data);
    } else {
        finload()
        // Erreur
        alert(data.message);
    }
});


function goback(){
    const script = document.querySelector('script')
    script.id ="clientjs"
    script.src = "/js/client.js"
    document.body.appendChild(script)

    const link = document.createElement("link");
    link.id = "cssclient";
    link.rel = "stylesheet";
    link.href = "/css/client.css";
    document.head.appendChild(link);

    document.querySelector('#lock').style.display ="none"
    document.querySelector('#unlock').style.display ="flex"

    document.querySelector('#charging').style.display = "flex"

    fetch("/dashboard")
        .then(res => res.json())
        .then(data => {
            document.querySelector('#main-content').textContent=""
            
        })
        .catch(() => console.log('problème'));

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


