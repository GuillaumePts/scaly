(()=>{

    document.querySelector('#colors').addEventListener('click', () => {
        const obj = {
            Blanc: ['#eee', '#fff'],
            Noir: ['#000', '#fff'],
            Vert: ['#b7d0b1', '#00ff1a'],
            Rose: ['#ffd0d6', '#ff0021']
        };
    
        const container = document.createElement('div');
        container.style.backgroundColor = '#fff';
        container.style.padding = '20px';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '10px';
        container.style.borderRadius = '10px';
        container.style.boxShadow = '0px 0px 10px rgba(0,0,0,0.1)';
    
        const overlay = document.createElement('div');
        overlay.classList.add('overlayy');
    
        // Création du contenu de l'overlay
        const overlayContent = document.createElement('div');
        overlayContent.classList.add('overlay-content');
    
        overlay.appendChild(overlayContent);
        overlayContent.appendChild(container);
    
        document.body.appendChild(overlay);
        overlay.style.visibility = "visible";
        overlay.style.opacity = "1";
    
        for (const [name, colors] of Object.entries(obj)) {
            const item = document.createElement('div');
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            item.style.gap = '10px';
    
            item.addEventListener('click', (event) => {
                event.stopPropagation();
                choiceColor(name, colors[0], colors[1]); // Correction ici
                overlay.style.opacity = "0";
    
                setTimeout(() => {
                    overlay.style.visibility = "hidden";
                    overlay.remove();
                }, 100);
            });
    
            const colorBox = document.createElement('div');
            colorBox.style.width = '30px';
            colorBox.style.height = '30px';
            colorBox.style.borderRadius = '5px';
            colorBox.style.backgroundColor = colors[0]; // Correction ici
            colorBox.style.border = '1px solid #ccc';
    
            const label = document.createElement('p');
            label.textContent = name;
            label.style.fontFamily = 'var(--color-font)';
            label.style.fontSize = '1rem';
            label.style.color = '#000';
    
            item.appendChild(colorBox);
            item.appendChild(label);
            container.appendChild(item);
        }
    
        overlay.addEventListener('click', (event) => {
            event.stopPropagation();
            overlay.style.opacity = "0";
    
            setTimeout(() => {
                overlay.style.visibility = "hidden";
                overlay.remove();
            }, 100);
        });
    
        function preloadImages(colors) {
            for (const name in colors) {
                const img = new Image();
                img.src = `/${name}/${name}back.jpg`;
            }
        }
        preloadImages(obj);
    });
    
    function choiceColor(name, color, neon) {
        document.querySelector('.overlayy').remove();
        document.querySelector('#colors').querySelector('span').textContent = `${name}`;
        document.querySelector('#colors').style.boxShadow = `0px 0px 10px ${neon}`;
        document.querySelector('#colors').style.backgroundColor = color;
        document.querySelector('#devices').style.boxShadow = `0px 0px 10px ${neon}`;
        document.querySelector('#devices').style.backgroundColor = color;
        document.querySelector('#conf').style.backgroundColor = color;
        // Modifier la variable CSS pour le ::before
        document.documentElement.style.setProperty('--before-color', neon);
    
        const tabimg = document.querySelectorAll('.backimg');
        tabimg.forEach(img => {
            img.style.display = (img.id === name) ? "block" : "none";
        });
    }
    




})()