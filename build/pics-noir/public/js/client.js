(()=>{
     
    getDownload()
    async function getDownload() {
        
        try {
            const response = await fetch('/get-ticket-folder',{
                credentials: 'include',
            });
            const data = await response.json();
    
            if (response.ok) {
                document.querySelector('#nomprenom').textContent=`Bienvenu ${data.prenom} ${data.nom}`
            } else {
                console.error('Erreur:', data.error);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération du dossier:', error);
        }
    }



    document.querySelector('#downloadTicket').addEventListener('click', async () => {
        // Afficher l'animation de chargement
        load();
    
        try {
            const response = await fetch('/download-photos',{
                credentials: 'include',
            });
    
            if (!response.ok) {
                finload()
                document.querySelector('#ticketEchec').style.display = "flex"
                        document.querySelector('#ticketEchec').scrollIntoView({
                            behavior: 'smooth',  // Pour un défilement fluide
                            block: 'start'       // Pour aligner la div en haut de la fenêtre de visualisation
                        });
                    const animation2 = lottie.loadAnimation({
                        container: document.getElementById('echecAnim'),
                        renderer: 'svg',
                        loop: false,
                        
                        path: 'https://lottie.host/69f97ca7-5f47-4f94-8d08-a53df1ac6abb/F4eaq13Ok1.json'
                    });

                    animation2.addEventListener('enterFrame', (e) => {
                        if (e.currentTime >= 21) {
                        animation2.pause();
                        }
                    });

                    setTimeout(() => {
                        animation2.play();
                    }, 750);


            }
    
            // Créer un Blob et un lien pour télécharger le fichier
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'scaly.zip';
            link.click();

            
    
            // Notifier le serveur que le client a bien téléchargé ses fichiers
            await fetch('/download-complete', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                credentials: 'include',
                body: JSON.stringify({ download: true }) 
            });
    
            finload();
            document.querySelector('#ticketSuccess').style.display = "flex"
                    document.querySelector('#ticketSuccess').scrollIntoView({
                        behavior: 'smooth',  // Pour un défilement fluide
                        block: 'start'       // Pour aligner la div en haut de la fenêtre de visualisation
                    });
                    
                    const animation = lottie.loadAnimation({
                        container: document.getElementById('successAnim'),
                        renderer: 'svg',
                        loop: false,
                        path: 'https://lottie.host/d99f75f6-8318-40ba-bd21-ac606447461d/2jYXatUDsD.json'
                    });

                    animation.addEventListener('enterFrame', (e) => {
                        if (e.currentTime >= 35) {
                        animation.pause();
                        }
                    });

                    setTimeout(() => {
                        animation.play();
                    }, 750);

            
            
        } catch (error) {
            console.error('Erreur:', error);
            finload();
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



    getAll()
const tabPhotosClients = [];

    async function getAll() {

        try {
            const response = await fetch('/photo-ticket-all',{
                credentials: 'include',
            });
            const data = await response.json();
    
            if (response.ok) {

                tabPhotosClients.push(data.images)

                data.images.forEach(img =>{
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

                document.querySelector('.imgsMansory').appendChild(limg)
                })

            } else {
                console.error('Erreur:', data.error);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération du dossier:', error);
        }
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


    // function showOverlay(first, tab) {
    //     const overlay = document.createElement('div');
    //     overlay.classList.add('overlayy');
    
    //     const overlayContent = document.createElement('img');
    //     overlayContent.style.width = "auto";
    // overlayContent.style.maxHeight = "90vh";
    // overlayContent.style.maxWidth = "95%";
    //     overlayContent.style.transition = 'transform 0.3s ease'; // Smooth return
    
    //     let currentIndex = 0;
    //     if (first.id === "P1") currentIndex = 0;
    //     else if (first.id === "P2") currentIndex = 1;
    //     else if (first.id === "P3") currentIndex = 2;
    
    //     overlayContent.src = tab[currentIndex];
    
    //     // compteur
    //     const counter = document.createElement('div');
    //     counter.classList.add('countershowoverlay')
    //     counter.textContent = `${currentIndex + 1} / ${tab.length}`;
    
    //     // flèches (desktop only)
    //     const isDesktop = window.innerWidth > 768;
    //     let leftArrow, rightArrow;
    
    //     if (isDesktop) {
    //         leftArrow = document.createElement('div');
    //         rightArrow = document.createElement('div');
    
    //         [leftArrow, rightArrow].forEach(arrow => {
    //             arrow.style.position = 'absolute';
    //             arrow.style.top = '50%';
    //             arrow.style.transform = 'translateY(-50%)';
    //             arrow.style.fontSize = '40px';
    //             arrow.style.color = '#fff';
    //             arrow.style.cursor = 'pointer';
    //             arrow.style.userSelect = 'none';
    //         });
    
    //         leftArrow.textContent = '←';
    //         leftArrow.style.left = '20px';
    
    //         rightArrow.textContent = '→';
    //         rightArrow.style.right = '20px';
    
    //         overlay.appendChild(leftArrow);
    //         overlay.appendChild(rightArrow);
    
    //         leftArrow.addEventListener('click', () => changeImage(-1));
    //         rightArrow.addEventListener('click', () => changeImage(1));
    //     }
    
    //     function changeImage(direction) {
    //         currentIndex += direction;
    //         if (currentIndex < 0) currentIndex = tab.length - 1;
    //         if (currentIndex >= tab.length) currentIndex = 0;
    
    //         overlayContent.style.transition = 'none'; // reset anim
    //         overlayContent.style.transform = `translateX(${direction * 100}%)`;
    
    //         requestAnimationFrame(() => {
    //             overlayContent.src = tab[currentIndex];
    //             counter.textContent = `${currentIndex + 1} / ${tab.length}`;
    //             overlayContent.style.transition = 'transform 0.3s ease';
    //             overlayContent.style.transform = 'translateX(0)';
    //         });
    //     }
    
    //     // swipe mobile
    //     let startX = 0;
    //     let isSwiping = false;
    
    //     overlay.addEventListener('touchstart', e => {
    //         startX = e.touches[0].clientX;
    //         isSwiping = true;
    //         overlayContent.style.transition = 'none'; // no transition while moving
    //     });
    
    //     overlay.addEventListener('touchmove', e => {
    //         if (!isSwiping) return;
    //         const currentX = e.touches[0].clientX;
    //         const deltaX = currentX - startX;
    //         const limitedDelta = Math.max(-20, Math.min(20, deltaX)); // Limiting swipe movement to 20px max
    //         overlayContent.style.transform = `translateX(${limitedDelta}px)`;
    //     });
    
    //     overlay.addEventListener('touchend', e => {
    //         isSwiping = false;
    //         const endX = e.changedTouches[0].clientX;
    //         const deltaX = endX - startX;
    
    //         overlayContent.style.transition = 'transform 0.3s ease';
    
    //         if (Math.abs(deltaX) > 50) {
    //             const direction = deltaX > 0 ? -1 : 1;
    //             changeImage(direction); // Change image on significant swipe
    //         } else {
    //             overlayContent.style.transform = 'translateX(0)'; // No movement if swipe is not significant
    //         }
    
    //         // Ensure the image stops moving immediately after the touch ends
    //         overlayContent.style.transition = 'transform 0.3s ease';
    //         overlayContent.style.transform = 'translateX(0)';
    //     });
    
    //     // fermeture
    //     const close = () => {
    //         overlay.style.opacity = "0";
    //         overlay.style.visibility = "hidden";
    //         setTimeout(() => overlay.remove(), 300);
    //     };
    
    //     overlayContent.addEventListener('click', close);
    //     overlay.addEventListener('click', e => {
    //         if (e.target === overlay) close();
    //     });
    
    //     overlay.appendChild(overlayContent);
    //     overlay.appendChild(counter);
    //     document.body.appendChild(overlay);
    
    //     setTimeout(() => {
    //         overlay.style.opacity = "1";
    //         overlay.style.visibility = "visible";
    //     }, 10);
    // }
    
    
    

})()