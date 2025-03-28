(function() {

    
    
    
        const cards = document.querySelectorAll(".cardplus");
    
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const card = entry.target;
                const cardImg = card.querySelector(".cardimg");
                const cardText = card.querySelector(".cardtext");
                const back = card.querySelector(".back");
                const h3 = back.querySelector('h3')
    
                if (entry.intersectionRatio >= 0.8) {
                    // Quand la carte est visible à 90%, animation
                    cardImg.style.transform = "translateY(-20px) scale(1.05) "; // Monte de 30px (100px → 70px)
                    cardText.style.transform = "translateY(20px) scale(1.05)"; // Descend de 30px
                    setTimeout(() => {
                        h3.style.opacity = "1"
                        h3.style.transform = "translate(-50%,-50%) scale(1.05)"
                    }, 100);
                } else {
                    // Quand la carte quitte l'écran, retour à l'origine
                    
                    h3.style.opacity = "0"
                    h3.style.transform = "translate(-50%,-50%) scale(0.5)"
                    setTimeout(() => {
                        cardImg.style.transform = "translateY(100px) scale(1.0)";
                    cardText.style.transform = "translateY(0px) scale(1.0)";
                    }, 100);
                }
            });
        }, {
            threshold: 0.8 // Déclenche à 90% de visibilité
        });
    
        cards.forEach(card => observer.observe(card));

    
        
    

})();


