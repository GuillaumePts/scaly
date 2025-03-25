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
                        image.style.width = " 80%";
                        
                        document.querySelector('#p1').style.opacity = "1"
                        image.style.transform = "translateX(20px)"
                        setTimeout(() => {
                            
                            document.querySelector('#descr').style.opacity = "1"
                        }, 300);
                        
                    } else {
                        image.style.width = " 50%"
                        image.style.transform = "translateX(0px)"
                        document.querySelector('#p1').style.position = "absolute";
                        document.querySelector('#p1').style.opacity = "0"
            
                        document.querySelector('#descr').style.opacity = "0"
                    }
                });
            },
            { threshold: [0.8] } // 80% de visibilité
        );
    
        observer.observe(image);


        const image2 = document.querySelector("#two");
    
        if (!image2) {
            console.error("L'élément image est introuvable !");
            return;
        }
    
        const observer2 = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.intersectionRatio >= 0.2) {
                        
                        image2.style.transform = "translateY(-100px)"
                    } else {
                        image2.style.transform = "translateY(0px)"
                    }
                });
            },
            { threshold: [0.20] } 
        );
    
        observer2.observe(image2);
    

    });

    
        
    

})();


