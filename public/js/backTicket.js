(() => {

    // Fonction pour ajouter un écouteur d'événement avec vérification du drapeau
    const addEventListenerOnce = (element, event, callback) => {
        if (element && !element.dataset.listenerAdded) {
            element.addEventListener(event, callback);
            element.dataset.listenerAdded = "true";
        }
    }

    // Génération d'ID
    addEventListenerOnce(document.querySelector('#generId'), 'click', () => {
        const input = document.querySelector('#idticket');
        const id = Math.random().toString(36).substring(2, 8).toUpperCase();
        input.value = id;
        console.log('JS chargé');
    });

    // Génération de clé
    addEventListenerOnce(document.querySelector('#generKey'), 'click', () => {
        const input = document.querySelector('#keyticket');
        const key = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
        const keyFinal = key.substring(0, 16).toUpperCase();
        input.value = keyFinal;
    });

    // Reset des bordures
    addEventListenerOnce(document.querySelector('#idticket'), 'click', () => {
        document.querySelector('#idticket').style.border = "none";
    });

    addEventListenerOnce(document.querySelector('#keyticket'), 'click', () => {
        document.querySelector('#keyticket').style.border = "none";
    });

   // Gestion de l'upload de fichiers
let folderUpload = [];

addEventListenerOnce(document.querySelector('#uploadDossier'), 'change', (event) => {
    requestAnimationFrame(load);

    setTimeout(() => {
        const taille = document.querySelector('.tailleTicket');
        const loading = document.querySelector('#loadingFolder');
        const button = document.querySelector('#buttonUploadFolder');
        const titreDossier = document.querySelector('#titreDossierUpload');
        const files = event.target.files;

        if (files.length === 0) return;

        // Réinitialisation des valeurs
        folderUpload.length = 0;
        titreDossier.textContent = '';
        taille.textContent = '0%';
        loading.style.animation = 'rotation 0.200s infinite linear';
        button.disabled = true;
        button.style.backgroundColor = '';

        // Nom affiché basé sur le premier fichier (on ne gère plus les dossiers)
        const nombreElements = files.length;
        titreDossier.textContent = `${nombreElements} fichier${nombreElements > 1 ? 's' : ''} sélectionné${nombreElements > 1 ? 's' : ''}`;

        let totalSize = 0;
        let loadedSize = 0;
        for (const file of files) {
            totalSize += file.size;
        }

        Array.from(files).forEach(file => {
            const reader = new FileReader();

            reader.onprogress = (event) => {
                if (event.lengthComputable) {
                    loadedSize += event.loaded;
                    const percent = Math.min(100, Math.round((loadedSize / totalSize) * 100));
                    taille.textContent = `${percent}%`;
                }
            };

            reader.onloadend = () => {
                folderUpload.push(file);

                if (folderUpload.length === files.length) {
                    loading.style.animation = '';
                    button.disabled = false;
                    button.style.backgroundColor = 'green';
                    finload();
                }
            };

            reader.onerror = () => {
                taille.textContent = 'Erreur';
                loading.style.animation = '';
                button.disabled = false;
                button.style.backgroundColor = 'red';
                finload();
            };

            reader.readAsArrayBuffer(file);
        });
    }, 400);
});


    // Soumission du ticket
    addEventListenerOnce(document.querySelector('#submitTicket'), 'click', () => {
        
        const id = idticket.value;
        const key = keyticket.value;
        const nom = nomticket.value;
        const prenom = prenomticket.value;
        const dossier = folderUpload;
        console.log(dossier);

        if (!id || !key || !nom || !prenom || dossier.length === 0) {
            if (!id) {
                document.querySelector('#idticket').style.border = "2px solid red";
                
            }
            if (!key) {
                document.querySelector('#keyticket').style.border = "2px solid red";
            }
            if (!nom) {
                document.querySelector('#nomticket').style.border = "2px solid red";
            }
            if (!prenom) {
                document.querySelector('#prenomticket').style.border = "2px solid red";
            }
            if (folderUpload.length == 0) {
                document.querySelector('#buttonUploadFolder').style.backgroundColor = "red";
            }
            
        }else { 
            requestAnimationFrame(() => {
                load();
            });
            const formData = new FormData();
            formData.append('idl', id);
            formData.append('key', key);
            formData.append('nom',nom);
            formData.append('prenom', prenom);
            formData.append('dossier', dossier[0].webkitRelativePath.split('/')[0]);
        
            dossier.forEach(file => {
                formData.append('files', file);
            });

            
        
            const uploadFolder = async () => {
                try {
                    // On lance le loader avant l'upload
                    
        
                    const response = await fetch('/creat-ticket', {
                        method: 'POST',
                        body: formData
                    });
        
                    const data = await response.json();
                    
                    if (data.success) {
                        alert('Ticket créé avec succès !');
                        getTicket();
                        idticket.value = "";
                        keyticket.value = "";
                        nomticket.value = "";
                        prenomticket.value = "";
                        folderUpload = [];
                        document.querySelector('#buttonUploadFolder').style.backgroundColor = "#000";
                        document.querySelector('.tailleTicket').textContent = "0%";
                        finload();
                        
                    } else {
                        alert('Erreur lors de la création du ticket.');
                        finload()
                    }
                } catch (err) {
                    console.error('Erreur:', err);
                    finload()
                    alert('Une erreur est survenue.');
                }
            };
        
            // Appel de la fonction asynchrone
            setTimeout(() => {
                uploadFolder();
            }, 100);
        }
        
            
        
    });

    // Récupération du ticket
    function getTicket() {
        fetch('/get-ticket')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération du ticket');
                }
                return response.json();
            })
            .then(data => {
                if (data.ticket.idl == "") {
                    document.querySelector('#ticketh2').textContent = "Aucun ticket en cours";
                    document.querySelector('#contentRemoveTicket').style.display = "none";
                    document.querySelector('#configticket')?.remove();
                } else {
                    document.querySelector('#configticket')?.remove();
                    document.querySelector('#ticketh2').textContent = "Vous avez un ticket en cours";
                    document.querySelector('#contentRemoveTicket').style.display = "flex";

                    const div = document.createElement('div');
                    div.id = "configticket";
                    div.innerHTML = `
                        <p>ID : ${data.ticket.idl}</p>
                        <p>CLEF : ${data.ticket.key}</p>
                        <p>NOM : ${data.ticket.nom}</p>
                        <p>PRENOM : ${data.ticket.prenom}</p>
                        <p>DOSSIER : ${data.ticket.dossier}</p>
                        <p>FICHIER : ${data.ticket.nombrel}</p>
                        <p>TAILLE : ${data.ticket.taille}</p>
                    `;
                    document.querySelector('#getticket').appendChild(div);
                }
            })
            .catch(error => console.error('Erreur:', error));
    }
    getTicket();

    // Suppression du ticket
    addEventListenerOnce(document.querySelector('#contentRemoveTicket'), 'click', () => {
        fetch('/reset-ticket', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) getTicket();
            })
            .catch(error => console.error('Erreur réseau :', error));
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

})();
