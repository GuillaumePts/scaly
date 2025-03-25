(function() {

    
    
    document.addEventListener("DOMContentLoaded", () => {
        observtwo()
        const image = document.querySelector("#mobiledevice");
    
        if (!image) {
            console.error("L'élément image est introuvable !");
            return;
        }
    
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.intersectionRatio >= 0.8) {
                        image.style.width = " 50%";
                        
                        document.querySelector('#p1').style.opacity = "1"
                        image.style.transform = "translateX(65px) translateY(-75px)"
                        setTimeout(() => {
                            
                            document.querySelector('#descr').style.opacity = "1"
                        }, 300);
                        
                    } else {
                        image.style.width = " 35%"
                        image.style.transform = "translateX(0px) translateY(0px)"
                        document.querySelector('#p1').style.position = "absolute";
                        document.querySelector('#p1').style.opacity = "0"
            
                        document.querySelector('#descr').style.opacity = "0"
                    }
                });
            },
            { threshold: [0.8] } // 80% de visibilité
        );
    
        observer.observe(image);
    });

    function observtwo(){
        const image = document.querySelector("#two");
    
        if (!image) {
            console.error("L'élément image est introuvable !");
            return;
        }
    
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.intersectionRatio >= 0.8) {
                      
                        image.style.transform = "translateY(100px)"
                    } else {
                       image.style.transform = "translateY(0px)"
                    }
                });
            },
            { threshold: [0.80] } 
        );
    
        observer.observe(image);
    }
    

})();


