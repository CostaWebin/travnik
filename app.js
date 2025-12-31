// Main application logic for Herbal Guide PWA
console.log('<i class="ph-bold ph-rocket"></i> App starting...');

let deferredPrompt = null;
let currentView = 'plants';
let searchTimeout = null;
let selectedCategory = 'All';
let translations = null; // Will be loaded from plants_db.json
let medicalDisclaimer = '';

// Load translations from plants_db.json
async function loadTranslations() {
    try {
        const response = await fetch('plants_db.json');
        const data = await response.json();
        
        if (data.translations) {
            translations = data.translations.interface;
            medicalDisclaimer = data.metadata.disclaimer;
            console.log('<i class="ph-bold ph-translate"></i> Translations loaded');
        }
    } catch (error) {
        console.error('<i class="ph-bold ph-x-circle"></i> Error loading translations:', error);
        // Use default translations if loading fails
        translations = {
            searchPlaceholderPlant: 'Введите название растения...',
            searchPlaceholderDisease: 'Введите название болезни...',
            emptyStateTitle: 'Начните поиск',
            emptyStateTextPlant: 'Введите название растения, например "ромашка" или "мята"',
            emptyStateTextDisease: 'Введите название болезни или выберите категорию',
            noResultsTitle: 'Ничего не найдено',
            noResultsText: 'Попробуйте изменить запрос',
            properties: 'Свойства',
            helpsWith: 'Помогает при заболеваниях',
            recommendedPlants: 'Рекомендуемые растения',
            recipe: 'Рецепт',
            dosage: 'Дозировка',
            notes: 'Примечания',
            addToFavorites: 'Добавить в избранное',
            removeFromFavorites: 'Удалить из избранного',
            inFavorites: 'В избранном',
            shareRecipes: 'Поделиться рецептами',
            exportFavorites: 'Экспортировать избранное',
            tipsTitle: 'Знаете ли вы?',
            refreshTip: 'Другой совет',
            recentlyViewed: 'Недавно просмотренные',
            favoritesEmpty: 'Избранное пусто',
            favoritesEmptyText: 'Добавьте растения или болезни в избранное для быстрого доступа'
        };
        medicalDisclaimer = '⚠️ ВНИМАНИЕ: Эта информация носит справочный характер. Перед применением любых лекарственных растений обязательно проконсультируйтесь с врачом.';
    }
}

// Get translation with fallback
function t(key) {
    return translations && translations[key] ? translations[key] : key;
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('<i class="ph-bold ph-device-mobile"></i> DOM loaded, initializing app...');
    
    try {
        // Load translations first
        await loadTranslations();
        
        // Initialize database
        await initDatabase();
        console.log('<i class="ph-bold ph-check-circle"></i> Database initialized');
        
        // Setup navigation
        setupNavigation();
        
        // Setup install prompt
        setupInstallPrompt();
        
        // Setup offline detection
        setupOfflineDetection();
        
        // Add medical disclaimer banner
        addMedicalDisclaimerBanner();
        
        // Load initial view
        loadPlantsView();
        
        console.log('<i class="ph-bold ph-check-circle"></i> App initialized successfully');
        
    } catch (error) {
        console.error('<i class="ph-bold ph-x-circle"></i> App initialization failed:', error);
        showError('Ошибка инициализации приложения');
    }
});

// Setup bottom navigation
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-item');
    
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            navButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Load corresponding view
            const tab = button.dataset.tab;
            currentView = tab;
            
            switch(tab) {
                case 'plants':
                    loadPlantsView();
                    break;
                case 'diseases':
                    loadDiseasesView();
                    break;
                case 'favorites':
                    loadFavoritesView();
                    break;
            }
        });
    });
    
    console.log('<i class="ph-bold ph-check-circle"></i> Navigation setup complete');
}

// Setup PWA install prompt
function setupInstallPrompt() {
    const installBanner = document.getElementById('installBanner');
    const installButton = document.getElementById('installButton');
    const dismissButton = document.getElementById('dismissInstall');
    
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('<i class="ph-bold ph-floppy-disk"></i> Install prompt available');
        e.preventDefault();
        deferredPrompt = e;
        
        // Show install banner
        installBanner.style.display = 'flex';
    });
    
    // Install button click
    installButton.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log(`User response: ${outcome}`);
        deferredPrompt = null;
        installBanner.style.display = 'none';
    });
    
    // Dismiss button click
    dismissButton.addEventListener('click', () => {
        installBanner.style.display = 'none';
    });
    
    console.log('<i class="ph-bold ph-check-circle"></i> Install prompt setup complete');
}

// Add medical disclaimer banner
function addMedicalDisclaimerBanner() {
    const banner = document.createElement('div');
    banner.className = 'medical-disclaimer-banner';
    banner.innerHTML = `
        <div class="disclaimer-content">
            <span class="disclaimer-icon"><i class="ph-bold ph-warning"></i></span>
            <span class="disclaimer-text">${medicalDisclaimer}</span>
            <button class="disclaimer-close" onclick="this.parentElement.parentElement.style.display='none'">
                <i class="ph-bold ph-x"></i>
            </button>
        </div>
    `;
    document.body.insertBefore(banner, document.body.firstChild);
}

// Setup offline detection
function setupOfflineDetection() {
    // Create offline indicator
    const indicator = document.createElement('div');
    indicator.className = 'offline-indicator';
    indicator.id = 'offlineIndicator';
    indicator.innerHTML = '<span><i class="ph-bold ph-warning"></i></span><span>Работаете оффлайн</span>';
    document.body.appendChild(indicator);
    
    // Check online status
    function updateOnlineStatus() {
        const isOnline = navigator.onLine;
        const indicator = document.getElementById('offlineIndicator');
        
        if (!isOnline) {
            indicator.classList.add('show');
            indicator.classList.remove('online');
            indicator.innerHTML = '<span><i class="ph-bold ph-warning"></i></span><span>Работаете оффлайн</span>';
            console.log('<i class="ph-bold ph-wifi-slash"></i> Offline mode');
        } else {
            indicator.classList.add('online');
            indicator.innerHTML = '<span><i class="ph-bold ph-check-circle"></i></span><span>Снова онлайн</span>';
            console.log('<i class="ph-bold ph-wifi-high"></i> Online mode');
            
            // Hide after 3 seconds
            setTimeout(() => {
                indicator.classList.remove('show');
            }, 3000);
        }
    }
    
    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Initial check
    updateOnlineStatus();
    
    console.log('<i class="ph-bold ph-check-circle"></i> Offline detection setup complete');
}

// ============ PLANTS VIEW ============

function loadPlantsView() {
    const main = document.getElementById('appMain');
    
    main.innerHTML = `
        <div class="view-container">
            <h2 style="margin-bottom: var(--herbal-space-md); color: var(--herbal-primary);"><i class="ph-bold ph-plant"></i> Поиск по растениям</h2>
            
            <div class="search-container">
                <div class="search-wrapper">
                    <input 
                        type="text" 
                        class="search-box" 
                        id="plantSearch" 
                        placeholder="Введите название растения..."
                        autocomplete="off"
                    >
                    <button class="clear-search" id="clearPlantSearch" title="Очистить"><i class="ph-bold ph-x"></i></button>
                </div>
                <div class="autocomplete-dropdown" id="plantAutocomplete"></div>
            </div>
            
            <div class="results-container" id="plantResults">
                <div class="empty-state">
                    <div class="empty-state-icon"><i class="ph-bold ph-magnifying-glass"></i></div>
                    <h3>Начните поиск</h3>
                    <p>Введите название растения, например "ромашка" или "мята"</p>
                </div>
            </div>
            
            ${showTipOfTheDay()}
            ${showRecentlyViewed()}
        </div>
        
        <!-- Plant detail modal -->
        <div class="modal-overlay" id="plantModal">
            <div class="modal-content" id="plantModalContent">
                <!-- Content will be inserted dynamically -->
            </div>
        </div>
    `;
    
    // Setup search
    const searchBox = document.getElementById('plantSearch');
    const autocomplete = document.getElementById('plantAutocomplete');
    const clearButton = document.getElementById('clearPlantSearch');
    
    searchBox.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        // Show/hide clear button
        clearButton.classList.toggle('show', query.length > 0);
        
        // Clear previous timeout
        if (searchTimeout) clearTimeout(searchTimeout);
        
        // Hide autocomplete if empty
        if (query.length === 0) {
            autocomplete.classList.remove('show');
            showEmptyState('plantResults', 'plants');
            return;
        }
        
        // Debounce search (300ms)
        searchTimeout = setTimeout(() => {
            searchPlants(query);
        }, 300);
    });
    
    // Clear search button
    clearButton.addEventListener('click', () => {
        searchBox.value = '';
        clearButton.classList.remove('show');
        autocomplete.classList.remove('show');
        showEmptyState('plantResults', 'plants');
        searchBox.focus();
    });
    
    // Handle Enter key
    searchBox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const query = e.target.value.trim();
            if (query.length > 0) {
                searchPlants(query);
                autocomplete.classList.remove('show');
            }
        } else if (e.key === 'Escape') {
            autocomplete.classList.remove('show');
        }
    });
    
    // Close autocomplete when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            autocomplete.classList.remove('show');
        }
    });
    
    // Close modal when clicking overlay
    const modal = document.getElementById('plantModal');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
    
    console.log('<i class="ph-bold ph-file-text"></i> Loaded plants view');
}

async function searchPlants(query) {
    const autocomplete = document.getElementById('plantAutocomplete');
    const resultsContainer = document.getElementById('plantResults');
    
    try {
        const plants = await DatabaseManager.searchPlantsByName(query);
        
        if (plants.length === 0) {
            autocomplete.classList.remove('show');
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon"><i class="ph-bold ph-smiley-sad"></i></div>
                    <h3>Ничего не найдено</h3>
                    <p>Попробуйте изменить запрос</p>
                </div>
            `;
            return;
        }
        
        // Show autocomplete
        autocomplete.innerHTML = plants.map(plant => `
            <div class="autocomplete-item" data-plant-id="${plant.id}">
                <div class="autocomplete-item-icon"><i class="ph ph-plant"></i></div>
                <div class="autocomplete-item-text">
                    <div class="autocomplete-item-name">${plant.name}</div>
                    <div class="autocomplete-item-desc">${plant.description}</div>
                </div>
            </div>
        `).join('');
        
        autocomplete.classList.add('show');
        
        // Also show as cards
        displayPlantCards(plants);
        
        // Add click handlers to autocomplete items
        autocomplete.querySelectorAll('.autocomplete-item').forEach(item => {
            item.addEventListener('click', async () => {
                const plantId = parseInt(item.dataset.plantId);
                await showPlantDetail(plantId);
                autocomplete.classList.remove('show');
            });
        });
        
    } catch (error) {
        console.error('<i class="ph-bold ph-x-circle"></i> Search error:', error);
        showError('Ошибка поиска');
    }
}

function displayPlantCards(plants) {
    const resultsContainer = document.getElementById('plantResults');
    
    resultsContainer.innerHTML = `
        <div class="card-grid">
            ${plants.map(plant => {
                const isFavorite = checkFavorite('plant', plant.id);
                return `
                    <div class="card favorite-card" data-plant-id="${plant.id}">
                        ${isFavorite ? '<div class="favorite-badge"><i class="ph-bold ph-star"></i></div>' : ''}
                        <div class="card-header">
                            <div class="card-icon"><i class="ph ph-plant"></i></div>
                            <div class="card-title">
                                <div class="card-name">${plant.name}</div>
                            </div>
                        </div>
                        <div class="card-description">${plant.description}</div>
                        <div class="card-properties">${plant.properties}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    // Add click handlers
    resultsContainer.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', async () => {
            const plantId = parseInt(card.dataset.plantId);
            await showPlantDetail(plantId);
        });
    });
}

async function showPlantDetail(plantId) {
    try {
        const plant = await DatabaseManager.getPlantById(plantId);
        const diseases = await DatabaseManager.getDiseasesForPlant(plantId);
        
        const modalContent = document.getElementById('plantModalContent');
        const isFavorite = checkFavorite('plant', plantId);
        
        // Check if plant is toxic
        const isToxic = plant.toxicity && plant.toxicity.includes('Токсичное');
        const toxicityWarning = isToxic ? `
            <div class="toxicity-warning">
                <div class="toxicity-icon"><i class="ph-bold ph-warning"></i></div>
                <div class="toxicity-content">
                    <div class="toxicity-title">${plant.toxicity}</div>
                    <div class="toxicity-text">Обязательно проконсультируйтесь с врачом перед применением!</div>
                </div>
            </div>
        ` : '';
        
        modalContent.innerHTML = `
            <div class="modal-header">
                <div class="modal-icon">${plant.imagePath || '<i class="ph ph-plant"></i>'}</div>
                <div class="modal-title-section">
                    <h2 class="modal-title">${plant.name}</h2>
                    ${plant.latinName ? `<p class="modal-latin">${plant.latinName}</p>` : ''}
                    <p class="modal-subtitle">${plant.description}</p>
                </div>
                <button class="modal-close" onclick="closeModal('plantModal')"><i class="ph-bold ph-x"></i></button>
            </div>
            
            <div class="modal-body">
                ${toxicityWarning}
                
                <div class="modal-section">
                    <h3 class="modal-section-title"><i class="ph-bold ph-clipboard-text"></i> ${t('properties')}</h3>
                    <div class="modal-section-content">${plant.properties}</div>
                </div>
                
                ${plant.uses && plant.uses.length > 0 ? `
                    <div class="modal-section">
                        <h3 class="modal-section-title"><i class="ph-bold ph-list"></i> Применение</h3>
                        <ul class="uses-list">
                            ${plant.uses.map(use => `<li>${use}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                <div class="modal-section">
                    <h3 class="modal-section-title"><i class="ph-bold ph-pill"></i> Помогает при заболеваниях</h3>
                    ${diseases.length > 0 ? `
                        <ul class="disease-list">
                            ${diseases.map(disease => `
                                <li class="disease-item">
                                    <div class="disease-item-name">
                                        <i class="ph-bold ph-caret-right"></i> ${disease.name}
                                    </div>
                                    <div class="recipe-section">
                                        <div class="recipe-label">Рецепт:</div>
                                        <div class="recipe-text">${disease.recipe}</div>
                                        <div class="recipe-label">Дозировка:</div>
                                        <div class="recipe-text">${disease.dosage}</div>
                                        ${disease.notes ? `
                                            <div class="recipe-notes"><i class="ph-bold ph-warning"></i> ${disease.notes}</div>
                                        ` : ''}
                                    </div>
                                </li>
                            `).join('')}
                        </ul>
                    ` : '<p style="color: var(--herbal-text-secondary);">Информация пока не добавлена</p>'}
                </div>
                
                <button class="favorite-btn ${isFavorite ? 'active' : ''}" onclick="toggleFavorite('plant', ${plantId})">
                    <span>${isFavorite ? '<i class="ph-bold ph-star"></i>' : '<i class="ph ph-star"></i>'}</span>
                    <span>${isFavorite ? t('inFavorites') : t('addToFavorites')}</span>
                </button>
                
                ${diseases.length > 0 ? `
                    <button class="share-button" onclick="shareRecipe('plant', ${plantId})">
                        <span><i class="ph-bold ph-export"></i></span>
                        <span>${t('shareRecipes')}</span>
                    </button>
                ` : ''}
            </div>
        `;
        
        document.getElementById('plantModal').classList.add('show');
        
    } catch (error) {
        console.error('<i class="ph-bold ph-x-circle"></i> Error showing plant detail:', error);
        showError('Ошибка загрузки данных');
    }
}

// ============ DISEASES VIEW ============

function loadDiseasesView() {
    const main = document.getElementById('appMain');
    selectedCategory = 'All';
    
    main.innerHTML = `
        <div class="view-container">
            <h2 style="margin-bottom: var(--herbal-space-md); color: var(--herbal-primary);"><i class="ph-bold ph-pill"></i> Поиск по болезням</h2>
            
            <div class="category-filters" id="categoryFilters">
                <button class="category-chip active" data-category="All">Все</button>
                <button class="category-chip" data-category="Respiratory">Дыхательные</button>
                <button class="category-chip" data-category="Digestive">Пищеварение</button>
                <button class="category-chip" data-category="Nervous System">Нервная система</button>
                <button class="category-chip" data-category="Pain">Боль</button>
                <button class="category-chip" data-category="Skin">Кожа</button>
                <button class="category-chip" data-category="Other">Прочее</button>
            </div>
            
            <div class="search-container">
                <div class="search-wrapper">
                    <input 
                        type="text" 
                        class="search-box" 
                        id="diseaseSearch" 
                        placeholder="Введите название болезни..."
                        autocomplete="off"
                    >
                    <button class="clear-search" id="clearDiseaseSearch" title="Очистить"><i class="ph-bold ph-x"></i></button>
                </div>
                <div class="autocomplete-dropdown" id="diseaseAutocomplete"></div>
            </div>
            
            <div class="results-container" id="diseaseResults">
                <div class="empty-state">
                    <div class="empty-state-icon"><i class="ph-bold ph-magnifying-glass"></i></div>
                    <h3>Начните поиск</h3>
                    <p>Введите название болезни или выберите категорию</p>
                </div>
            </div>
            
            ${showTipOfTheDay()}
            ${showRecentlyViewed()}
        </div>
        
        <!-- Disease detail modal -->
        <div class="modal-overlay" id="diseaseModal">
            <div class="modal-content" id="diseaseModalContent">
                <!-- Content will be inserted dynamically -->
            </div>
        </div>
    `;
    
    setupCategoryFilters();
    
    const searchBox = document.getElementById('diseaseSearch');
    const autocomplete = document.getElementById('diseaseAutocomplete');
    const clearButton = document.getElementById('clearDiseaseSearch');
    
    searchBox.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        clearButton.classList.toggle('show', query.length > 0);
        
        if (searchTimeout) clearTimeout(searchTimeout);
        
        if (query.length === 0) {
            autocomplete.classList.remove('show');
            if (selectedCategory !== 'All') {
                loadDiseasesByCategory(selectedCategory);
            } else {
                showEmptyState('diseaseResults', 'diseases');
            }
            return;
        }
        
        searchTimeout = setTimeout(() => {
            searchDiseases(query);
        }, 300);
    });
    
    clearButton.addEventListener('click', () => {
        searchBox.value = '';
        clearButton.classList.remove('show');
        autocomplete.classList.remove('show');
        if (selectedCategory !== 'All') {
            loadDiseasesByCategory(selectedCategory);
        } else {
            showEmptyState('diseaseResults', 'diseases');
        }
        searchBox.focus();
    });
    
    searchBox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const query = e.target.value.trim();
            if (query.length > 0) {
                searchDiseases(query);
                autocomplete.classList.remove('show');
            }
        } else if (e.key === 'Escape') {
            autocomplete.classList.remove('show');
        }
    });
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            autocomplete.classList.remove('show');
        }
    });
    
    const modal = document.getElementById('diseaseModal');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
    
    console.log('<i class="ph-bold ph-file-text"></i> Loaded diseases view');
}

function setupCategoryFilters() {
    const filters = document.querySelectorAll('.category-chip');
    
    filters.forEach(filter => {
        filter.addEventListener('click', () => {
            filters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            
            const category = filter.dataset.category;
            selectedCategory = category;
            
            const searchBox = document.getElementById('diseaseSearch');
            if (searchBox) {
                searchBox.value = '';
                document.getElementById('clearDiseaseSearch').classList.remove('show');
            }
            
            if (category === 'All') {
                showEmptyState('diseaseResults', 'diseases');
            } else {
                loadDiseasesByCategory(category);
            }
        });
    });
}

async function loadDiseasesByCategory(category) {
    try {
        const diseases = await DatabaseManager.getDiseasesByCategory(category);
        
        if (diseases.length === 0) {
            document.getElementById('diseaseResults').innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon"><i class="ph-bold ph-smiley-sad"></i></div>
                    <h3>Ничего не найдено</h3>
                    <p>В этой категории пока нет данных</p>
                </div>
            `;
            return;
        }
        
        displayDiseaseCards(diseases);
        
    } catch (error) {
        console.error('<i class="ph-bold ph-x-circle"></i> Error loading diseases:', error);
        showError('Ошибка загрузки данных');
    }
}

async function searchDiseases(query) {
    const autocomplete = document.getElementById('diseaseAutocomplete');
    const resultsContainer = document.getElementById('diseaseResults');
    
    try {
        const diseases = await DatabaseManager.searchDiseasesByName(query, selectedCategory);
        
        if (diseases.length === 0) {
            autocomplete.classList.remove('show');
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon"><i class="ph-bold ph-smiley-sad"></i></div>
                    <h3>Ничего не найдено</h3>
                    <p>Попробуйте изменить запрос или выбрать другую категорию</p>
                </div>
            `;
            return;
        }
        
        autocomplete.innerHTML = diseases.map(disease => `
            <div class="autocomplete-item" data-disease-id="${disease.id}">
                <div class="autocomplete-item-icon"><i class="ph-bold ph-pill"></i></div>
                <div class="autocomplete-item-text">
                    <div class="autocomplete-item-name">${disease.name}</div>
                    <div class="autocomplete-item-desc">${disease.description}</div>
                </div>
            </div>
        `).join('');
        
        autocomplete.classList.add('show');
        displayDiseaseCards(diseases);
        
        autocomplete.querySelectorAll('.autocomplete-item').forEach(item => {
            item.addEventListener('click', async () => {
                const diseaseId = parseInt(item.dataset.diseaseId);
                await showDiseaseDetail(diseaseId);
                autocomplete.classList.remove('show');
            });
        });
        
    } catch (error) {
        console.error('<i class="ph-bold ph-x-circle"></i> Search error:', error);
        showError('Ошибка поиска');
    }
}

function displayDiseaseCards(diseases) {
    const resultsContainer = document.getElementById('diseaseResults');
    
    const categoryIcons = {
        'Respiratory': '<i class="ph-bold ph-lungs"></i>',
        'Digestive': '<i class="ph-bold ph-bowl-food"></i>',
        'Nervous System': '<i class="ph-bold ph-brain"></i>',
        'Pain': '<i class="ph-bold ph-warning-circle"></i>',
        'Skin': '<i class="ph-bold ph-bandage"></i>',
        'Other': '<i class="ph-bold ph-pill"></i>'
    };
    
    resultsContainer.innerHTML = `
        <div class="card-grid">
            ${diseases.map(disease => {
                const isFavorite = checkFavorite('disease', disease.id);
                return `
                    <div class="disease-card favorite-card" data-disease-id="${disease.id}">
                        ${isFavorite ? '<div class="favorite-badge"><i class="ph-bold ph-star"></i></div>' : ''}
                        <div class="disease-card-header">
                            <div class="disease-card-icon">${categoryIcons[disease.category] || '💊'}</div>
                            <div class="disease-card-title">
                                <div class="disease-card-name">${disease.name}</div>
                            </div>
                        </div>
                        <div class="disease-card-description">${disease.description}</div>
                        <span class="disease-card-category">${disease.category}</span>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    resultsContainer.querySelectorAll('.disease-card').forEach(card => {
        card.addEventListener('click', async () => {
            const diseaseId = parseInt(card.dataset.diseaseId);
            await showDiseaseDetail(diseaseId);
        });
    });
}

async function showDiseaseDetail(diseaseId) {
    try {
        const disease = await DatabaseManager.getDiseaseById(diseaseId);
        const plants = await DatabaseManager.getPlantsForDisease(diseaseId);
        
        const modalContent = document.getElementById('diseaseModalContent');
        const isFavorite = checkFavorite('disease', diseaseId);
        
        const categoryIcons = {
            'Respiratory': '<i class="ph-bold ph-lungs"></i>',
            'Digestive': '<i class="ph-bold ph-bowl-food"></i>',
            'Nervous System': '<i class="ph-bold ph-brain"></i>',
            'Pain': '<i class="ph-bold ph-warning-circle"></i>',
            'Skin': '<i class="ph-bold ph-bandage"></i>',
            'Other': '<i class="ph-bold ph-pill"></i>'
        };
        
        modalContent.innerHTML = `
            <div class="modal-header">
                <div class="modal-icon">${categoryIcons[disease.category] || '<i class="ph-bold ph-pill"></i>'}</div>
                <div class="modal-title-section">
                    <h2 class="modal-title">${disease.name}</h2>
                    <p class="modal-subtitle">${disease.description}</p>
                </div>
                <button class="modal-close" onclick="closeModal('diseaseModal')"><i class="ph-bold ph-x"></i></button>
            </div>
            
            <div class="modal-body">
                <div class="modal-section">
                    <h3 class="modal-section-title"><i class="ph ph-plant"></i> Рекомендуемые растения</h3>
                    ${plants.length > 0 ? `
                        <div class="plant-list">
                            ${plants.map(plant => `
                                <div class="plant-list-item" onclick="openPlantFromDisease(${plant.id})">
                                    <div class="plant-item-header">
                                        <span class="plant-item-icon"><i class="ph ph-plant"></i></span>
                                        <span class="plant-item-name">${plant.name}</span>
                                        <span class="plant-item-arrow"><i class="ph-bold ph-arrow-right"></i></span>
                                    </div>
                                    <div class="recipe-section">
                                        <div class="recipe-label">Рецепт:</div>
                                        <div class="recipe-text">${plant.recipe}</div>
                                        <div class="recipe-label">Дозировка:</div>
                                        <div class="recipe-text">${plant.dosage}</div>
                                        ${plant.notes ? `
                                            <div class="recipe-notes"><i class="ph-bold ph-warning"></i> ${plant.notes}</div>
                                        ` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p style="color: var(--herbal-text-secondary);">Информация пока не добавлена</p>'}
                </div>
                
                <button class="favorite-btn ${isFavorite ? 'active' : ''}" onclick="toggleFavorite('disease', ${diseaseId})">
                    <span>${isFavorite ? '<i class="ph-bold ph-star"></i>' : '<i class="ph ph-star"></i>'}</span>
                    <span>${isFavorite ? 'В избранном' : 'Добавить в избранное'}</span>
                </button>
                
                ${plants.length > 0 ? `
                    <button class="share-button" onclick="shareRecipe('disease', ${diseaseId})">
                        <span><i class="ph-bold ph-export"></i></span>
                        <span>Поделиться рецептами</span>
                    </button>
                ` : ''}
            </div>
        `;
        
        document.getElementById('diseaseModal').classList.add('show');
        
    } catch (error) {
        console.error('<i class="ph-bold ph-x-circle"></i> Error showing disease detail:', error);
        showError('Ошибка загрузки данных');
    }
}

async function openPlantFromDisease(plantId) {
    closeModal('diseaseModal');
    setTimeout(async () => {
        await showPlantDetail(plantId);
    }, 300);
}

// ============ FAVORITES VIEW ============

async function loadFavoritesView() {
    const main = document.getElementById('appMain');
    
    const favorites = JSON.parse(localStorage.getItem('favorites') || '{"plants": [], "diseases": []}');
    const favoritePlantIds = favorites.plants;
    const favoriteDiseaseIds = favorites.diseases;
    
    main.innerHTML = `
        <div class="view-container">
            <h2 style="margin-bottom: var(--herbal-space-lg); color: var(--herbal-primary);"><i class="ph-bold ph-star"></i> Избранное</h2>
            
            <div id="favoritesContent">
                <div class="loading-spinner"></div>
            </div>
        </div>
    `;
    
    try {
        // Load favorite plants
        const favoritePlants = [];
        for (const id of favoritePlantIds) {
            const plant = await DatabaseManager.getPlantById(id);
            if (plant) favoritePlants.push(plant);
        }
        
        // Load favorite diseases
        const favoriteDiseases = [];
        for (const id of favoriteDiseaseIds) {
            const disease = await DatabaseManager.getDiseaseById(id);
            if (disease) favoriteDiseases.push(disease);
        }
        
        // Display favorites
        const content = document.getElementById('favoritesContent');
        
        if (favoritePlants.length === 0 && favoriteDiseases.length === 0) {
            content.innerHTML = `
                <div class="favorites-empty">
                    <div class="favorites-empty-icon"><i class="ph-bold ph-star"></i></div>
                    <h3>Избранное пусто</h3>
                    <p>Добавьте растения или болезни в избранное для быстрого доступа</p>
                </div>
            `;
            return;
        }
        
        content.innerHTML = `
            ${favoritePlants.length > 0 ? `
                <div class="favorites-section">
                    <div class="favorites-section-header">
                        <span class="favorites-section-icon"><i class="ph-bold ph-plant"></i></span>
                        <h3 class="favorites-section-title">Растения</h3>
                        <span class="favorites-section-count">${favoritePlants.length}</span>
                    </div>
                    <div class="card-grid">
                        ${favoritePlants.map(plant => `
                            <div class="card favorite-card" data-plant-id="${plant.id}">
                                <div class="favorite-badge"><i class="ph-bold ph-star"></i></div>
                                <div class="card-header" onclick="showPlantDetail(${plant.id})">
                                    <div class="card-icon"><i class="ph ph-plant"></i></div>
                                    <div class="card-title">
                                        <div class="card-name">${plant.name}</div>
                                    </div>
                                </div>
                                <div class="card-description" onclick="showPlantDetail(${plant.id})">${plant.description}</div>
                                <div class="card-properties" onclick="showPlantDetail(${plant.id})">${plant.properties}</div>
                                <button class="remove-favorite" onclick="removeFavorite('plant', ${plant.id})">
                                    Удалить из избранного
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${favoriteDiseases.length > 0 ? `
                <div class="favorites-section">
                    <div class="favorites-section-header">
                        <span class="favorites-section-icon">💊</span>
                        <h3 class="favorites-section-title">Болезни</h3>
                        <span class="favorites-section-count">${favoriteDiseases.length}</span>
                    </div>
                    <div class="card-grid">
                        ${favoriteDiseases.map(disease => {
                            const categoryIcons = {
                                'Respiratory': '<i class="ph-bold ph-lungs"></i>',
                                'Digestive': '<i class="ph-bold ph-bowl-food"></i>',
                                'Nervous System': '<i class="ph-bold ph-brain"></i>',
                                'Pain': '<i class="ph-bold ph-warning-circle"></i>',
                                'Skin': '<i class="ph-bold ph-bandage"></i>',
                                'Other': '<i class="ph-bold ph-pill"></i>'
                            };
                            return `
                                <div class="disease-card favorite-card" data-disease-id="${disease.id}">
                                    <div class="favorite-badge"><i class="ph-bold ph-star"></i></div>
                                    <div class="disease-card-header" onclick="showDiseaseDetail(${disease.id})">
                                        <div class="disease-card-icon">${categoryIcons[disease.category] || '💊'}</div>
                                        <div class="disease-card-title">
                                            <div class="disease-card-name">${disease.name}</div>
                                        </div>
                                    </div>
                                    <div class="disease-card-description" onclick="showDiseaseDetail(${disease.id})">${disease.description}</div>
                                    <span class="disease-card-category" onclick="showDiseaseDetail(${disease.id})">${disease.category}</span>
                                    <button class="remove-favorite" onclick="removeFavorite('disease', ${disease.id})">
                                        Удалить из избранного
                                    </button>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${(favoritePlants.length > 0 || favoriteDiseases.length > 0) ? `
                <div style="background: white; border-radius: 12px; padding: 1.5rem; margin-top: var(--herbal-space-2xl); box-shadow: var(--herbal-shadow);">
                    <button class="favorite-btn" onclick="exportFavorites()">
                        <span><i class="ph-bold ph-download"></i></span>
                        <span>Экспортировать избранное</span>
                    </button>
                </div>
            ` : ''}
        `;
        
    } catch (error) {
        console.error('<i class="ph-bold ph-x-circle"></i> Error loading favorites:', error);
        showError('Ошибка загрузки избранного');
    }
    
    console.log('<i class="ph-bold ph-file-text"></i> Loaded favorites view');
}

function removeFavorite(type, id) {
    toggleFavorite(type, id);
    loadFavoritesView();
}

// ============ FAVORITES (localStorage) ============

function checkFavorite(type, id) {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '{"plants": [], "diseases": []}');
    return favorites[type + 's'].includes(id);
}

function toggleFavorite(type, id) {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '{"plants": [], "diseases": []}');
    const key = type + 's';
    const index = favorites[key].indexOf(id);
    
    if (index > -1) {
        favorites[key].splice(index, 1);
        console.log(`<i class="ph-bold ph-x-circle"></i> Removed from favorites: ${type} ${id}`);
    } else {
        favorites[key].push(id);
        console.log(`<i class="ph-bold ph-star"></i> Added to favorites: ${type} ${id}`);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // Reload current detail view
    if (type === 'plant') {
        showPlantDetail(id);
    } else if (type === 'disease') {
        showDiseaseDetail(id);
    }
}

// ============ SHARE & EXPORT ============

async function shareRecipe(type, id) {
    try {
        let text = '';
        
        if (type === 'plant') {
            const plant = await DatabaseManager.getPlantById(id);
            const diseases = await DatabaseManager.getDiseasesForPlant(id);
            
            text = `<i class="ph ph-plant"></i> ${plant.name}\n\n`;
            text += `${plant.description}\n\n`;
            text += `Свойства: ${plant.properties}\n\n`;
            text += `Помогает при:\n`;
            
            diseases.forEach(disease => {
                text += `\n• ${disease.name}\n`;
                text += `  Рецепт: ${disease.recipe}\n`;
                text += `  Дозировка: ${disease.dosage}\n`;
                if (disease.notes) {
                    text += `  <i class="ph-bold ph-warning"></i> ${disease.notes}\n`;
                }
            });
        } else if (type === 'disease') {
            const disease = await DatabaseManager.getDiseaseById(id);
            const plants = await DatabaseManager.getPlantsForDisease(id);
            
            text = `<i class="ph-bold ph-pill"></i> ${disease.name}\n\n`;
            text += `${disease.description}\n\n`;
            text += `Рекомендуемые растения:\n`;
            
            plants.forEach(plant => {
                text += `\n<i class="ph ph-plant"></i> ${plant.name}\n`;
                text += `  Рецепт: ${plant.recipe}\n`;
                text += `  Дозировка: ${plant.dosage}\n`;
                if (plant.notes) {
                    text += `  <i class="ph-bold ph-warning"></i> ${plant.notes}\n`;
                }
            });
        }
        
        text += `\n---\nТравник - справочник лекарственных растений`;
        
        // Try Web Share API
        if (navigator.share) {
            await navigator.share({
                title: type === 'plant' ? `Рецепты с ${(await DatabaseManager.getPlantById(id)).name}` : `Лечение: ${(await DatabaseManager.getDiseaseById(id)).name}`,
                text: text
            });
            console.log('<i class="ph-bold ph-check-circle"></i> Shared successfully');
        } else {
            // Fallback: copy to clipboard
            await navigator.clipboard.writeText(text);
            showNotification('<i class="ph-bold ph-clipboard-text"></i> Скопировано в буфер обмена');
        }
        
    } catch (error) {
        console.error('<i class="ph-bold ph-x-circle"></i> Share error:', error);
        showNotification('<i class="ph-bold ph-x-circle"></i> Ошибка при попытке поделиться');
    }
}

async function exportFavorites() {
    try {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '{"plants": [], "diseases": []}');
        
        let text = '<i class="ph-bold ph-star"></i> МОЕ ИЗБРАННОЕ - ТРАВНИК\n\n';
        text += `Экспортировано: ${new Date().toLocaleDateString('ru-RU')}\n\n`;
        
        // Export plants
        if (favorites.plants.length > 0) {
            text += '═══ РАСТЕНИЯ ═══\n\n';
            
            for (const id of favorites.plants) {
                const plant = await DatabaseManager.getPlantById(id);
                const diseases = await DatabaseManager.getDiseasesForPlant(id);
                
                text += `<i class="ph ph-plant"></i> ${plant.name}\n`;
                text += `${plant.description}\n`;
                text += `Свойства: ${plant.properties}\n\n`;
                
                if (diseases.length > 0) {
                    text += `Помогает при:\n`;
                    diseases.forEach(disease => {
                        text += `  • ${disease.name}: ${disease.recipe}\n`;
                    });
                }
                text += '\n---\n\n';
            }
        }
        
        // Export diseases
        if (favorites.diseases.length > 0) {
            text += '═══ БОЛЕЗНИ ═══\n\n';
            
            for (const id of favorites.diseases) {
                const disease = await DatabaseManager.getDiseaseById(id);
                const plants = await DatabaseManager.getPlantsForDisease(id);
                
                text += `<i class="ph-bold ph-pill"></i> ${disease.name}\n`;
                text += `${disease.description}\n\n`;
                
                if (plants.length > 0) {
                    text += `Рекомендуемые растения:\n`;
                    plants.forEach(plant => {
                        text += `  <i class="ph ph-plant"></i> ${plant.name}: ${plant.recipe}\n`;
                    });
                }
                text += '\n---\n\n';
            }
        }
        
        // Create and download file
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Травник_Избранное_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('<i class="ph-bold ph-check-circle"></i> Избранное экспортировано');
        console.log('<i class="ph-bold ph-check-circle"></i> Favorites exported');
        
    } catch (error) {
        console.error('<i class="ph-bold ph-x-circle"></i> Export error:', error);
        showNotification('<i class="ph-bold ph-x-circle"></i> Ошибка экспорта');
    }
}

// ============ TIPS / DID YOU KNOW ============

const herbalTips = [
    "<i class=\"ph ph-plant\"></i> Ромашковый чай перед сном помогает расслабиться и улучшает качество сна.",
    "<i class=\"ph ph-plant\"></i> Мята перечная эффективна при головных болях - просто разотрите листья и вдохните аромат.",
    "<i class=\"ph ph-plant\"></i> Календулу можно вырастить на подоконнике - это неприхотливое растение.",
    "<i class=\"ph-bold ph-lightbulb\"></i> Лучшее время для сбора трав - утро, после высыхания росы.",
    "<i class=\"ph-bold ph-calendar\"></i> Большинство трав заготавливают в период цветения, когда концентрация полезных веществ максимальна.",
    "<i class=\"ph-bold ph-coffee\"></i> Травяные чаи нельзя кипятить - только заливать горячей водой 80-90°C.",
    "<i class=\"ph-bold ph-clock\"></i> Настои трав обычно хранятся не более 24 часов в холодильнике.",
    "<i class=\"ph ph-plant\"></i> Зверобой нельзя сочетать со многими лекарствами - всегда консультируйтесь с врачом!",
    "<i class=\"ph-bold ph-mug-hot\"></i> Липовый чай - одно из лучших природных жаропонижающих средств.",
    "<i class=\"ph ph-plant\"></i> Крапива богата железом и помогает при анемии, но её нужно правильно заваривать."
];

function getRandomTip() {
    return herbalTips[Math.floor(Math.random() * herbalTips.length)];
}

function showTipOfTheDay() {
    const tip = getRandomTip();
    return `
        <div class="tips-section">
            <div class="tips-header">
                <span class="tips-icon"><i class="ph-bold ph-lightbulb"></i></span>
                <h3 class="tips-title">Знаете ли вы?</h3>
            </div>
            <div class="tips-content">${tip}</div>
            <button class="tips-refresh" onclick="refreshTip()">Другой совет</button>
        </div>
    `;
}

function refreshTip() {
    const tipsSection = document.querySelector('.tips-section');
    if (tipsSection) {
        const newTip = getRandomTip();
        tipsSection.querySelector('.tips-content').textContent = newTip;
    }
}

// ============ RECENTLY VIEWED ============

function addToRecentlyViewed(type, id, name) {
    const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    
    // Remove if already exists
    const filtered = recent.filter(item => !(item.type === type && item.id === id));
    
    // Add to beginning
    filtered.unshift({ type, id, name, timestamp: Date.now() });
    
    // Keep only last 5
    const trimmed = filtered.slice(0, 5);
    
    localStorage.setItem('recentlyViewed', JSON.stringify(trimmed));
}

function getRecentlyViewed() {
    return JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
}

function showRecentlyViewed() {
    const recent = getRecentlyViewed();
    
    if (recent.length === 0) return '';
    
    const icons = {
        plant: '<i class="ph ph-plant"></i>',
        disease: '<i class="ph-bold ph-pill"></i>'
    };
    
    return `
        <div class="recently-viewed">
            <h3 class="recently-viewed-title">
                <span><i class="ph-bold ph-clock-counter-clockwise"></i></span>
                <span>Недавно просмотренные</span>
            </h3>
            <div class="recently-viewed-list">
                ${recent.map(item => `
                    <div class="recently-viewed-item" onclick="${item.type === 'plant' ? 'showPlantDetail' : 'showDiseaseDetail'}(${item.id})">
                        <span>${icons[item.type]}</span>
                        <span>${item.name}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Update showPlantDetail to track recently viewed
const originalShowPlantDetail = showPlantDetail;
showPlantDetail = async function(plantId) {
    const plant = await DatabaseManager.getPlantById(plantId);
    addToRecentlyViewed('plant', plantId, plant.name);
    return originalShowPlantDetail(plantId);
};

const originalShowDiseaseDetail = showDiseaseDetail;
showDiseaseDetail = async function(diseaseId) {
    const disease = await DatabaseManager.getDiseaseById(diseaseId);
    addToRecentlyViewed('disease', diseaseId, disease.name);
    return originalShowDiseaseDetail(diseaseId);
};

// ============ UTILITIES ============

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function showEmptyState(containerId, type) {
    const container = document.getElementById(containerId);
    const messages = {
        plants: {
            icon: '<i class="ph-bold ph-magnifying-glass"></i>',
            title: 'Начните поиск',
            text: 'Введите название растения, например "ромашка" или "мята"'
        },
        diseases: {
            icon: '<i class="ph-bold ph-magnifying-glass"></i>',
            title: 'Начните поиск',
            text: 'Введите название болезни или выберите категорию'
        }
    };
    
    const msg = messages[type] || messages.plants;
    
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">${msg.icon}</div>
            <h3>${msg.title}</h3>
            <p>${msg.text}</p>
        </div>
    `;
}

function showError(message) {
    const main = document.getElementById('appMain');
    main.innerHTML = `
        <div style="text-align: center; padding: var(--herbal-space-2xl); color: #d32f2f;">
            <h3><i class="ph-bold ph-x-circle"></i> Ошибка</h3>
            <p>${message}</p>
        </div>
    `;
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'export-notification show';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// ============ PERFORMANCE MONITORING ============

if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('<i class="ph-bold ph-chart-bar"></i> Performance Metrics:');
            console.log(`  DOM Content Loaded: ${Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart)}ms`);
            console.log(`  Load Complete: ${Math.round(perfData.loadEventEnd - perfData.loadEventStart)}ms`);
            console.log(`  Total Load Time: ${Math.round(perfData.loadEventEnd - perfData.fetchStart)}ms`);
        }, 0);
    });
}

console.log('<i class="ph-bold ph-check-circle"></i> app.js loaded');
