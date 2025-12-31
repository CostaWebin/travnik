// IndexedDB wrapper for Herbal Guide PWA
// Provides database operations for plants, diseases, and their relationships

const DB_NAME = 'HerbalGuideDB';
const DB_VERSION = 2; // Updated to support new data structure

let db = null;

// Initialize database
function initDatabase() {
    return new Promise((resolve, reject) => {
        console.log('<i class="ph-bold ph-database"></i> Initializing IndexedDB...');
        
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => {
            console.error('<i class="ph-bold ph-x-circle"></i> Database failed to open:', request.error);
            reject(request.error);
        };
        
        request.onsuccess = () => {
            db = request.result;
            console.log('<i class="ph-bold ph-check-circle"></i> Database opened successfully');
            
            // Check if database is empty and seed it
            checkAndSeedDatabase().then(() => {
                resolve(db);
            });
        };
        
        request.onupgradeneeded = (event) => {
            console.log('<i class="ph-bold ph-arrows-clockwise"></i> Database upgrade needed');
            db = event.target.result;
            
            // Create object stores with new fields
            if (!db.objectStoreNames.contains('plants')) {
                const plantsStore = db.createObjectStore('plants', { keyPath: 'id', autoIncrement: true });
                plantsStore.createIndex('name', 'name', { unique: false });
                plantsStore.createIndex('nameLower', 'nameLower', { unique: false });
                plantsStore.createIndex('latinName', 'latinName', { unique: false });
                plantsStore.createIndex('toxicity', 'toxicity', { unique: false });
                console.log('<i class="ph-bold ph-book-bookmark"></i> Created "plants" object store');
            }
            
            if (!db.objectStoreNames.contains('diseases')) {
                const diseasesStore = db.createObjectStore('diseases', { keyPath: 'id', autoIncrement: true });
                diseasesStore.createIndex('name', 'name', { unique: false });
                diseasesStore.createIndex('nameLower', 'nameLower', { unique: false });
                diseasesStore.createIndex('category', 'category', { unique: false });
                diseasesStore.createIndex('icd10', 'icd10', { unique: false });
                console.log('<i class="ph-bold ph-book-bookmark"></i> Created "diseases" object store');
            }
            
            if (!db.objectStoreNames.contains('plant_diseases')) {
                const linkStore = db.createObjectStore('plant_diseases', { keyPath: 'id', autoIncrement: true });
                linkStore.createIndex('plantId', 'plantId', { unique: false });
                linkStore.createIndex('diseaseId', 'diseaseId', { unique: false });
                console.log('<i class="ph-bold ph-book-bookmark"></i> Created "plant_diseases" object store');
            }
            
            // Create new store for metadata
            if (!db.objectStoreNames.contains('metadata')) {
                const metadataStore = db.createObjectStore('metadata', { keyPath: 'key' });
                console.log('<i class="ph-bold ph-book-bookmark"></i> Created "metadata" object store');
            }
            
            console.log('<i class="ph-bold ph-check-circle"></i> Database structure created');
        };
    });
}

// Check if database has data, if not - seed it
async function checkAndSeedDatabase() {
    try {
        const plantCount = await countRecords('plants');
        console.log(`<i class="ph-bold ph-chart-bar"></i> Plants in database: ${plantCount}`);
        
        if (plantCount === 0) {
            console.log('<i class="ph ph-plant"></i> Database is empty, seeding with sample data...');
            await seedDatabase();
        }
    } catch (error) {
        console.error('<i class="ph-bold ph-x-circle"></i> Error checking database:', error);
    }
}

// Count records in object store
function countRecords(storeName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.count();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// DatabaseManager class - provides static methods for database operations
class DatabaseManager {
    // Add plant
    static addPlant(plant) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['plants'], 'readwrite');
            const store = transaction.objectStore('plants');
            
            // Add lowercase name for case-insensitive search
            plant.nameLower = plant.name.toLowerCase();
            
            const request = store.add(plant);
            
            request.onsuccess = () => {
                console.log(`<i class="ph-bold ph-check-circle"></i> Plant added: ${plant.name} (ID: ${request.result})`);
                resolve(request.result);
            };
            
            request.onerror = () => {
                console.error('<i class="ph-bold ph-x-circle"></i> Error adding plant:', request.error);
                reject(request.error);
            };
        });
    }
    
    // Add disease
    static addDisease(disease) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['diseases'], 'readwrite');
            const store = transaction.objectStore('diseases');
            
            // Add lowercase name for case-insensitive search
            disease.nameLower = disease.name.toLowerCase();
            
            const request = store.add(disease);
            
            request.onsuccess = () => {
                console.log(`<i class="ph-bold ph-check-circle"></i> Disease added: ${disease.name} (ID: ${request.result})`);
                resolve(request.result);
            };
            
            request.onerror = () => {
                console.error('<i class="ph-bold ph-x-circle"></i> Error adding disease:', request.error);
                reject(request.error);
            };
        });
    }
    
    // Link plant to disease with recipe
    static linkPlantDisease(plantId, diseaseId, recipe, dosage, notes = '') {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['plant_diseases'], 'readwrite');
            const store = transaction.objectStore('plant_diseases');
            
            const link = {
                plantId: plantId,
                diseaseId: diseaseId,
                recipe: recipe,
                dosage: dosage,
                notes: notes
            };
            
            const request = store.add(link);
            
            request.onsuccess = () => {
                console.log(`<i class="ph-bold ph-check-circle"></i> Link created: Plant ${plantId} <-> Disease ${diseaseId}`);
                resolve(request.result);
            };
            
            request.onerror = () => {
                console.error('<i class="ph-bold ph-x-circle"></i> Error creating link:', request.error);
                reject(request.error);
            };
        });
    }
    
    // Search plants by name (fuzzy search)
    static searchPlantsByName(query) {
        return new Promise((resolve, reject) => {
            if (!query || query.trim() === '') {
                resolve([]);
                return;
            }
            
            const transaction = db.transaction(['plants'], 'readonly');
            const store = transaction.objectStore('plants');
            const request = store.getAll();
            
            request.onsuccess = () => {
                const plants = request.result;
                const searchTerm = query.toLowerCase().trim();
                
                // Filter plants that contain search term
                const results = plants.filter(plant => 
                    plant.nameLower.includes(searchTerm)
                );
                
                console.log(`<i class="ph-bold ph-magnifying-glass"></i> Found ${results.length} plants matching "${query}"`);
                resolve(results);
            };
            
            request.onerror = () => {
                console.error('<i class="ph-bold ph-x-circle"></i> Error searching plants:', request.error);
                reject(request.error);
            };
        });
    }
    
    // Search diseases by name (fuzzy search)
    static searchDiseasesByName(query, category = null) {
        return new Promise((resolve, reject) => {
            if (!query || query.trim() === '') {
                // If no query but category specified, return all in category
                if (category && category !== 'All') {
                    this.getDiseasesByCategory(category).then(resolve).catch(reject);
                    return;
                }
                resolve([]);
                return;
            }
            
            const transaction = db.transaction(['diseases'], 'readonly');
            const store = transaction.objectStore('diseases');
            const request = store.getAll();
            
            request.onsuccess = () => {
                const diseases = request.result;
                const searchTerm = query.toLowerCase().trim();
                
                // Filter diseases that contain search term
                let results = diseases.filter(disease => 
                    disease.nameLower.includes(searchTerm)
                );
                
                // Further filter by category if specified
                if (category && category !== 'All') {
                    results = results.filter(disease => disease.category === category);
                }
                
                console.log(`<i class="ph-bold ph-magnifying-glass"></i> Found ${results.length} diseases matching "${query}"`);
                resolve(results);
            };
            
            request.onerror = () => {
                console.error('<i class="ph-bold ph-x-circle"></i> Error searching diseases:', request.error);
                reject(request.error);
            };
        });
    }
    
    // Get all diseases by category
    static getDiseasesByCategory(category) {
        return new Promise((resolve, reject) => {
            if (category === 'All') {
                this.getAllDiseases().then(resolve).catch(reject);
                return;
            }
            
            const transaction = db.transaction(['diseases'], 'readonly');
            const store = transaction.objectStore('diseases');
            const index = store.index('category');
            const request = index.getAll(category);
            
            request.onsuccess = () => {
                console.log(`<i class="ph-bold ph-clipboard-text"></i> Found ${request.result.length} diseases in category "${category}"`);
                resolve(request.result);
            };
            
            request.onerror = () => {
                console.error('<i class="ph-bold ph-x-circle"></i> Error getting diseases by category:', request.error);
                reject(request.error);
            };
        });
    }
    
    // Get all plants
    static getAllPlants() {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['plants'], 'readonly');
            const store = transaction.objectStore('plants');
            const request = store.getAll();
            
            request.onsuccess = () => {
                console.log(`<i class="ph-bold ph-clipboard-text"></i> Retrieved ${request.result.length} plants`);
                resolve(request.result);
            };
            
            request.onerror = () => {
                console.error('<i class="ph-bold ph-x-circle"></i> Error getting all plants:', request.error);
                reject(request.error);
            };
        });
    }
    
    // Get all diseases
    static getAllDiseases() {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['diseases'], 'readonly');
            const store = transaction.objectStore('diseases');
            const request = store.getAll();
            
            request.onsuccess = () => {
                console.log(`<i class="ph-bold ph-clipboard-text"></i> Retrieved ${request.result.length} diseases`);
                resolve(request.result);
            };
            
            request.onerror = () => {
                console.error('<i class="ph-bold ph-x-circle"></i> Error getting all diseases:', request.error);
                reject(request.error);
            };
        });
    }
    
    // Get diseases for specific plant
    static getDiseasesForPlant(plantId) {
        return new Promise(async (resolve, reject) => {
            try {
                // Get all links for this plant
                const transaction = db.transaction(['plant_diseases', 'diseases'], 'readonly');
                const linkStore = transaction.objectStore('plant_diseases');
                const diseaseStore = transaction.objectStore('diseases');
                const index = linkStore.index('plantId');
                const request = index.getAll(plantId);
                
                request.onsuccess = async () => {
                    const links = request.result;
                    
                    // Get disease details for each link
                    const diseasesWithRecipes = await Promise.all(
                        links.map(link => {
                            return new Promise((res, rej) => {
                                const diseaseRequest = diseaseStore.get(link.diseaseId);
                                diseaseRequest.onsuccess = () => {
                                    const disease = diseaseRequest.result;
                                    res({
                                        ...disease,
                                        recipe: link.recipe,
                                        dosage: link.dosage,
                                        notes: link.notes
                                    });
                                };
                                diseaseRequest.onerror = () => rej(diseaseRequest.error);
                            });
                        })
                    );
                    
                    console.log(`<i class="ph-bold ph-link"></i> Found ${diseasesWithRecipes.length} diseases for plant ${plantId}`);
                    resolve(diseasesWithRecipes);
                };
                
                request.onerror = () => {
                    console.error('<i class="ph-bold ph-x-circle"></i> Error getting diseases for plant:', request.error);
                    reject(request.error);
                };
            } catch (error) {
                reject(error);
            }
        });
    }
    
    // Get plants for specific disease
    static getPlantsForDisease(diseaseId) {
        return new Promise(async (resolve, reject) => {
            try {
                // Get all links for this disease
                const transaction = db.transaction(['plant_diseases', 'plants'], 'readonly');
                const linkStore = transaction.objectStore('plant_diseases');
                const plantStore = transaction.objectStore('plants');
                const index = linkStore.index('diseaseId');
                const request = index.getAll(diseaseId);
                
                request.onsuccess = async () => {
                    const links = request.result;
                    
                    // Get plant details for each link
                    const plantsWithRecipes = await Promise.all(
                        links.map(link => {
                            return new Promise((res, rej) => {
                                const plantRequest = plantStore.get(link.plantId);
                                plantRequest.onsuccess = () => {
                                    const plant = plantRequest.result;
                                    res({
                                        ...plant,
                                        recipe: link.recipe,
                                        dosage: link.dosage,
                                        notes: link.notes
                                    });
                                };
                                plantRequest.onerror = () => rej(plantRequest.error);
                            });
                        })
                    );
                    
                    console.log(`<i class="ph-bold ph-link"></i> Found ${plantsWithRecipes.length} plants for disease ${diseaseId}`);
                    resolve(plantsWithRecipes);
                };
                
                request.onerror = () => {
                    console.error('<i class="ph-bold ph-x-circle"></i> Error getting plants for disease:', request.error);
                    reject(request.error);
                };
            } catch (error) {
                reject(error);
            }
        });
    }
    
    // Get plant by ID
    static getPlantById(plantId) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['plants'], 'readonly');
            const store = transaction.objectStore('plants');
            const request = store.get(plantId);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                console.error('<i class="ph-bold ph-x-circle"></i> Error getting plant:', request.error);
                reject(request.error);
            };
        });
    }
    
    // Get disease by ID
    static getDiseaseById(diseaseId) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['diseases'], 'readonly');
            const store = transaction.objectStore('diseases');
            const request = store.get(diseaseId);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                console.error('<i class="ph-bold ph-x-circle"></i> Error getting disease:', request.error);
                reject(request.error);
            };
        });
    }
    
    // Save metadata
    static saveMetadata(metadata) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['metadata'], 'readwrite');
            const store = transaction.objectStore('metadata');
            const request = store.put({ key: 'appMetadata', ...metadata });
            
            request.onsuccess = () => {
                console.log('<i class="ph-bold ph-check-circle"></i> Metadata saved');
                resolve(request.result);
            };
            
            request.onerror = () => {
                console.error('<i class="ph-bold ph-x-circle"></i> Error saving metadata:', request.error);
                reject(request.error);
            };
        });
    }
    
    // Get metadata
    static getMetadata() {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['metadata'], 'readonly');
            const store = transaction.objectStore('metadata');
            const request = store.get('appMetadata');
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                console.error('<i class="ph-bold ph-x-circle"></i> Error getting metadata:', request.error);
                reject(request.error);
            };
        });
    }
    
    // Improved fuzzy search with Levenshtein distance
    static fuzzySearch(query, storeName, maxDistance = 2) {
        return new Promise((resolve, reject) => {
            if (!query || query.trim() === '') {
                resolve([]);
                return;
            }
            
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = () => {
                const items = request.result;
                const searchTerm = query.toLowerCase().trim();
                
                // Calculate Levenshtein distance for each item
                const scoredItems = items.map(item => {
                    const itemName = item.name ? item.name.toLowerCase() : '';
                    const distance = levenshteinDistance(searchTerm, itemName);
                    const maxLen = Math.max(searchTerm.length, itemName.length);
                    const similarity = 1 - (distance / maxLen);
                    
                    return {
                        ...item,
                        similarity,
                        distance
                    };
                });
                
                // Filter by max distance and sort by similarity
                const results = scoredItems
                    .filter(item => item.distance <= maxDistance)
                    .sort((a, b) => b.similarity - a.similarity)
                    .slice(0, 20); // Limit to top 20 results
                
                console.log(`<i class="ph-bold ph-magnifying-glass"></i> Fuzzy search: "${query}" found ${results.length} results`);
                resolve(results);
            };
            
            request.onerror = () => {
                console.error('<i class="ph-bold ph-x-circle"></i> Error in fuzzy search:', request.error);
                reject(request.error);
            };
        });
    }
}

// Levenshtein distance algorithm for fuzzy search
function levenshteinDistance(str1, str2) {
    const m = str1.length;
    const n = str2.length;
    
    // Create matrix
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(null));
    
    // Initialize first row and column
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    
    // Fill matrix
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,     // deletion
                dp[i][j - 1] + 1,     // insertion
                dp[i - 1][j - 1] + cost  // substitution
            );
        }
    }
    
    return dp[m][n];
}

// Load data from plants_db.json file
async function loadFromJSONFile() {
    try {
        console.log('<i class="ph-bold ph-download"></i> Loading data from plants_db.json...');
        const response = await fetch('plants_db.json');
        const data = await response.json();
        
        console.log(`<i class="ph-bold ph-check-circle"></i> Loaded ${data.plants.length} plants and ${data.diseases.length} diseases`);
        
        return data;
    } catch (error) {
        console.error('<i class="ph-bold ph-x-circle"></i> Error loading plants_db.json:', error);
        return null;
    }
}

// Sample data for testing (fallback)
const SAMPLE_PLANTS = [
    { name: 'Ромашка аптечная', description: 'Противовоспалительное, успокаивающее средство', properties: 'Спазмолитическое, антисептическое', imagePath: '<i class="ph ph-flower-lotus"></i>' },
    { name: 'Мята перечная', description: 'Освежающее, болеутоляющее средство', properties: 'Спазмолитическое, желчегонное', imagePath: '<i class="ph ph-plant"></i>' },
    { name: 'Зверобой продырявленный', description: 'Природный антидепрессант', properties: 'Антидепрессивное, противовоспалительное', imagePath: '<i class="ph ph-sun"></i>' },
    { name: 'Календула лекарственная', description: 'Ранозаживляющее средство', properties: 'Антисептическое, противовоспалительное', imagePath: '<i class="ph ph-flower-lotus"></i>' },
    { name: 'Валериана лекарственная', description: 'Успокоительное средство', properties: 'Седативное, спазмолитическое', imagePath: '<i class="ph ph-flower-tulip"></i>' },
    { name: 'Шалфей лекарственный', description: 'Противовоспалительное средство для горла', properties: 'Антисептическое, вяжущее', imagePath: '<i class="ph ph-plant"></i>' },
    { name: 'Крапива двудомная', description: 'Кровоостанавливающее, витаминное средство', properties: 'Гемостатическое, общеукрепляющее', imagePath: '<i class="ph ph-leaf"></i>' },
    { name: 'Липа сердцевидная', description: 'Потогонное, жаропонижающее средство', properties: 'Противовоспалительное, отхаркивающее', imagePath: '<i class="ph ph-tree"></i>' },
    { name: 'Чабрец (тимьян)', description: 'Отхаркивающее средство', properties: 'Противомикробное, муколитическое', imagePath: '<i class="ph ph-plant"></i>' },
    { name: 'Имбирь лекарственный', description: 'Противопростудное, согревающее средство', properties: 'Иммуномодулирующее, противорвотное', imagePath: '<i class="ph ph-carrot"></i>' }
];

const SAMPLE_DISEASES = [
    { name: 'Простуда', description: 'ОРВИ, грипп', category: 'Respiratory' },
    { name: 'Гастрит', description: 'Воспаление слизистой желудка', category: 'Digestive' },
    { name: 'Бессонница', description: 'Нарушение сна', category: 'Nervous System' },
    { name: 'Головная боль', description: 'Цефалгия различного происхождения', category: 'Pain' },
    { name: 'Кашель', description: 'Сухой и влажный кашель', category: 'Respiratory' },
    { name: 'Депрессия легкая', description: 'Подавленное настроение', category: 'Nervous System' },
    { name: 'Раны, порезы', description: 'Повреждения кожи', category: 'Skin' },
    { name: 'Боль в горле', description: 'Фарингит, тонзиллит', category: 'Respiratory' },
    { name: 'Анемия', description: 'Пониженный гемоглобин', category: 'Other' },
    { name: 'Тошнота', description: 'Диспепсия, укачивание', category: 'Digestive' }
];

// Seed database with sample data
async function seedDatabase() {
    try {
        console.log('<i class="ph ph-plant"></i> Starting database seeding...');
        
        // Try to load from plants_db.json first
        const jsonData = await loadFromJSONFile();
        
        if (jsonData) {
            // Use data from JSON file
            const plantIds = [];
            for (const plant of jsonData.plants) {
                const id = await DatabaseManager.addPlant(plant);
                plantIds.push(id);
            }
            
            const diseaseIds = [];
            for (const disease of jsonData.diseases) {
                const id = await DatabaseManager.addDisease(disease);
                diseaseIds.push(id);
            }
            
            // Create links from relationships
            const plantNameToId = new Map();
            const diseaseNameToId = new Map();
            
            // Build name-to-ID maps
            for (let i = 0; i < jsonData.plants.length; i++) {
                plantNameToId.set(jsonData.plants[i].name, plantIds[i]);
            }
            for (let i = 0; i < jsonData.diseases.length; i++) {
                diseaseNameToId.set(jsonData.diseases[i].name, diseaseIds[i]);
            }
            
            // Create links
            for (const rel of jsonData.relationships) {
                const plantId = plantNameToId.get(rel.plantName);
                const diseaseId = diseaseNameToId.get(rel.diseaseName);
                
                if (plantId !== undefined && diseaseId !== undefined) {
                    await DatabaseManager.linkPlantDisease(
                        plantId,
                        diseaseId,
                        rel.recipe,
                        rel.dosage,
                        rel.notes || ''
                    );
                }
            }
            
            // Store metadata
            await DatabaseManager.saveMetadata(jsonData.metadata);
            
            console.log('<i class="ph-bold ph-check-circle"></i> Database seeded successfully from JSON!');
            console.log(`<i class="ph-bold ph-chart-bar"></i> Added ${plantIds.length} plants and ${diseaseIds.length} diseases`);
        } else {
            // Fallback to sample data
            console.log('<i class="ph-bold ph-warning"></i> Using fallback sample data...');
            
            const plantIds = [];
            for (const plant of SAMPLE_PLANTS) {
                const id = await DatabaseManager.addPlant(plant);
                plantIds.push(id);
            }
            
            const diseaseIds = [];
            for (const disease of SAMPLE_DISEASES) {
                const id = await DatabaseManager.addDisease(disease);
                diseaseIds.push(id);
            }
            
            // Create links (examples)
            // Ромашка (0) -> Простуда (0), Гастрит (1), Бессонница (2)
            await DatabaseManager.linkPlantDisease(plantIds[0], diseaseIds[0], '1 ст.ложка цветков на стакан кипятка, настоять 15 минут', '3 раза в день по 1/3 стакана');
            await DatabaseManager.linkPlantDisease(plantIds[0], diseaseIds[1], '1 ч.ложка на стакан кипятка, настоять 20 минут', 'За 30 минут до еды, 3 раза в день');
            await DatabaseManager.linkPlantDisease(plantIds[0], diseaseIds[2], '2 ст.ложки на 500 мл кипятка', 'Перед сном 1 стакан');
            
            // Мята (1) -> Головная боль (3), Тошнота (9)
            await DatabaseManager.linkPlantDisease(plantIds[1], diseaseIds[3], '1 ч.ложка листьев на чашку, настоять 10 минут', 'При появлении боли');
            await DatabaseManager.linkPlantDisease(plantIds[1], diseaseIds[9], 'Свежие листья заварить кипятком', 'Небольшими глотками');
            
            // Зверобой (2) -> Депрессия (5)
            await DatabaseManager.linkPlantDisease(plantIds[2], diseaseIds[5], '1 ст.ложка травы на 200 мл кипятка, 15 минут', '2-3 раза в день курсом 4-6 недель', 'Не сочетать с антидепрессантами!');
            
            // Календула (3) -> Раны (6), Боль в горле (7)
            await DatabaseManager.linkPlantDisease(plantIds[3], diseaseIds[6], 'Настойка 1:10 на спирту', 'Промывать рану 2-3 раза в день');
            await DatabaseManager.linkPlantDisease(plantIds[3], diseaseIds[7], '1 ст.ложка на стакан кипятка', 'Полоскать горло 4-5 раз в день');
            
            // Валериана (4) -> Бессонница (2)
            await DatabaseManager.linkPlantDisease(plantIds[4], diseaseIds[2], 'Настойка или таблетки по инструкции', 'За час до сна');
            
            // Шалфей (5) -> Боль в горле (7)
            await DatabaseManager.linkPlantDisease(plantIds[5], diseaseIds[7], '1 ст.ложка на стакан кипятка, 30 минут', 'Полоскать 5-6 раз в день');
            
            // Крапива (6) -> Анемия (8)
            await DatabaseManager.linkPlantDisease(plantIds[6], diseaseIds[8], '2 ст.ложки листьев на 500 мл кипятка', '3 раза в день перед едой');
            
            // Липа (7) -> Простуда (0)
            await DatabaseManager.linkPlantDisease(plantIds[7], diseaseIds[0], '2 ст.ложки цветков на 500 мл кипятка', 'Горячим на ночь');
            
            // Чабрец (8) -> Кашель (4)
            await DatabaseManager.linkPlantDisease(plantIds[8], diseaseIds[4], '1 ст.ложка на стакан кипятка, 15 минут', '3-4 раза в день');
            
            // Имбирь (9) -> Простуда (0), Тошнота (9)
            await DatabaseManager.linkPlantDisease(plantIds[9], diseaseIds[0], 'Свежий корень нарезать, залить кипятком, добавить мёд', '2-3 раза в день');
            await DatabaseManager.linkPlantDisease(plantIds[9], diseaseIds[9], 'Небольшой кусочек свежего корня жевать', 'По необходимости');
            
            console.log('<i class="ph-bold ph-check-circle"></i> Database seeded successfully!');
            console.log(`<i class="ph-bold ph-chart-bar"></i> Added ${plantIds.length} plants and ${diseaseIds.length} diseases`);
        }
        
    } catch (error) {
        console.error('<i class="ph-bold ph-x-circle"></i> Error seeding database:', error);
    }
}

console.log('<i class="ph-bold ph-check-circle"></i> db.js loaded - DatabaseManager ready');
