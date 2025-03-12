(function() {

    
    
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
})();


function getaccueil(data){

    
    const presentation = document.querySelector('#presentation-1')
    presentation.textContent=data.textprofile

    const prestat = document.querySelector('#listeprestations')
    if(data.prestations.length == 0){
        const li = document.createElement('li')
            li.textContent= "Aucune préstation n'est proposée pour le moment."
            prestat.appendChild(li)
    }else{
        data.prestations.forEach(el => {
            if(!el){
                console.log('bite');
            }
            const li = document.createElement('li')
            li.textContent= el
            prestat.appendChild(li)
        });
    }
    
}