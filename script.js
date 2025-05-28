// Script principal pour le portfolio modernisé
// Intègre les fonctionnalités de base et les animations

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les animations AOS
    AOS.init({
        offset: 0,
        duration: 1500,
        once: true
    });
    
    // Afficher le contenu après le chargement
    setTimeout(() => {
        const loading = document.getElementById('loading');
        const content = document.getElementById('content');
        
        if (loading && content) {
            loading.style.opacity = '0';
            loading.style.visibility = 'hidden';
            content.style.display = 'block';
            
            // Forcer un reflow pour que la transition fonctionne
            void content.offsetWidth;
            
            content.style.opacity = '1';
            content.style.transform = 'translateY(0)';
        }
    }, 2000);
    
    // Initialiser le curseur personnalisé
    initCursor();
    
    // Initialiser les particules d'arrière-plan
    initParticles();
    
    // Initialiser l'indicateur de progression de défilement
    initScrollProgress();
    
    // Initialiser la machine à écrire
    initTypewriter();
    
    // Charger le script de transitions
    loadScript('/home/ubuntu/transitions.js');
});

// Fonction pour initialiser le curseur personnalisé
function initCursor() {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    
    if (!cursorDot || !cursorOutline) return;
    
    window.addEventListener('mousemove', function(e) {
        const posX = e.clientX;
        const posY = e.clientY;
        
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;
        
        // Ajouter un léger délai pour l'outline pour un effet plus fluide
        setTimeout(() => {
            cursorOutline.style.left = `${posX}px`;
            cursorOutline.style.top = `${posY}px`;
        }, 50);
    });
    
    // Effet sur les éléments interactifs
    const interactiveElements = document.querySelectorAll('a, button, .hamburg, .cancel, .theme-toggle, .skill-tag, .project-card');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorOutline.style.width = '60px';
            cursorOutline.style.height = '60px';
            cursorOutline.style.borderColor = 'var(--accent-color)';
            cursorDot.style.backgroundColor = 'var(--accent-color)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursorOutline.style.width = '40px';
            cursorOutline.style.height = '40px';
            cursorOutline.style.borderColor = 'var(--primary-color)';
            cursorDot.style.backgroundColor = 'var(--accent-color)';
        });
    });
    
    // Masquer le curseur lorsqu'il quitte la fenêtre
    document.addEventListener('mouseout', function(e) {
        if (e.relatedTarget === null) {
            cursorDot.style.opacity = '0';
            cursorOutline.style.opacity = '0';
        }
    });
    
    document.addEventListener('mouseover', function() {
        cursorDot.style.opacity = '1';
        cursorOutline.style.opacity = '1';
    });
}

// Fonction pour initialiser les particules d'arrière-plan
function initParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 80,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: '#07397b'
                },
                shape: {
                    type: 'circle',
                    stroke: {
                        width: 0,
                        color: '#000000'
                    },
                    polygon: {
                        nb_sides: 5
                    }
                },
                opacity: {
                    value: 0.5,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 2,
                        size_min: 0.1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#07397b',
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 1,
                    direction: 'none',
                    random: true,
                    straight: false,
                    out_mode: 'out',
                    bounce: false,
                    attract: {
                        enable: false,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: true,
                        mode: 'grab'
                    },
                    onclick: {
                        enable: true,
                        mode: 'push'
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 1
                        }
                    },
                    bubble: {
                        distance: 400,
                        size: 40,
                        duration: 2,
                        opacity: 8,
                        speed: 3
                    },
                    repulse: {
                        distance: 200,
                        duration: 0.4
                    },
                    push: {
                        particles_nb: 4
                    },
                    remove: {
                        particles_nb: 2
                    }
                }
            },
            retina_detect: true
        });
    }
}

// Fonction pour initialiser l'indicateur de progression de défilement
function initScrollProgress() {
    const scrollProgress = document.querySelector('.scroll-progress');
    
    if (!scrollProgress) return;
    
    window.addEventListener('scroll', () => {
        const totalHeight = document.body.scrollHeight - window.innerHeight;
        const progress = (window.pageYOffset / totalHeight) * 100;
        scrollProgress.style.width = `${progress}%`;
    });
}

// Fonction pour initialiser l'effet de machine à écrire
function initTypewriter() {
    const typewriterElement = document.querySelector('.typewriter-text');
    
    if (!typewriterElement) return;
    
    const texts = [
        'Développeur Web',
        'Spécialiste en Cybersécurité',
        'Gestionnaire de Bases de Données',
        'Expert en Réseaux'
    ];
    
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    
    function type() {
        const currentText = texts[textIndex];
        
        if (isDeleting) {
            // Supprimer des caractères
            typewriterElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50; // Plus rapide pour la suppression
        } else {
            // Ajouter des caractères
            typewriterElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100; // Plus lent pour l'écriture
        }
        
        // Logique pour changer de texte
        if (!isDeleting && charIndex === currentText.length) {
            // Pause à la fin du texte
            typingSpeed = 1500;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            // Passer au texte suivant
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typingSpeed = 500; // Pause avant de commencer le nouveau texte
        }
        
        setTimeout(type, typingSpeed);
    }
    
    // Démarrer l'effet de machine à écrire
    setTimeout(type, 1000);
}

// Fonction pour basculer le menu mobile
function toggleMenu() {
    const dropdown = document.querySelector('.dropdown');
    
    if (dropdown.style.display === 'block') {
        dropdown.style.opacity = '0';
        setTimeout(() => {
            dropdown.style.display = 'none';
        }, 300);
    } else {
        dropdown.style.display = 'block';
        setTimeout(() => {
            dropdown.style.opacity = '1';
        }, 10);
    }
}

// Fonction pour charger un script externe
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}



// --- Gestion du Mode Sombre ---

function initDarkMode() {
    const themeToggleButton = document.querySelector(".theme-toggle"); // Select the container div
    const themeIcon = themeToggleButton ? themeToggleButton.querySelector("i") : null; // Select the icon inside
    const body = document.body;
    const currentTheme = localStorage.getItem("theme");

    // Fonction pour appliquer le thème
    const applyTheme = (theme) => {
        // Debug: Add a temporary visual indicator
        // body.style.backgroundColor = theme === "dark" ? "#555" : ""; // Reset or set temporary dark background
        
        if (theme === "dark") {
            body.classList.add("dark-mode");
            if (themeIcon) themeIcon.classList.replace("fa-moon", "fa-sun");
            // Debug: Confirm class added
            // alert("Dark mode class added!"); 
        } else {
            body.classList.remove("dark-mode");
            if (themeIcon) themeIcon.classList.replace("fa-sun", "fa-moon");
            // Debug: Confirm class removed
            // alert("Dark mode class removed!");
        }
    };

    // Appliquer le thème sauvegardé ou le thème système préféré au chargement
    let initialTheme = 'light'; // Défaut
    if (currentTheme) {
        initialTheme = currentTheme;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        initialTheme = 'dark'; // Préfère le thème système si pas de sauvegarde
    }
    applyTheme(initialTheme);

    // Gérer le clic sur le bouton de thème
    if (themeToggleButton) { // Check if the button container exists
        themeToggleButton.addEventListener("click", () => { // Attach listener to the container
            console.log("Theme toggle clicked!"); // Add log
            body.classList.toggle("dark-mode");
            console.log("Body classes:", body.className); // Log body classes
            let newTheme = "light";
            if (body.classList.contains("dark-mode")) {
                newTheme = "dark";
            }
            console.log("Applying theme:", newTheme); // Log theme being applied
            applyTheme(newTheme);
            localStorage.setItem("theme", newTheme); // Sauvegarder la préférence
        });
    } else {
        console.warn("Theme toggle button not found.");
    }

    // Écouter les changements de préférence système
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            // Appliquer le thème système uniquement si aucune préférence n'est sauvegardée
            if (!localStorage.getItem('theme')) {
                const newColorScheme = e.matches ? 'dark' : 'light';
                applyTheme(newColorScheme);
            }
        });
    }
}

// Assurer que initDarkMode est appelé après le chargement initial du DOM
if (document.readyState === 'loading') {  // Loading hasn't finished yet
    document.addEventListener('DOMContentLoaded', initDarkMode);
} else {  // `DOMContentLoaded` has already fired
    initDarkMode();
}

// Marqueur pour éviter initialisations multiples si le script est inclus plusieurs fois (peu probable mais sécuritaire)
window.darkModeInitialized = true;

