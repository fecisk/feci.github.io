// Lokácie sa načítavajú zo súboru locations.js

// Inicializácia mapy
const map = L.map('map').setView([48.7185, 21.2579], 14);

// Základná vrstva - OpenStreetMap
const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
}).addTo(map);

// Satelitná vrstva
const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles © Esri',
    maxZoom: 19
});

// Premenné
let isSatellite = false;
const markers = {};
let searchQuery = '';

// Ikony pre kategórie
const categoryIcons = {
    'Reštaurácie': 'fa-utensils',
    'Kaviarne': 'fa-coffee',
    'Pamiatky': 'fa-landmark',
    'Kultúra': 'fa-theater-masks',
    'Šport': 'fa-dumbbell',
    'Príroda': 'fa-tree',
    'default': 'fa-map-marker-alt'
};

// Získanie kategórií z lokácií
function getCategories() {
    const categoriesSet = new Set();
    locations.forEach(loc => {
        if (Array.isArray(loc.category)) {
            loc.category.forEach(cat => categoriesSet.add(cat));
        } else {
            categoriesSet.add(loc.category);
        }
    });
    return [...categoriesSet];
}

// Vytvorenie checkboxov pre kategórie
function createCategoryCheckboxes() {
    const container = document.getElementById('categories');
    const categories = getCategories();
    
    categories.forEach(category => {
        const icon = categoryIcons[category] || categoryIcons['default'];
        const label = document.createElement('label');
        label.innerHTML = `
            <input type="checkbox" checked data-category="${category}">
            <i class="fas ${icon} category-icon"></i>
            <span>${category}</span>
        `;
        
        // Automatické filtrovanie pri zmene
        const checkbox = label.querySelector('input');
        checkbox.addEventListener('change', applyFilters);
        
        container.appendChild(label);
    });
}

// Prepínanie zobrazenia filtra
function toggleFilter() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
}

// Vytvorenie vlastnej ikony s hodnotením
function createCustomIcon(color, rating) {
    return L.divIcon({
        className: 'custom-marker',
        html: `
            <div class="marker-rating">
                ${rating.toFixed(1)} <i class="fas fa-star"></i>
            </div>
            <div style="
                background: ${color};
                width: 40px;
                height: 40px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 3px solid white;
                box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <div style="
                    width: 12px;
                    height: 12px;
                    background: white;
                    border-radius: 50%;
                "></div>
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    });
}

// Pridanie markera na mapu
function addMarker(location, index) {
    const icon = createCustomIcon(location.color, location.rating);
    const marker = L.marker(location.coords, { icon: icon }).addTo(map);
    
    const stars = '<i class="fas fa-star"></i>'.repeat(Math.floor(location.rating)) + 
                  (location.rating % 1 >= 0.5 ? '<i class="fas fa-star-half-alt"></i>' : '');
    
    const popupContent = `
        <div class="custom-popup">
            <strong>${location.name}</strong>
            <div class="popup-meta">
                ${Array.isArray(location.category) 
                    ? location.category.map((cat, idx) => {
                        const catColor = location.categoryColors && location.categoryColors[idx] 
                            ? location.categoryColors[idx] 
                            : location.color;
                        return `<span class="popup-badge category-badge" style="background: ${catColor}; color: white;">${cat}</span>`;
                    }).join('')
                    : `<span class="popup-badge category-badge" style="background: ${location.color}; color: white;">${location.category}</span>`
                }
                <span class="popup-badge price-badge">${location.price}</span>
                <span class="popup-badge rating-badge">
                    ${location.rating.toFixed(1)} <i class="fas fa-star"></i>
                </span>
            </div>
            <div class="popup-description">${location.description}</div>
            <button class="view-detail-btn" onclick="showDetail(${index})">
                <i class="fas fa-info-circle"></i> Zobraziť detail
            </button>
        </div>
    `;

        // Event keď sa otvorí popup - skryť hodnotenie
    marker.on('popupopen', function() {
        const ratingElement = marker.getElement().querySelector('.marker-rating');
        if (ratingElement) {
            ratingElement.style.display = 'none';
        }
    });

    // Event keď sa zatvorí popup - zobraziť hodnotenie
    marker.on('popupclose', function() {
        const ratingElement = marker.getElement().querySelector('.marker-rating');
        if (ratingElement) {
            ratingElement.style.display = 'block';
        }
    });
    
    marker.bindPopup(popupContent);
    markers[index] = marker;
    
    // Uloženie údajov do markera pre filtrovanie
    marker.locationData = location;
}

// Aplikovanie filtrov
function applyFilters() {
    // Získanie vybraných kategórií
    const categoryCheckboxes = document.querySelectorAll('#categories input[type="checkbox"]');
    const activeCategories = Array.from(categoryCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.dataset.category);
    
    // Získanie vybraných cien
    const priceCheckboxes = document.querySelectorAll('.price-filters input[type="checkbox"]');
    const activePrices = Array.from(priceCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.dataset.price);
    
    // Získanie minimálneho hodnotenia
    const minRating = parseFloat(document.getElementById('rating-slider').value);
    
    // Filtrovanie markerov (bez search query, to riešime osobitne)
    Object.keys(markers).forEach(id => {
        const marker = markers[id];
        const location = marker.locationData;
        
        const categoryMatch = Array.isArray(location.category) 
            ? location.category.some(cat => activeCategories.includes(cat))
            : activeCategories.includes(location.category);
        const priceMatch = activePrices.includes(location.price);
        const ratingMatch = location.rating >= minRating;
        
        if (categoryMatch && priceMatch && ratingMatch) {
            map.addLayer(marker);
        } else {
            map.removeLayer(marker);
        }
    });
}

// Resetovanie filtrov
function resetFilters() {
    // Reset kategórií
    document.querySelectorAll('#categories input[type="checkbox"]').forEach(cb => {
        cb.checked = true;
    });
    
    // Reset cien
    document.querySelectorAll('.price-filters input[type="checkbox"]').forEach(cb => {
        cb.checked = true;
    });
    
    // Reset hodnotenia
    document.getElementById('rating-slider').value = 0;
    document.getElementById('rating-value-text').textContent = '0';
    
    // Aplikovať filtre
    applyFilters();
}

// Zobrazenie detailu miesta
function showDetail(locationId) {
    const location = locations[locationId];
    
    document.getElementById('detail-name').textContent = location.name;
    
    // Kategórie
    const categoriesContainer = document.getElementById('detail-categories');
    categoriesContainer.innerHTML = '';
    if (Array.isArray(location.category)) {
        location.category.forEach((cat, idx) => {
            const badge = document.createElement('span');
            badge.className = 'detail-category-badge';
            badge.textContent = cat;
            const catColor = location.categoryColors && location.categoryColors[idx] 
                ? location.categoryColors[idx] 
                : location.color;
            badge.style.background = catColor;
            badge.style.color = 'white';
            categoriesContainer.appendChild(badge);
        });
    } else {
        const badge = document.createElement('span');
        badge.className = 'detail-category-badge';
        badge.textContent = location.category;
        badge.style.background = location.color;
        badge.style.color = 'white';
        categoriesContainer.appendChild(badge);
    }
    
    document.getElementById('detail-price').textContent = location.price;
    
    const stars = '<i class="fas fa-star"></i>'.repeat(Math.floor(location.rating)) + 
                  (location.rating % 1 >= 0.5 ? '<i class="fas fa-star-half-alt"></i>' : '');
    document.getElementById('detail-rating').innerHTML = `${location.rating.toFixed(1)} ${stars}`;
    
    document.getElementById('detail-description').textContent = location.description;
    
    loadGallery(location.photos);
    
    document.getElementById('detail-page').classList.remove('hidden');
}

// Zatvorenie detailu
function closeDetail() {
    document.getElementById('detail-page').classList.add('hidden');
}

// Načítanie fotogalérie
let currentPhotos = [];
let currentPhotoIndex = 0;

function loadGallery(photos) {
    const gallery = document.getElementById('photo-gallery');
    gallery.innerHTML = '';
    
    if (!photos || photos.length === 0) {
        gallery.innerHTML = '<p style="color: #999;">Žiadne fotografie</p>';
        return;
    }
    
    currentPhotos = photos;
    
    photos.forEach((photoUrl, index) => {
        const img = document.createElement('img');
        img.src = photoUrl;
        img.alt = 'Fotografia';
        img.onclick = () => openLightbox(index);
        gallery.appendChild(img);
    });
}

// Otvorenie lightboxu
function openLightbox(photoIndex) {
    currentPhotoIndex = photoIndex;
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const counter = document.getElementById('lightbox-counter');
    
    lightboxImage.src = currentPhotos[currentPhotoIndex];
    counter.textContent = `${currentPhotoIndex + 1} / ${currentPhotos.length}`;
    lightbox.classList.add('active');
    
    // Zabráň scrollovaniu na pozadí
    document.body.style.overflow = 'hidden';
}

// Zatvorenie lightboxu
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

// Ďalšia fotka
function nextPhoto() {
    currentPhotoIndex = (currentPhotoIndex + 1) % currentPhotos.length;
    document.getElementById('lightbox-image').src = currentPhotos[currentPhotoIndex];
    document.getElementById('lightbox-counter').textContent = `${currentPhotoIndex + 1} / ${currentPhotos.length}`;
}

// Predchádzajúca fotka
function prevPhoto() {
    currentPhotoIndex = (currentPhotoIndex - 1 + currentPhotos.length) % currentPhotos.length;
    document.getElementById('lightbox-image').src = currentPhotos[currentPhotoIndex];
    document.getElementById('lightbox-counter').textContent = `${currentPhotoIndex + 1} / ${currentPhotos.length}`;
}

// Event listenery pre lightbox
document.addEventListener('DOMContentLoaded', function() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const closeBtn = document.getElementById('lightbox-close-btn');
    const prevBtn = document.getElementById('lightbox-prev-btn');
    const nextBtn = document.getElementById('lightbox-next-btn');
    
    // Zatvorenie pri kliknutí na pozadie
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Zabráň zatvoreniu pri kliknutí na obrázok
    lightboxImage.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Tlačidlá
    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        prevPhoto();
    });
    nextBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        nextPhoto();
    });
});

// Klávesové skratky pre lightbox
document.addEventListener('keydown', function(e) {
    const lightbox = document.getElementById('lightbox');
    if (lightbox.classList.contains('active')) {
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowRight') {
            nextPhoto();
        } else if (e.key === 'ArrowLeft') {
            prevPhoto();
        }
    }
});

// Funkcia na vycentrovanie mapy na všetky viditeľné body
function centerMap() {
    const visibleMarkers = Object.values(markers).filter(marker => map.hasLayer(marker));
    if (visibleMarkers.length > 0) {
        const group = L.featureGroup(visibleMarkers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

// Funkcia na lokalizáciu používateľa
let userMarker = null;

function locateUser() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                
                // Ak už existuje marker používateľa, odstráň ho
                if (userMarker) {
                    map.removeLayer(userMarker);
                }
                
                // Vytvor nový marker pre používateľa
                userMarker = L.marker([userLat, userLng], {
                    icon: L.divIcon({
                        className: 'user-location-marker',
                        html: `
                            <div style="
                                background: #4285f4;
                                width: 20px;
                                height: 20px;
                                border-radius: 50%;
                                border: 3px solid white;
                                box-shadow: 0 0 10px rgba(66, 133, 244, 0.5);
                            "></div>
                        `,
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    })
                }).addTo(map);
                
                // Vycentruj mapu na používateľa
                map.setView([userLat, userLng], 15);
            },
            function(error) {
                alert('Nepodarilo sa získať tvoju polohu. Skontroluj povolenia v prehliadači.');
                console.error('Geolocation error:', error);
            }
        );
    } else {
        alert('Tvoj prehliadač nepodporuje geolokáciu.');
    }
}

// Slider pre hodnotenie - aktualizácia hodnoty
document.getElementById('rating-slider').addEventListener('input', function(e) {
    document.getElementById('rating-value-text').textContent = e.target.value;
    applyFilters(); // Automatické filtrovanie pri zmene
});

// Event listenery pre cenové checkboxy
document.addEventListener('DOMContentLoaded', function() {
    // Pridanie event listenerov na cenové checkboxy
    setTimeout(() => {
        document.querySelectorAll('.price-filters input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', applyFilters);
        });
    }, 100);
});

// Vyhľadávanie
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');
const searchResults = document.getElementById('search-results');

searchInput.addEventListener('input', function(e) {
    searchQuery = e.target.value;
    
    // Zobraz/skry tlačidlo na vymazanie
    if (searchQuery.length > 0) {
        clearSearchBtn.classList.add('visible');
        showSearchResults();
    } else {
        clearSearchBtn.classList.remove('visible');
        hideSearchResults();
    }
});

// Zobrazenie výsledkov vyhľadávania
function showSearchResults() {
    if (searchQuery.length === 0) {
        hideSearchResults();
        return;
    }
    
    // Nájdi lokácie ktoré obsahujú hľadaný text
    const results = locations.filter(location => 
        location.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-no-results">Žiadne výsledky</div>';
        searchResults.classList.add('visible');
        return;
    }
    
    // Vytvor HTML pre výsledky
    searchResults.innerHTML = results.map((location, originalIndex) => {
        const locationIndex = locations.indexOf(location);
        const imageUrl = location.photos && location.photos.length > 0 ? 
            location.photos[0] : null;
        
        return `
            <div class="search-result-item" onclick="selectSearchResult(${locationIndex})">
                ${imageUrl ? 
                    `<img src="${imageUrl}" alt="${location.name}" class="search-result-image">` :
                    `<div class="search-result-image no-image"><i class="fas fa-map-marker-alt"></i></div>`
                }
                <div class="search-result-info">
                    <div class="search-result-name">${location.name}</div>
                    <div class="search-result-meta">
                        ${Array.isArray(location.category)
                            ? location.category.map((cat, idx) => {
                                const catColor = location.categoryColors && location.categoryColors[idx]
                                    ? location.categoryColors[idx]
                                    : location.color;
                                return `<span class="search-result-badge category" style="background: ${catColor}; color: white;">${cat}</span>`;
                            }).join('')
                            : `<span class="search-result-badge category" style="background: ${location.color}; color: white;">${location.category}</span>`
                        }
                        <span class="search-result-badge price">${location.price}</span>
                        <span class="search-result-badge rating">
                            ${location.rating.toFixed(1)} <i class="fas fa-star"></i>
                        </span>
                    </div>
                    <div class="search-result-description">${location.description}</div>
                </div>
            </div>
        `;
    }).join('');
    
    searchResults.classList.add('visible');
}

// Skrytie výsledkov vyhľadávania
function hideSearchResults() {
    searchResults.classList.remove('visible');
}

// Výber výsledku vyhľadávania
function selectSearchResult(locationIndex) {
    const location = locations[locationIndex];
    const marker = markers[locationIndex];
    
    // Zoomni na lokáciu
    map.setView(location.coords, 17);
    
    // Otvor popup markera
    marker.openPopup();
    
    // Skry výsledky
    hideSearchResults();
    
    clearSearch();
}

// Vymazanie vyhľadávania
function clearSearch() {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.classList.remove('visible');
    hideSearchResults();
}

// Pridanie všetkých miest na mapu
locations.forEach((location, index) => addMarker(location, index));

// Vytvorenie checkboxov
createCategoryCheckboxes();

// Povolenie zoomu kolieskom myši
map.scrollWheelZoom.enable();

// Event listener pre zmenu veľkosti okna
window.addEventListener('resize', function() {
    map.invalidateSize();

});
