/**
 * Transitions et améliorations d'expérience utilisateur pour le portfolio
 * Ce script ajoute des transitions de page fluides et améliore l'interactivité
 */

// Gestionnaire de transitions de page
class PageTransitionManager {
    constructor() {
        this.isTransitioning = false;
        this.currentPage = window.location.pathname.split('/').pop() || 'index.html';
        this.initTransitions();
    }

    initTransitions() {
        // Intercepter tous les clics sur les liens internes
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;
            
            // Vérifier si c'est un lien interne (même domaine)
            const url = new URL(link.href, window.location.origin);
            const isSameDomain = url.origin === window.location.origin;
            const isAnchor = link.getAttribute('href').startsWith('#');
            
            // Ne pas intercepter les liens externes ou les ancres
            if (!isSameDomain || isAnchor) return;
            
            // Empêcher la navigation par défaut
            e.preventDefault();
            
            // Effectuer la transition si nous ne sommes pas déjà en transition
            if (!this.isTransitioning) {
                this.navigateTo(link.href);
            }
        });
    }

    async navigateTo(url) {
        this.isTransitioning = true;
        
        // Animation de sortie
        await this.animatePageOut();
        
        // Charger la nouvelle page
        try {
            const response = await fetch(url);
            const html = await response.text();
            
            // Extraire le contenu principal
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const newContent = doc.getElementById('content');
            
            // Mettre à jour le titre
            document.title = doc.title;
            
            // Mettre à jour l'URL sans recharger la page
            window.history.pushState({}, '', url);
            
            // Remplacer le contenu
            const currentContent = document.getElementById('content');
            currentContent.innerHTML = newContent.innerHTML;
            
            // Animation d'entrée
            await this.animatePageIn();
            
            // Réinitialiser les scripts et animations
            this.reinitializeScripts();
        } catch (error) {
            console.error('Erreur lors de la navigation:', error);
            window.location.href = url; // Fallback à la navigation traditionnelle
        }
        
        this.isTransitioning = false;
    }

    async animatePageOut() {
        return new Promise(resolve => {
            const content = document.getElementById('content');
            content.style.opacity = '0';
            content.style.transform = 'translateY(20px)';
            
            setTimeout(resolve, 500); // Attendre que l'animation soit terminée
        });
    }

    async animatePageIn() {
        return new Promise(resolve => {
            const content = document.getElementById('content');
            content.style.opacity = '0';
            content.style.transform = 'translateY(20px)';
            
            // Forcer un reflow pour que la transition fonctionne
            void content.offsetWidth;
            
            content.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            content.style.opacity = '1';
            content.style.transform = 'translateY(0)';
            
            setTimeout(resolve, 500); // Attendre que l'animation soit terminée
        });
    }

    reinitializeScripts() {
        // Réinitialiser AOS
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
        
        // Réinitialiser les particules
        if (typeof particlesJS !== 'undefined') {
            initParticles();
        }
        
        // Réinitialiser le curseur personnalisé
        initCursor();
        
        // Réinitialiser les barres de progression dans la page compétences
        if (window.location.pathname.includes('skills')) {
            const progressBars = document.querySelectorAll('.skill-progress-fill');
            progressBars.forEach(bar => {
                const progress = bar.style.getPropertyValue('--progress');
                bar.style.width = '0';
                setTimeout(() => {
                    bar.style.width = progress;
                }, 300);
            });
        }
        
        // Réinitialiser le slider de témoignages dans la page services
        if (window.location.pathname.includes('services')) {
            initTestimonialSlider();
        }
    }
}

// Amélioration de la navigation par défilement
class SmoothScroller {
    constructor() {
        this.initSmoothScroll();
    }

    initSmoothScroll() {
        // Intercepter les clics sur les liens d'ancrage
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;
            
            const href = link.getAttribute('href');
            if (!href || !href.startsWith('#')) return;
            
            e.preventDefault();
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                this.scrollToElement(targetElement);
            }
        });
    }

    scrollToElement(element) {
        const headerOffset = 80; // Hauteur de l'en-tête
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Gestionnaire d'état du formulaire de contact
class ContactFormManager {
    constructor() {
        this.form = document.querySelector('.contact-form');
        if (this.form) {
            this.initFormValidation();
        }
    }

    initFormValidation() {
        const inputs = this.form.querySelectorAll('input, textarea');
        
        // Validation en temps réel
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.validateInput(input);
            });
            
            input.addEventListener('blur', () => {
                this.validateInput(input);
            });
        });
        
        // Soumission du formulaire
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            let isValid = true;
            
            // Valider tous les champs
            inputs.forEach(input => {
                if (!this.validateInput(input)) {
                    isValid = false;
                }
            });
            
            if (isValid) {
                this.submitForm();
            }
        });
    }

    validateInput(input) {
        const value = input.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        // Règles de validation
        if (input.required && value === '') {
            isValid = false;
            errorMessage = 'Ce champ est requis';
        } else if (input.type === 'email' && value !== '') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Veuillez entrer une adresse email valide';
            }
        }
        
        // Afficher/masquer l'erreur
        let errorElement = input.parentElement.querySelector('.error-message');
        
        if (!isValid) {
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'error-message';
                input.parentElement.appendChild(errorElement);
            }
            errorElement.textContent = errorMessage;
            input.classList.add('invalid');
        } else {
            if (errorElement) {
                errorElement.remove();
            }
            input.classList.remove('invalid');
            input.classList.add('valid');
        }
        
        return isValid;
    }

    submitForm() {
        const submitBtn = this.form.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        
        // Animation de chargement
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
        submitBtn.disabled = true;
        
        // Simuler l'envoi (à remplacer par un vrai envoi AJAX)
        setTimeout(() => {
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Message envoyé!';
            submitBtn.classList.add('success');
            
            // Réinitialiser le formulaire
            this.form.reset();
            
            // Rétablir le bouton après 3 secondes
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                submitBtn.classList.remove('success');
                
                // Réinitialiser les classes de validation
                this.form.querySelectorAll('input, textarea').forEach(input => {
                    input.classList.remove('valid');
                });
            }, 3000);
        }, 2000);
    }
}

// Gestionnaire de thème (mode jour/nuit)
class ThemeManager {
    constructor() {
        this.themeToggle = document.querySelector('.theme-toggle');
        this.initThemeToggle();
        this.loadSavedTheme();
    }

    initThemeToggle() {
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    toggleTheme() {
        const body = document.body;
        const icon = this.themeToggle.querySelector('i');
        
        if (body.classList.contains('light-mode')) {
            body.classList.remove('light-mode');
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.add('light-mode');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            localStorage.setItem('theme', 'light');
        }
    }

    loadSavedTheme() {
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
            if (this.themeToggle) {
                const icon = this.themeToggle.querySelector('i');
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        }
    }
}

// Gestionnaire d'animations au défilement avancé
class ScrollAnimationManager {
    constructor() {
        this.initScrollAnimations();
    }

    initScrollAnimations() {
        // Observer pour les éléments avec la classe .fade-in
        const fadeElements = document.querySelectorAll('.fade-in');
        
        if (fadeElements.length > 0) {
            const fadeObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        fadeObserver.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px'
            });
            
            fadeElements.forEach(element => {
                fadeObserver.observe(element);
            });
        }
        
        // Observer pour les éléments avec effet parallaxe
        const parallaxElements = document.querySelectorAll('.parallax');
        
        if (parallaxElements.length > 0) {
            window.addEventListener('scroll', () => {
                parallaxElements.forEach(element => {
                    const scrollPosition = window.pageYOffset;
                    const speed = element.dataset.speed || 0.5;
                    element.style.transform = `translateY(${scrollPosition * speed}px)`;
                });
            });
        }
    }
}

// Initialisation des gestionnaires
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser les gestionnaires d'expérience utilisateur
    const pageTransitionManager = new PageTransitionManager();
    const smoothScroller = new SmoothScroller();
    const contactFormManager = new ContactFormManager();
    const themeManager = new ThemeManager();
    const scrollAnimationManager = new ScrollAnimationManager();
    
    // Ajouter la classe pour les animations d'entrée initiales
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 300);
});

// Fonction pour initialiser le slider de témoignages
function initTestimonialSlider() {
    const track = document.querySelector('.testimonial-track');
    const slides = document.querySelectorAll('.testimonial-slide');
    const indicators = document.querySelectorAll('.testimonial-indicator');
    const prevButton = document.querySelector('.testimonial-control.prev');
    const nextButton = document.querySelector('.testimonial-control.next');
    
    if (!track || !slides.length) return;
    
    let currentIndex = 0;
    const slideWidth = 100; // En pourcentage
    
    // Fonction pour mettre à jour le slider
    function updateSlider() {
        track.style.transform = `translateX(-${currentIndex * slideWidth}%)`;
        
        // Mettre à jour les indicateurs
        indicators.forEach((indicator, index) => {
            if (index === currentIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }
    
    // Événements des boutons
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            currentIndex = (currentIndex > 0) ? currentIndex - 1 : slides.length - 1;
            updateSlider();
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            currentIndex = (currentIndex < slides.length - 1) ? currentIndex + 1 : 0;
            updateSlider();
        });
    }
    
    // Événements des indicateurs
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentIndex = index;
            updateSlider();
        });
    });
    
    // Défilement automatique
    let autoSlideInterval = setInterval(() => {
        currentIndex = (currentIndex < slides.length - 1) ? currentIndex + 1 : 0;
        updateSlider();
    }, 5000);
    
    // Arrêter le défilement automatique au survol
    track.addEventListener('mouseenter', () => {
        clearInterval(autoSlideInterval);
    });
    
    // Reprendre le défilement automatique à la sortie
    track.addEventListener('mouseleave', () => {
        autoSlideInterval = setInterval(() => {
            currentIndex = (currentIndex < slides.length - 1) ? currentIndex + 1 : 0;
            updateSlider();
        }, 5000);
    });
}
