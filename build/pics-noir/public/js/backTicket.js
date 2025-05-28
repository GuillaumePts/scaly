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

    document.querySelectorAll('.reset').forEach(input => {
        input.addEventListener('input', (e) => {
            e.target.style.border = "none";

            // Cas spécifique pour le champ de prix
            if (e.target.id === 'inputticketPrice') {
                const err = document.querySelector('#errprice');
                if (err) err.textContent = "";
            }
        });
    });



    // Gestion de l'upload de fichiers
    let folderUpload = [];

    addEventListenerOnce(document.querySelector('#uploadDossier'), 'change', (event) => {
        load('Téléchargement de vos Photos...');

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
                        finload('Téléchargement réussi');
                    }
                };

                reader.onerror = () => {
                    taille.textContent = 'Erreur';
                    loading.style.animation = '';
                    button.disabled = false;
                    button.style.backgroundColor = 'red';
                    finload('Téléchargement échoué');
                };

                reader.readAsArrayBuffer(file);
            });
        }, 400);
    });


    // Soumission du ticket
    addEventListenerOnce(document.querySelector('#submitTicket'), 'click', () => {

        if (document.querySelector('#ticketEchec')) {
            document.querySelector('#ticketEchec').style.display = "none"
        }
        if (document.querySelector('#ticketSuccess')) {
            document.querySelector('#ticketSuccess').style.display = "none"
        }

        const id = idticket.value;
        const key = keyticket.value;
        const nom = nomticket.value;
        const prenom = prenomticket.value;
        const dossier = folderUpload;
        const mail = mailticket.value;

        const inputPrice = document.querySelector('#inputticketPrice');
        let price = false;

        if (document.querySelector('#paymentYes').checked) {
            if (inputPrice.value.trim()) {
                price = inputPrice.value.trim();
            } else {
                inputPrice.style.border = "2px solid red";
                inputPrice.scrollIntoView({ behavior: 'smooth' });
                document.querySelector('#errprice').style.color = 'red'
                document.querySelector('#errprice').textContent = "Vous devez renseigner un prix lorsque le règlement client est activé."
                return;
            }
        }



        if (!id || !key || !nom || !prenom || !mail || dossier.length === 0) {
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
            if (!mail) {
                document.querySelector('#mailticket').style.border = "2px solid red";
            }
            if (folderUpload.length == 0) {
                document.querySelector('#buttonUploadFolder').style.backgroundColor = "red";
            }

        } else {
            requestAnimationFrame(() => {
                load('Création du ticket...');
            });

            const formData = new FormData();

            if (price) {

                formData.append('idl', id);
                formData.append('key', key);
                formData.append('nom', nom);
                formData.append('prenom', prenom);
                formData.append('mail', mail);
                formData.append('dossier', dossier[0].webkitRelativePath.split('/')[0]);
                formData.append('prix', price);

            } else {
                formData.append('idl', id);
                formData.append('key', key);
                formData.append('nom', nom);
                formData.append('prenom', prenom);
                formData.append('mail', mail);
                formData.append('dossier', dossier[0].webkitRelativePath.split('/')[0]);

            }


            dossier.forEach(file => {
                formData.append('files', file);
            });


            const uploadFolder = async () => {
                try {
                    // On lance le loader avant l'upload


                    const response = await fetch('/creat-ticket', {
                        method: 'POST',
                        credentials: 'include',
                        body: formData
                    });

                    const data = await response.json();

                    if (data.success) {

                        getTicket();
                        idticket.value = "";
                        keyticket.value = "";
                        nomticket.value = "";
                        prenomticket.value = "";
                        mailticket.value = "";
                        if (document.querySelector('#labelPrice') && document.querySelector('#inputticketPrice')) {
                            document.querySelector('#labelPrice').remove()
                            document.querySelector('#inputticketPrice').remove()
                        }
                        document.querySelector('#paymentNo').checked = true
                        document.querySelector('#errprice').textContent = ""
                        folderUpload = [];
                        document.querySelector('#buttonUploadFolder').style.backgroundColor = "#000";
                        document.querySelector('.tailleTicket').textContent = "0%";
                        finload(data.message);


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

                        setTimeout(() => {
                            document.querySelector('#ticketSuccess').style.display = "none";
                            document.getElementById('successAnim').textContent = ""
                        }, 5750);

                    } else {
                        document.querySelector('.notgood').textContent = data.message
                        finload(data.err)
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

                        setTimeout(() => {
                            document.querySelector('#ticketEchec').style.display = "none";
                            document.getElementById('echecAnim').textContent = ""
                        }, 5750);

                    }
                } catch (err) {
                    console.error('Erreur:', err);
                    finload('! Une erreur est survenue.')

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
        fetch('/get-ticket', {
            credentials: 'include',
        })
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
                    document.querySelector('#anim').style.display = "none";
                    document.querySelector('#configticket')?.remove();
                } else {
                    document.querySelector('#configticket')?.remove();
                    document.querySelector('#ticketh2').textContent = "Un ticket en cours";
                    document.querySelector('#contentRemoveTicket').style.display = "flex";
                    document.querySelector('#anim').style.display = "flex";

                    const div = document.createElement('div');
                    div.id = "configticket";
                    const priceHTML = data.ticket.price
                        ? `
        <div>
            <p class="param">PRIX :</p>
            <p class="value" id="ticket-price">${data.ticket.price}€</p>
        </div>
      `
                        : '';

                    const paiementHTML = data.ticket.price
                        ? `
        <div>
            <p class="param">Paiement :</p>
            <p class="value" id="paiement">${data.ticket.paiementcheck === false
                            ? 'Paiement non effectué'
                            : 'Paiement effectué'
                        }</p>
        </div>
      `
                        : '';

                    div.innerHTML = `
    <div>
        <p class="param">ID :</p>
        <p class="value" id="ticket-id">${data.ticket.idl}</p>
    </div>
    <div>
        <p class="param">MOT DE PASSE :</p>
        <p class="value" id="ticket-key">${data.ticket.key}</p>
    </div>
    <div>
        <p class="param">NOM :</p>
        <p class="value" id="ticket-nom">${data.ticket.nom}</p>
    </div>
    <div>
        <p class="param">PRENOM :</p>
        <p class="value" id="ticket-prenom">${data.ticket.prenom}</p>
    </div>
    <div>
        <p class="param">E-MAIL :</p>
        <p class="value" id="ticket-mail">${data.ticket.mail}</p>
    </div>
    <div>
        <p class="param">PHOTOS :</p>
        <p class="value" id="ticket-nombre">${data.ticket.nombrel}</p>
    </div>
    <div>
        <p class="param">TAILLE :</p>
        <p class="value" id="ticket-taille">${data.ticket.taille}</p>
    </div>
    <div>
        <p class="param">STATUT :</p>
        <p class="value" id="ticket-download">${data.ticket.download}</p>
    </div>
    ${priceHTML}
    ${paiementHTML}
`;

                    document.querySelector('#getticket').appendChild(div);

                    if (data.ticket.price) {
                        const bk = document.createElement('div')
                        bk.classList.add('background-button')
                        const button = document.createElement('button')
                        button.classList.add('buttonform')
                        button.textContent = "Débloquer le ticket"

                        bk.appendChild(button)
                        document.querySelector('#getticket').appendChild(bk)

                        const pinfo = document.createElement('p')
                        pinfo.classList.add('info')
                        pinfo.textContent = "ℹ️ Ce bouton sert à débloquer manuellement le ticket de votre client en cas de problème. Il lui permettra de télécharger ses photos malgré un souci de paiement sur votre site Pic’s."

                        document.querySelector('#getticket').appendChild(pinfo)


                        button.addEventListener('click', () => {
                            load("Déblocage du ticket...");

                            fetch('/unlock-ticket', {
                                method: 'POST',
                                credentials: 'include',
                            })
                                .then(response => {
                                    if (!response.ok) {
                                        finload('Erreur lors du déblocage du ticket',2000);
                                    }
                                    return response.json();
                                })
                                .then(data => {
                                    finload('Ticket débloqué avec succès, un mail à été envoyé à votre client', 2000);
                                    document.querySelector('#paiement').textContent = "Paiement réussi (déblocage manuel)"
                                })
                                .catch(error => {
                                    finload(error, 2000);
                                    // Tu peux afficher un message d'erreur ici
                                });
                        });


                    }
                }
            })
            .catch(error => console.error('Erreur:', error));
    }
    getTicket();

    // Suppression du ticket
    addEventListenerOnce(document.querySelector('#contentRemoveTicket'), 'click', () => {
        fetch('/reset-ticket', {
            method: 'DELETE',
            credentials: 'include',
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


    
    function load(msg) {

        const overlay = document.createElement('div');
        overlay.classList.add('overlayLoad');
        overlay.style.visibility = "visible";
        overlay.style.opacity = "1"


        const msgoverlay = document.createElement('p')
        msgoverlay.classList.add('msgoverlay')
        msgoverlay.textContent = msg

        overlay.appendChild(msgoverlay)

        // Ajout de l'overlay dans le body
        document.body.appendChild(overlay);
        const button = document.querySelector('.bubbly-button')
        button.style.overflow = 'hidden'
        const t = document.querySelector('#mooveAnim')

        t.style.zIndex = "1"
        t.style.opacity = "1"
        document.querySelector('#logonavbarre').style.opacity = "0"
        const div = document.createElement('div')
        div.classList.add('loaderi')

        const img = document.createElement('img')
        img.src = "/logo/logocoupe.png"
        img.style.width = "auto"
        img.style.height = "58px"
        img.style.borderRadius = "50px"

        const grad = document.createElement('div')
        grad.classList.add('gradload')
        grad.appendChild(img)
        document.querySelector('#admin').appendChild(div)
        document.querySelector('#admin').appendChild(grad)

    }

    function finload(msg,time) {


        document.querySelector('.msgoverlay').textContent = msg
        document.querySelector('.loaderi').remove()
        document.querySelector('.gradload').remove()
        document.querySelector('#logonavbarre').style.opacity = "1"
        const button = document.querySelector('.bubbly-button')
        button.style.overflow = 'visible'
        button.classList.add('anima');
        setTimeout(function () {
            button.classList.remove('anima');
            document.querySelector('.overlayLoad').style.visibility = "hidden";
            document.querySelector('.overlayLoad').style.opacity = "0"
            document.querySelector('.overlayLoad').remove()
        }, time);
    }



    

    if (window.packClient) {
        if (window.paiementaccept) {
            document.querySelector('#paymentYes').disabled = false
            document.querySelector('#paymentYes').addEventListener('change', () => {
                if (!document.querySelector('#inputticketPrice')) {
                    const label = document.createElement('h3');
                    label.id = 'labelPrice'
                    label.textContent = 'Votre Prix (EUR/€) :';

                    // Crée l'input
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.name = 'price';
                    input.step = '0.01';
                    input.min = '0';
                    input.className = 'reset'
                    input.placeholder = '0.00€';
                    input.required = true;
                    input.id = 'inputticketPrice'
                    document.querySelector('#addPaiementCtooC').appendChild(label)
                    document.querySelector('#addPaiementCtooC').appendChild(input)
                }
            })
            document.querySelector('#paymentNo').addEventListener('change', () => {
                if (document.querySelector('#inputticketPrice')) {
                    document.querySelector('#inputticketPrice').remove()
                }
                if (document.querySelector('#labelPrice')) {
                    document.querySelector('#labelPrice').remove()
                }
            })
        } else {
            document.querySelector('#paymentYes').disabled = true
        }
    } else {
        console.log('error');
    }

})();
