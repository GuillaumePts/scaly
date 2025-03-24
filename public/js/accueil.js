(function() {

    
    
    document.addEventListener("DOMContentLoaded", () => {
        const image = document.querySelector("#mobiledevice");
    
        if (!image) {
            console.error("L'élément image est introuvable !");
            return;
        }
    
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.intersectionRatio >= 0.8) {
                        image.style.width = " 50%";; // Décalage à droite
                    } else {
                        image.style.width = " 100%"
                    }
                });
            },
            { threshold: [0.8] } // 80% de visibilité
        );
    
        observer.observe(document.querySelector('#one'));
    });
    

})();


