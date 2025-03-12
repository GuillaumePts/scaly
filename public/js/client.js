(()=>{
    
    getDownload()
    async function getDownload() {
        
        try {
            const response = await fetch('/get-ticket-folder');
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
            const response = await fetch('/download-photos');
    
            if (!response.ok) {
                throw new Error("Erreur lors du téléchargement.");
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
                body: JSON.stringify({ message: 'Téléchargement terminé' }) 
            });
    
            // Cacher l'animation de chargement et signaler la fin
            finload();
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

    getphoto()
    async function getphoto() {
        const p1 = document.querySelector('#P1')
        const p2 = document.querySelector('#P2')
        const p3 = document.querySelector('#P3')
        
        try {
            const response = await fetch('/photo-ticket-folder');
            const data = await response.json();
    
            if (response.ok) {
                console.log(data.images);
                
                    p1.style.backgroundImage=`url(${data.images[0]})`
                    p2.style.backgroundImage=`url(${data.images[1]})`
                    p3.style.backgroundImage=`url(${data.images[2]})`
                
                // Ici, tu peux afficher `data.folder` dans ton interface utilisateur
            } else {
                console.error('Erreur:', data.error);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération du dossier:', error);
        }
    }
})()