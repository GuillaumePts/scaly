(function() {

    
    
    
        const cards = document.querySelectorAll(".cardplus");
    
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const card = entry.target;
                const cardImg = card.querySelector(".cardimg");
                const cardText = card.querySelector(".cardtext");
    
                if (entry.intersectionRatio >= 0.8) {
                    // Quand la carte est visible à 90%, animation
                    cardImg.style.transform = "translateY(-20px) scale(1.05) "; // Monte de 30px (100px → 70px)
                    cardText.style.transform = "translateY(20px) scale(1.05)"; // Descend de 30px
                } else {
                    // Quand la carte quitte l'écran, retour à l'origine
                    cardImg.style.transform = "translateY(100px) scale(1.0)";
                    cardText.style.transform = "translateY(0px) scale(1.0)";
                }
            });
        }, {
            threshold: 0.8 // Déclenche à 90% de visibilité
        });
    
        cards.forEach(card => observer.observe(card));

    
        
    

})();


