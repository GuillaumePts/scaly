(function() {

    fetch('/get-imgaccueil')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Liste des fichiers :', data.files);
            console.log(document.querySelector('#accueilImg'));
            document.querySelector('#accueilImg').style.backgroundImage = `url(/imgaccueil/${data.files[0]})`
        } else {
            console.error('Erreur lors de la récupération des images:', data.message);
        }
    })
    .catch(error => {
        console.error('Erreur réseau ou serveur:', error);
    });

    
    fetch('/getaccueil')
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des contacts');
        }
        return response.json();
    })
    .then(data => {
        
        getaccueil(data)
        
    })
    .catch(error => {
        console.error('Erreur:', error);
    });


    // Variable globale pour suivre la carte actuellement visible


})();


async function fetchVideoSrc() {
    
    try {
        const res = await fetch('/get-video-accueil');
        const data = await res.json();

        if (data.src) {
            const videoElement = document.getElementById('videoAccueilclient');
            videoElement.src = data.src;
            document.querySelector('#myVideo').load();
        } else {
            console.log('Aucune vidéo trouvée.');
        }
    } catch (err) {
        console.error('Erreur lors de la récupération de la vidéo :', err);
    }
}

fetchVideoSrc(); // Appelle cette fonction au chargement ou quand tu veux mettre à jour



function getaccueil(data){

    
    const presentation = document.querySelector('#presentation-1')
    presentation.textContent=data.textprofile

    const prestat = document.querySelector('#listeprestations')
    if(data.prestations.length == 0){
        const li = document.createElement('li')
            li.textContent= "Aucune préstation n'est proposée pour le moment."
            prestat.appendChild(li)
    }else{
        data.prestations.forEach(prestation => {
            const nom = prestation.nom;
            const prix = prestation.prix;
            const description = prestation.des;
            const image = prestation.img;
        
            const card = document.createElement('div')
            card.classList.add('prstCard')


            const div = document.createElement('div')
            div.classList.add('prstContentimg')


            const divimg = document.createElement('div')
            divimg.classList.add('prstdivimg') 

            const img = document.createElement('img')
            img.src = image;
            img.alt = "illustration de la prestations"
            img.classList.add('prstImg')


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

            document.querySelector('#listeprestations').appendChild(card)
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
    
}

