#!/bin/bash

# Script d'optimisation pour le portfolio de Mohammed Ouadouch
# Ce script exécute toutes les optimisations de performance

echo "Début de l'optimisation du portfolio..."

# Installer les dépendances nécessaires
echo "Installation des dépendances..."
npm install -g clean-css-cli uglify-js html-minifier

# Créer le dossier pour les images optimisées
mkdir -p /home/ubuntu/optimized_images

# Optimisation des images
echo "Optimisation des images..."
if command -v convert &> /dev/null && command -v cwebp &> /dev/null; then
    # Trouver toutes les images
    IMAGES=$(find /home/ubuntu/upload -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \))
    
    # Pour chaque image
    for img in $IMAGES; do
        filename=$(basename "$img")
        name="${filename%.*}"
        
        echo "Optimisation de $filename..."
        
        # Créer des versions WebP
        cwebp -q 80 "$img" -o "/home/ubuntu/optimized_images/$name.webp"
        
        # Créer des versions redimensionnées pour le responsive
        convert "$img" -resize 400x -quality 80 "/home/ubuntu/optimized_images/$name-400.jpg"
        convert "$img" -resize 800x -quality 80 "/home/ubuntu/optimized_images/$name-800.jpg"
        
        # Optimiser l'original
        convert "$img" -strip -quality 85 "/home/ubuntu/optimized_images/$name.jpg"
    done
    
    echo "Optimisation des images terminée"
else
    echo "ImageMagick ou cwebp non installés. Installation..."
    apt-get update && apt-get install -y imagemagick webp
    
    # Réessayer l'optimisation
    echo "Réessai de l'optimisation des images..."
    IMAGES=$(find /home/ubuntu/upload -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \))
    
    for img in $IMAGES; do
        filename=$(basename "$img")
        name="${filename%.*}"
        
        echo "Optimisation de $filename..."
        
        # Créer des versions WebP
        cwebp -q 80 "$img" -o "/home/ubuntu/optimized_images/$name.webp"
        
        # Créer des versions redimensionnées pour le responsive
        convert "$img" -resize 400x -quality 80 "/home/ubuntu/optimized_images/$name-400.jpg"
        convert "$img" -resize 800x -quality 80 "/home/ubuntu/optimized_images/$name-800.jpg"
        
        # Optimiser l'original
        convert "$img" -strip -quality 85 "/home/ubuntu/optimized_images/$name.jpg"
    done
fi

# Minification CSS
echo "Minification des fichiers CSS..."
for css in /home/ubuntu/*_new.css; do
    output="${css%.css}.min.css"
    cleancss -o "$output" "$css"
    echo "Minifié: $css -> $output"
done

# Minification JavaScript
echo "Minification des fichiers JavaScript..."
for js in /home/ubuntu/*_new.js /home/ubuntu/transitions.js; do
    if [ -f "$js" ]; then
        output="${js%.js}.min.js"
        uglifyjs "$js" -c -m -o "$output"
        echo "Minifié: $js -> $output"
    fi
done

# Minification HTML
echo "Minification des fichiers HTML..."
for html in /home/ubuntu/*_new.html; do
    output="${html%.html}.min.html"
    html-minifier --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype --minify-css true --minify-js true -o "$output" "$html"
    echo "Minifié: $html -> $output"
done

# Création du Service Worker
echo "Création du Service Worker..."
cat > /home/ubuntu/service-worker.js << 'EOL'
// Service Worker pour le portfolio de Mohammed Ouadouch
const CACHE_NAME = 'portfolio-cache-v1';
const urlsToCache = [
    '/',
    '/index_new.min.html',
    '/about_new.min.html',
    '/skills_new.min.html',
    '/services_new.min.html',
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
EOL

# Création du fichier de chargement différé
echo "Création du fichier de chargement différé..."
cat > /home/ubuntu/lazy-load.js << 'EOL'
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
EOL

# Minifier le fichier de chargement différé
uglifyjs /home/ubuntu/lazy-load.js -c -m -o /home/ubuntu/lazy-load.min.js

# Création du fichier .htaccess pour la compression
echo "Création du fichier .htaccess pour la compression..."
cat > /home/ubuntu/.htaccess << 'EOL'
# Configuration pour la compression des ressources
# À placer dans un fichier .htaccess pour Apache

<IfModule mod_deflate.c>
    # Activer la compression pour les types de contenu suivants
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/x-javascript application/json application/xml
    
    # Niveau de compression
    DeflateCompressionLevel 9
    
    # Ne pas compresser les images (déjà compressées)
    SetEnvIfNoCase Request_URI \.(?:gif|jpe?g|png|webp|avif)$ no-gzip dont-vary
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
    <FilesMatch "\.(css|js|jpg|jpeg|png|gif|webp|avif|ico|woff|woff2)$">
        Header set Cache-Control "max-age=31536000, public"
    </FilesMatch>
    
    # En-têtes de cache pour les fichiers HTML
    <FilesMatch "\.(html|htm)$">
        Header set Cache-Control "max-age=86400, public"
    </FilesMatch>
</IfModule>
EOL

# Mise à jour des fichiers HTML pour utiliser les ressources optimisées
echo "Mise à jour des fichiers HTML pour utiliser les ressources optimisées..."
for html in /home/ubuntu/*_new.min.html; do
    # Remplacer les références aux fichiers CSS et JS
    sed -i 's/style_new.css/style_new.min.css/g' "$html"
    sed -i 's/script_new.js/script_new.min.js/g' "$html"
    sed -i 's/transitions.js/transitions.min.js/g' "$html"
    
    # Ajouter le service worker
    sed -i '/<\/head>/i \    <!-- Service Worker -->\n    <script>\n        if (\'serviceWorker\' in navigator) {\n            window.addEventListener(\'load\', function() {\n                navigator.serviceWorker.register(\'/service-worker.js\');\n            });\n        }\n    </script>' "$html"
    
    # Ajouter le chargement différé
    sed -i '/<\/head>/i \    <!-- Chargement différé -->\n    <script src="/lazy-load.min.js"></script>' "$html"
    
    # Ajouter les préchargements
    sed -i '/<head>/a \    <!-- Préchargements -->\n    <link rel="preload" href="/style_new.min.css" as="style">\n    <link rel="preload" href="/script_new.min.js" as="script">\n    <link rel="preconnect" href="https://fonts.googleapis.com">\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    <link rel="preconnect" href="https://cdnjs.cloudflare.com">\n    <link rel="preconnect" href="https://unpkg.com">' "$html"
    
    # Modifier les balises img pour le chargement différé
    sed -i 's/<img src="\([^"]*\)"/<img data-src="\1" src="data:image\/svg+xml,%3Csvg xmlns=\'http:\/\/www.w3.org\/2000\/svg\' viewBox=\'0 0 1 1\'%3E%3C\/svg%3E"/g' "$html"
done

echo "Optimisation terminée avec succès!"
echo "Les fichiers optimisés sont prêts à être déployés."
