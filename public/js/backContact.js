

function navBackContact(page) {
  const reseaux = document.querySelector('#reseaux');
  const img = document.querySelector('#imgcontact');
  

  const pagesConfig = {
      reseaux: {
          show: reseaux,
          hide: [img],
          functions: [appelLink] // Stocke la référence de la fonction sans l’exécuter
      },
      img: {
          show: img,
          hide: [reseaux],
          functions: []
      },
      
  };

  // Vérifie si la page existe
  if (pagesConfig[page]) {
      const { show, hide, functions } = pagesConfig[page];

      // Affiche la page correspondante
      show.classList.remove('dnone');
      show.classList.add('dflex');

      // Cache les autres pages
      hide.forEach(element => {
          element.classList.remove('dflex');
          element.classList.add('dnone');
      });

      // ✅ Exécute les fonctions avec ou sans paramètre selon leur nom
      if (functions) {
          functions.forEach(fn => {
              if (typeof fn === 'function') {
                  fn()
              } else {
                  console.error("L'élément de la liste functions n'est pas une fonction :", fn);
              }
          });
      }
  } else {
      // Cas par défaut si aucune correspondance trouvée
      carrousel.classList.remove('dnone');
      carrousel.classList.add('dflex');
      profile.classList.add('dnone');
      profile.classList.remove('dflex');
      service.classList.add('dnone');
      service.classList.remove('dflex');
      img.classList.add('dnone');
      img.classList.remove('dflex');
  }
}

appelLink()
function appelLink(){

  fetch('/send-link')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Données reçues :', data);
    document.querySelector('#listeReseaux').textContent=""
    // Exemple d'utilisation
    
    data.forEach(item => {
      const key = Object.keys(item)[0]; // Exemple : 'mail', 'tel', 'instagram'
      const value = item[key];
      
      creatLinkmain(key,value)
      
    });
  })
  .catch(error => {
    console.error('Erreur lors de la récupération des données :', error);
  });
}



function creatLinkmain(key,value){

    const content = document.querySelector('#listeReseaux')
    const div = document.createElement('div');
    const a = document.createElement('a');
    a.textContent = value.text;
    a.href = value.link
    const img = document.createElement('img')
    img.alt="logo du reseau social "+key
    img.style.height='40px';
    img.style.width='40px';
    img.src = `/svg/${key}.svg`
    const divinter = document.createElement('div')
    const remov = document.createElement('img');
    remov.addEventListener('click',()=>{
      removPresation(key)
    })
    remov.src = '/icon/remove.svg';
    remov.alt = 'boutton supprimé';
    remov.classList.add('removeReseau')
    divinter.appendChild(remov)



    div.appendChild(img)
    div.appendChild(a)
    div.appendChild(divinter)
    content.appendChild(div)
}

function removPresation(key) {
  fetch('/delete-prestation', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ key })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la prestation');
      }
      return response.json();
    })
    .then(data => {
      
      appelLink()
      if(data.error){
        gestionErrValid('#messageReseau',data.error, 'err')
      }
      if(data.message){
        gestionErrValid('#messageReseau',data.message, 'valid')
      }
      fetch('/contactfooter')
      .then(response => {
          if (!response.ok) {
              throw new Error('Erreur lors de la récupération des contacts');
          }
          return response.json();
      })
      .then(data => {
        const reseaufooter = document.querySelector('#reseaufooter')
        reseaufooter.textContent=""
    
        data.forEach(contact => {
            Object.keys(contact).forEach(key => {
                const value = contact[key];
    
    
                if(key !== "mail" && key !=="telephone" ){
                    const a = document.createElement('a')
                    a.href = value.link
                    const slink = document.createElement('img')
                    slink.src= `/iconfooter/${key}.svg`
    
                    a.appendChild(slink)
                    reseaufooter.appendChild(a)
                }
                
            });
        });
          
      })
      .catch(error => {
          console.error('Erreur:', error);
      });
    
    })
    .catch(error => {
      console.error('Erreur:', error);
    });
}

document.querySelector('#sendLink').addEventListener('click', () => {

  const key = document.querySelector('#options').value;
  const link = document.querySelector('#linkReseau').value.trim();
  const text = document.querySelector('#textReseau').value.trim();

  if (!key || !link || !text) {
    gestionErrValid('#messageReseau','Tout les champs doivent etre rempli !' , 'err')
    return;
  }

  fetch('/add-reseau', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ key, link, text }),
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.error || 'Erreur lors de l\'ajout du réseau');
        });
      }
      return response.json();
    })
    .then(data => {
      if(data.error){
        gestionErrValid('#messageReseau',data.error, 'err')
      }
      if(data.message){
        gestionErrValid('#messageReseau',data.message, 'valid')
      }
      appelLink()
      document.querySelector('#linkReseau').value = '';
      document.querySelector('#textReseau').value = '';
      fetch('/contactfooter')
      .then(response => {
          if (!response.ok) {
              throw new Error('Erreur lors de la récupération des contacts');
          }
          return response.json();
      })
      .then(data => {
        const reseaufooter = document.querySelector('#reseaufooter')
        reseaufooter.textContent=""
    
        data.forEach(contact => {
            Object.keys(contact).forEach(key => {
                const value = contact[key];
    
    
                if(key !== "mail" && key !=="telephone" ){
                    const a = document.createElement('a')
                    a.href = value.link
                    const slink = document.createElement('img')
                    slink.src= `/iconfooter/${key}.svg`
    
                    a.appendChild(slink)
                    reseaufooter.appendChild(a)
                }
                
            });
        });
          
      })
      .catch(error => {
          console.error('Erreur:', error);
      });
    })
    .catch(error => {
      alert(error.message);
      console.error('Erreur:', error);
    });
});

function gestionErrValid(span, message,clas){
  const conteneur = document.querySelector(span)
  conteneur.textContent= message
  conteneur.classList.add(clas)

  setTimeout(() => {
      conteneur.textContent=""
      conteneur.classList.remove('err', 'valid');
  }, 3000);
}

(()=>{
  const optionselect = document.querySelector('#options')
const link = document.querySelector('#linkReseau')
const text = document.querySelector('#textReseau')
optionselect.addEventListener('change', ()=>{

  link.value="";
  text.value=""
  
  if (optionselect.value == 'telephone') {
    
    link.disabled = true;
    link.style.backgroundColor = "#555"
    text.placeholder = 'Votre numéro sans séparateur'

    text.addEventListener('input',()=>{
      let str = text.value; 
      let result = str.replace(/\s+/g, '');
      link.value = `tel:${result}`

    })
  }else if(optionselect.value == 'mail'){
    
    link.disabled = true;
    link.style.backgroundColor = "#555";
    text.type = 'email'
    text.placeholder = 'Votre adresse mail complète'

    text.addEventListener('input',()=>{
      let str = text.value; 
      let result = str.replace(/\s+/g, '');
      link.value = `mailto:${result}`

    })
  }else{
    link.disabled = false;
    text.type = 'text'
    link.style.backgroundColor = "#fff";
    text.placeholder = "Ce que vous voulez afficher"
  }
})

document.querySelector('#downloadIllustration-contact').addEventListener('change', (event) => {
  const files = event.target.files;

  if (files.length > 0) {
      const file = files[0];

      // Vérifie si le fichier est une image
      if (file.type.startsWith("image/")) {
          // Filtrer le nom du fichier
          const originalName = file.name;
          const filteredName = originalName
              .toLowerCase() // Convertir en minuscules
              .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
              .replace(/[^a-z0-9.-]/g, ''); // Supprimer les caractères spéciaux sauf . et -


          // Créer une copie du fichier avec le nom filtré
          const filteredFile = new File([file], filteredName, { type: file.type });

          const formData = new FormData();
          formData.append('illustration', filteredFile);

          // Envoyer l'image au backend
          fetch('/changeillustrationContact', {
              method: 'POST',
              body: formData,
          })
          .then(response => {
              if (!response.ok) {
                  throw new Error('Erreur lors du téléchargement de l\'image.');
              }
              return response.json();
          })
          .then(data => {
              // gestionErrValid('#messageIllustration', data.message, data.erreur )
              getIllustrationContact()
          })
          .catch(error => {
              console.error('Erreur :', error);
          });
      } else {
          console.error('Le fichier sélectionné n\'est pas une image.');
      }
  } else {
      console.error('Aucun fichier sélectionné.');
  }
});


getIllustrationContact()

function getIllustrationContact(){
  const llustrationImg = document.querySelector('#img-illustration-contact')
  fetch('/getillustration-contact')
  .then(response => {
      if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données.');
      }
      return response.json(); // Parse la réponse en JSON
  })
  .then(data => {
          
          const timestamp = new Date().getTime();
          llustrationImg.src = `/imgcontact/${data.src}?t=${timestamp}`;
  })
  .catch(error => {
      console.error('Erreur :', error);
  });
}

})()