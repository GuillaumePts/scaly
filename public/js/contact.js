(()=>{
//     const nom = document.querySelector('#inputnom');
// const mail = document.querySelector('#inputmail');
// const msg = document.querySelector('#inputmsg');
// const button = document.querySelector('#submit');
const taberr = []


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

// button.addEventListener('click', ()=>{

//     if(taberr.length == 0){
//         const lenom = valide(nom);
//         const lemail = valide(mail);
//         const lemsg = valide(msg);
//         if(lenom && lemail && lemsg){
//             load()
//             fetch('/contact-message', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({
//                     nom: lenom,
//                     email: lemail,
//                     message: lemsg
//                 })
//             })
//             .then(response => {
//                 if(response.ok) {
//                     return response.json();
//                 }
//                 throw new Error('Une erreur est survenue lors de l\'envoi du message.');
//             })
//             .then(data => {
//                 nom.value = ""
//                 mail.value = ""
//                 msg.value=""

//                 finload()
//                 setTimeout(() => {
//                     resOverlay(data.success)
//                 }, 800);
//             })
//             .catch(error => {
                
//                 finload()
//                 setTimeout(() => {
//                     resOverlay(error,true)
//                 }, 800);
//             });
//         }
//     }
//     else{
//         taberr.forEach(lerr =>{
//             err(lerr)
//         })
//     }
    
// })

// nom.addEventListener('input', (event) => {
//     nom.style.color = "#666";
//     nom.style.border="none"
//     const saisi = event.target.value
//     if(saisi.length > 150){
//         err(nom)
//         event.target.value = saisi.slice(0, 150);
//     }
// });

// mail.addEventListener('input', (event) => {
//     mail.style.color = "#666";
//     mail.style.border="none"
//     const saisi = event.target.value
//     const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

//     if(saisi.length > 150){
//         err(nom)
//         event.target.value = saisi.slice(0, 150);
//     }
//     // else if(!emailRegex.test(saisi)){
//     //     err(mail)
//     // }
// });

// msg.addEventListener('input', (event) => {
//     msg.style.color = "#666";
//     msg.style.border="none"
//     const saisi = event.target.value
//     if(saisi.length > 450){
//         err(msg)
//         event.target.value = saisi.slice(0, 450);
//     }
// });


// function mavideo() {
//     const video1 = document.querySelector("#meduse1");
//     const video2 = document.querySelector("#meduse2");

//     if (!video1 || !video2) {
//         console.error("Les vidéos ne sont pas trouvées !");
//         return;
//     }

//     // Initialement, on cache video2
//     video2.style.display = "none";

//     function playLoop(videoOut, videoIn) {
//         videoOut.style.display = "block";  // Afficher la vidéo sortante
//         videoIn.style.display = "none";   // Cacher la vidéo entrante

//         videoOut.play();  // Lancer la vidéo sortante
//         setTimeout(() => {
//             videoOut.pause();  // Pause la vidéo sortante
//             videoOut.currentTime = 0;  // Réinitialiser la lecture

//             videoOut.style.display = "none";  // Cacher la vidéo sortante
//             videoIn.style.display = "block";  // Afficher la vidéo entrante
//             videoIn.play();  // Lancer la vidéo entrante

//             // Répéter le processus après 5 secondes
//             setTimeout(() => playLoop(videoIn, videoOut), 5000);  // Durée fixe de 5 secondes
//         }, 5000);  // Durée de 5 secondes pour la vidéo sortante
//     }

//     playLoop(video1, video2);  // Commencer avec video1, puis alterner avec video2
// }

// mavideo()


function err(input){
    input.style.color = "red";
    input.style.border="3px solid red"

    if (!taberr.includes(input)) {
        taberr.push(input);
    }


}

function valide(input){
    if(!input.value){
        err(input)
    }else{
        input.style.color = "#666";
        input.style.border="none"
        let value = sanitizeInput(input.value)
        return value
    }
}

function sanitizeInput(input) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    };
    return input.replace(/[&<>"'/]/g, (char) => map[char]);
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

// ///////////////////////////////
///APPEL RESEAUX/////////////////////////////
/////////////////////////////////


fetch('/contactfooter')
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des contacts');
        }
        return response.json();
    })
    .then(data => {
        console.log('Contacts récupérés:', data);
        // traitement2(data)
        
    })
    .catch(error => {
        console.error('Erreur:', error);
    });


function traitement2(data){
    const reseaufooter = document.querySelector('#reseaux')
    reseaufooter.textContent=""

    data.forEach(contact => {
        Object.keys(contact).forEach(key => {
            const value = contact[key];
            
            const a = document.createElement('a')
                a.href = value.link
                const p = document.createElement('p')
                p.textContent= value.text
                
                const slink = document.createElement('img')
                slink.src= `/svg/${key}.svg`
                slink.style.width="50px";
                slink.style.height ="50px"

                a.appendChild(slink)
                a.appendChild(p)
                reseaufooter.appendChild(a)
            
        });
    });

}
})()