// Optimisation des performances pour le portfolio
// Ce script compresse et optimise les ressources pour un chargement plus rapide

// Configuration des images
const imageConfig = {
    formats: ['webp', 'avif'], // Formats modernes à utiliser
    sizes: [400, 800, 1200],   // Tailles responsives
    quality: 80                // Qualité d'image (%)
};

// Configuration de mise en cache
const cacheConfig = {
    assets: {
        maxAge: 2592000, // 30 jours en secondes
        files: ['.css', '.js', '.woff2', '.jpg', '.png', '.webp', '.avif']
    },
    html: {
        maxAge: 86400 // 1 jour en secondes
    }
};

// Optimisation des images
function optimizeImages() {
    // Vérifier si les outils d'optimisation sont installés
    const checkTools = `which convert && which cwebp && which avifenc`;
    
    // Créer le dossier d'images optimisées
    const createOptDir = `mkdir -p /home/ubuntu/optimized_images`;
    
    // Trouver toutes les images
    const findImages = `find /home/ubuntu/upload -type f -name "*.jpg" -o -name "*.jpeg" -o -name "*.png"`;
    
    // Optimiser chaque image
    const optimizeScript = `
    #!/bin/bash
    
    # Créer le dossier d'images optimisées
    mkdir -p /home/ubuntu/optimized_images
    
    # Trouver toutes les images
    IMAGES=$(find /home/ubuntu/upload -type f \\( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \\))
    
    # Pour chaque image
    for img in $IMAGES; do
        filename=$(basename "$img")
        name="${filename%.*}"
        
        # Créer des versions WebP
        cwebp -q 80 "$img" -o "/home/ubuntu/optimized_images/$name.webp"
        
        # Créer des versions AVIF si disponible
        if command -v avifenc &> /dev/null; then
            avifenc -q 60 "$img" "/home/ubuntu/optimized_images/$name.avif"
        fi
        
        # Créer des versions redimensionnées pour le responsive
        convert "$img" -resize 400x -quality 80 "/home/ubuntu/optimized_images/$name-400.jpg"
        convert "$img" -resize 800x -quality 80 "/home/ubuntu/optimized_images/$name-800.jpg"
        convert "$img" -resize 1200x -quality 80 "/home/ubuntu/optimized_images/$name-1200.jpg"
        
        # Optimiser l'original
        convert "$img" -strip -quality 85 "/home/ubuntu/optimized_images/$name.jpg"
    done
    
    echo "Optimisation des images terminée"
    `;
    
    // Écrire le script d'optimisation
    const writeScript = `echo '${optimizeScript}' > /home/ubuntu/optimize_images.sh && chmod +x /home/ubuntu/optimize_images.sh`;
    
    // Exécuter le script
    const runScript = `/home/ubuntu/optimize_images.sh`;
    
    return {
        checkTools,
        createOptDir,
        findImages,
        writeScript,
        runScript
    };
}

// Minification CSS
function minifyCSS() {
    const cssMinScript = `
    #!/bin/bash
    
    # Installer clean-css si nécessaire
    if ! command -v cleancss &> /dev/null; then
        npm install -g clean-css-cli
    fi
    
    # Minifier les fichiers CSS
    for css in /home/ubuntu/*_new.css; do
        output="${css%.css}.min.css"
        cleancss -o "$output" "$css"
        echo "Minifié: $css -> $output"
    done
    `;
    
    // Écrire le script de minification CSS
    const writeCssScript = `echo '${cssMinScript}' > /home/ubuntu/minify_css.sh && chmod +x /home/ubuntu/minify_css.sh`;
    
    // Exécuter le script
    const runCssScript = `/home/ubuntu/minify_css.sh`;
    
    return {
        writeCssScript,
        runCssScript
    };
}

// Minification JavaScript
function minifyJS() {
    const jsMinScript = `
    #!/bin/bash
    
    # Installer uglify-js si nécessaire
    if ! command -v uglifyjs &> /dev/null; then
        npm install -g uglify-js
    fi
    
    # Minifier les fichiers JS
    for js in /home/ubuntu/*_new.js /home/ubuntu/transitions.js; do
        if [ -f "$js" ]; then
            output="${js%.js}.min.js"
            uglifyjs "$js" -c -m -o "$output"
            echo "Minifié: $js -> $output"
        fi
    done
    `;
    
    // Écrire le script de minification JS
    const writeJsScript = `echo '${jsMinScript}' > /home/ubuntu/minify_js.sh && chmod +x /home/ubuntu/minify_js.sh`;
    
    // Exécuter le script
    const runJsScript = `/home/ubuntu/minify_js.sh`;
    
    return {
        writeJsScript,
        runJsScript
    };
}

// Optimisation HTML
function optimizeHTML() {
    const htmlOptScript = `
    #!/bin/bash
    
    # Installer html-minifier si nécessaire
    if ! command -v html-minifier &> /dev/null; then
        npm install -g html-minifier
    fi
    
    # Minifier les fichiers HTML
    for html in /home/ubuntu/*_new.html; do
        output="${html%.html}.min.html"
        html-minifier --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype --minify-css true --minify-js true -o "$output" "$html"
        echo "Minifié: $html -> $output"
    done
    `;
    
    // Écrire le script d'optimisation HTML
    const writeHtmlScript = `echo '${htmlOptScript}' > /home/ubuntu/minify_html.sh && chmod +x /home/ubuntu/minify_html.sh`;
    
    // Exécuter le script
    const runHtmlScript = `/home/ubuntu/minify_html.sh`;
    
    return {
        writeHtmlScript,
        runHtmlScript
    };
}

// Création d'un Service Worker pour le cache
function createServiceWorker() {
    const serviceWorkerCode = `
    // Service Worker pour le portfolio de Mohammed Ouadouch
    const CACHE_NAME = 'portfolio-cache-v1';
    const urlsToCache = [
        '/',
        '/index_new.html',
        '/about_new.html',
        '/skills_new.html',
        '/services_new.html',
        '/style_new.min.css',
        '/script_new.min.js',
        '/transitions.min.js',
        '/optimized_images/'
    ];
    
    // Installation du Service Worker
    self.addEventListener('install', event => {
        event.waitUntil(
            caches.open(CACHE_NAME)
                .then(cache => {
                    console.log('Cache ouvert');
                    return cache.addAll(urlsToCache);
                })
        );
    });
    
    // Stratégie de cache: Network First, puis cache
    self.addEventListener('fetch', event => {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Cloner la réponse
                    const responseToCache = response.clone();
                    
                    // Mettre en cache la nouvelle réponse
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                })
                .catch(() => {
                    // Si le réseau échoue, utiliser le cache
                    return caches.match(event.request);
                })
        );
    });
    
    // Nettoyage des anciens caches
    self.addEventListener('activate', event => {
        const cacheWhitelist = [CACHE_NAME];
        
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheWhitelist.indexOf(cacheName) === -1) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
        );
    });
    `;
    
    return serviceWorkerCode;
}

// Création d'un fichier de configuration pour le chargement différé
function createLazyLoadConfig() {
    const lazyLoadCode = `
    // Configuration pour le chargement différé des ressources
    document.addEventListener('DOMContentLoaded', function() {
        // Chargement différé des images
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        
                        // Charger l'image srcset si disponible
                        if (img.dataset.srcset) {
                            img.srcset = img.dataset.srcset;
                        }
                        
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            lazyImages.forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // Fallback pour les navigateurs qui ne supportent pas IntersectionObserver
            let lazyLoadThrottleTimeout;
            
            function lazyLoad() {
                if (lazyLoadThrottleTimeout) {
                    clearTimeout(lazyLoadThrottleTimeout);
                }
                
                lazyLoadThrottleTimeout = setTimeout(() => {
                    const scrollTop = window.pageYOffset;
                    
                    lazyImages.forEach(img => {
                        if (img.offsetTop < window.innerHeight + scrollTop) {
                            img.src = img.dataset.src;
                            
                            if (img.dataset.srcset) {
                                img.srcset = img.dataset.srcset;
                            }
                            
                            img.classList.add('loaded');
                        }
                    });
                    
                    if (lazyImages.length === 0) {
                        document.removeEventListener('scroll', lazyLoad);
                        window.removeEventListener('resize', lazyLoad);
                        window.removeEventListener('orientationChange', lazyLoad);
                    }
                }, 20);
            }
            
            document.addEventListener('scroll', lazyLoad);
            window.addEventListener('resize', lazyLoad);
            window.addEventListener('orientationChange', lazyLoad);
        }
        
        // Chargement différé des scripts non critiques
        setTimeout(() => {
            const lazyScripts = document.querySelectorAll('script[data-src]');
            
            lazyScripts.forEach(script => {
                const newScript = document.createElement('script');
                
                if (script.dataset.type) {
                    newScript.type = script.dataset.type;
                }
                
                newScript.src = script.dataset.src;
                document.body.appendChild(newScript);
            });
        }, 3000); // Charger après 3 secondes
    });
    `;
    
    return lazyLoadCode;
}

// Création d'un fichier de configuration pour le préchargement
function createPreloadConfig() {
    const preloadCode = `
    // Configuration pour le préchargement des ressources critiques
    const preloadLinks = [
        { rel: 'preload', href: '/style_new.min.css', as: 'style' },
        { rel: 'preload', href: '/script_new.min.js', as: 'script' },
        { rel: 'preload', href: '/transitions.min.js', as: 'script' },
        { rel: 'preload', href: '/optimized_images/WhatsApp Image 2024-09-09 at 11.54.07.webp', as: 'image' },
        { rel: 'preload', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css', as: 'style' },
        { rel: 'preload', href: 'https://unpkg.com/aos@next/dist/aos.css', as: 'style' },
        { rel: 'preload', href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap', as: 'style' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
        { rel: 'preconnect', href: 'https://cdnjs.cloudflare.com' },
        { rel: 'preconnect', href: 'https://unpkg.com' }
    ];
    
    // Fonction pour ajouter les liens de préchargement
    function addPreloadLinks() {
        const head = document.head;
        
        preloadLinks.forEach(link => {
            const preloadLink = document.createElement('link');
            
            Object.keys(link).forEach(key => {
                preloadLink.setAttribute(key, link[key]);
            });
            
            head.appendChild(preloadLink);
        });
    }
    
    // Ajouter les liens de préchargement dès que possible
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addPreloadLinks);
    } else {
        addPreloadLinks();
    }
    `;
    
    return preloadCode;
}

// Création d'un fichier de configuration pour la compression
function createCompressionConfig() {
    const compressionConfig = `
    # Configuration pour la compression des ressources
    # À placer dans un fichier .htaccess pour Apache
    
    <IfModule mod_deflate.c>
        # Activer la compression pour les types de contenu suivants
        AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/x-javascript application/json application/xml
        
        # Niveau de compression
        DeflateCompressionLevel 9
        
        # Ne pas compresser les images (déjà compressées)
        SetEnvIfNoCase Request_URI \\.(?:gif|jpe?g|png|webp|avif)$ no-gzip dont-vary
    </IfModule>
    
    # Configuration pour le cache
    <IfModule mod_expires.c>
        ExpiresActive On
        
        # Cache par défaut
        ExpiresDefault "access plus 1 month"
        
        # HTML
        ExpiresByType text/html "access plus 1 day"
        
        # CSS et JavaScript
        ExpiresByType text/css "access plus 1 year"
        ExpiresByType text/javascript "access plus 1 year"
        ExpiresByType application/javascript "access plus 1 year"
        
        # Images
        ExpiresByType image/jpeg "access plus 1 year"
        ExpiresByType image/png "access plus 1 year"
        ExpiresByType image/webp "access plus 1 year"
        ExpiresByType image/avif "access plus 1 year"
        
        # Polices
        ExpiresByType font/woff "access plus 1 year"
        ExpiresByType font/woff2 "access plus 1 year"
        ExpiresByType application/font-woff "access plus 1 year"
        ExpiresByType application/font-woff2 "access plus 1 year"
    </IfModule>
    
    # En-têtes de cache
    <IfModule mod_headers.c>
        # Désactiver ETags
        Header unset ETag
        FileETag None
        
        # En-têtes de cache pour les ressources statiques
        <FilesMatch "\\.(css|js|jpg|jpeg|png|gif|webp|avif|ico|woff|woff2)$">
            Header set Cache-Control "max-age=31536000, public"
        </FilesMatch>
        
        # En-têtes de cache pour les fichiers HTML
        <FilesMatch "\\.(html|htm)$">
            Header set Cache-Control "max-age=86400, public"
        </FilesMatch>
    </IfModule>
    `;
    
    return compressionConfig;
}

// Création d'un fichier de configuration pour l'optimisation des polices
function createFontOptimizationConfig() {
    const fontOptimizationCode = `
    // Configuration pour l'optimisation des polices
    
    // Stratégie de chargement des polices
    document.addEventListener('DOMContentLoaded', function() {
        // Vérifier si les polices sont déjà en cache
        if (sessionStorage.getItem('fontsLoaded')) {
            document.documentElement.classList.add('fonts-loaded');
            return;
        }
        
        // Utiliser Font Face Observer pour détecter le chargement des polices
        const fontPoppins = new FontFaceObserver('Poppins');
        const fontMontserrat = new FontFaceObserver('Montserrat');
        
        Promise.all([
            fontPoppins.load(null, 5000),  // Timeout de 5 secondes
            fontMontserrat.load(null, 5000)
        ]).then(() => {
            document.documentElement.classList.add('fonts-loaded');
            sessionStorage.setItem('fontsLoaded', true);
        }).catch(err => {
            console.warn('Certaines polices n\\'ont pas pu être chargées:', err);
        });
    });
    
    // Ajouter des styles pour les polices de secours
    const fontFallbackStyles = \`
        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        .fonts-loaded body {
            font-family: 'Poppins', sans-serif;
        }
        
        h1, h2, h3, h4, h5, h6, .logo, .footer-logo {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        .fonts-loaded h1, 
        .fonts-loaded h2, 
        .fonts-loaded h3, 
        .fonts-loaded h4, 
        .fonts-loaded h5, 
        .fonts-loaded h6, 
        .fonts-loaded .logo, 
        .fonts-loaded .footer-logo {
            font-family: 'Montserrat', sans-serif;
        }
    \`;
    
    // Ajouter les styles de secours au chargement de la page
    const style = document.createElement('style');
    style.textContent = fontFallbackStyles;
    document.head.appendChild(style);
    `;
    
    return fontOptimizationCode;
}

// Création d'un fichier de configuration pour l'optimisation des performances
function createPerformanceConfig() {
    const performanceConfig = `
    // Configuration pour l'optimisation des performances
    
    // Mesurer les performances
    function measurePerformance() {
        // Vérifier si l'API Performance est disponible
        if (!window.performance || !window.performance.timing) {
            console.warn('API Performance non disponible');
            return;
        }
        
        // Attendre que la page soit complètement chargée
        window.addEventListener('load', () => {
            setTimeout(() => {
                const timing = window.performance.timing;
                
                // Calculer les métriques de performance
                const metrics = {
                    // Temps de chargement total
                    loadTime: timing.loadEventEnd - timing.navigationStart,
                    
                    // Temps jusqu'au premier rendu
                    firstPaint: timing.responseEnd - timing.navigationStart,
                    
                    // Temps de téléchargement du DOM
                    domLoading: timing.domComplete - timing.domLoading,
                    
                    // Temps de téléchargement des ressources
                    resourcesTime: timing.loadEventStart - timing.domContentLoadedEventEnd,
                    
                    // Temps de connexion au serveur
                    connectionTime: timing.responseEnd - timing.requestStart,
                    
                    // Temps de traitement du serveur
                    serverTime: timing.responseStart - timing.requestStart
                };
                
                // Enregistrer les métriques dans la console
                console.log('Métriques de performance:', metrics);
                
                // Envoyer les métriques à un service d'analyse (à implémenter)
                // sendMetricsToAnalytics(metrics);
            }, 0);
        });
    }
    
    // Optimiser les animations
    function optimizeAnimations() {
        // Utiliser requestAnimationFrame pour les animations
        const scrollElements = document.querySelectorAll('.parallax, .scroll-progress');
        
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    // Mettre à jour les éléments basés sur le défilement
                    const scrollPosition = window.pageYOffset;
                    
                    scrollElements.forEach(element => {
                        if (element.classList.contains('parallax')) {
                            const speed = element.dataset.speed || 0.5;
                            element.style.transform = \`translateY(\${scrollPosition * speed}px)\`;
                        } else if (element.classList.contains('scroll-progress')) {
                            const totalHeight = document.body.scrollHeight - window.innerHeight;
                            const progress = (scrollPosition / totalHeight) * 100;
                            element.style.width = \`\${progress}%\`;
                        }
                    });
                    
                    ticking = false;
                });
                
                ticking = true;
            }
        });
    }
    
    // Optimiser les gestionnaires d'événements
    function optimizeEventListeners() {
        // Utiliser la délégation d'événements
        document.addEventListener('click', (e) => {
            // Gérer les clics sur les liens
            if (e.target.closest('a')) {
                // Logique pour les liens
            }
            
            // Gérer les clics sur les boutons
            if (e.target.closest('button')) {
                // Logique pour les boutons
            }
            
            // Gérer les clics sur les cartes de projet
            if (e.target.closest('.project-card')) {
                // Logique pour les cartes de projet
            }
        });
    }
    
    // Initialiser les optimisations de performance
    document.addEventListener('DOMContentLoaded', () => {
        measurePerformance();
        optimizeAnimations();
        optimizeEventListeners();
    });
    `;
    
    return performanceConfig;
}

// Exporter les fonctions
module.exports = {
    optimizeImages,
    minifyCSS,
    minifyJS,
    optimizeHTML,
    createServiceWorker,
    createLazyLoadConfig,
    createPreloadConfig,
    createCompressionConfig,
    createFontOptimizationConfig,
    createPerformanceConfig
};
