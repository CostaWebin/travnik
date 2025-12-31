// ============================================
// Травник - Extended Herbal Data Import
// ============================================
// This file contains extended plant and disease data
// that can be imported into the Травник PWA database
//
// USAGE:
// 1. Open the Травник app in your browser
// 2. Open browser console (F12)
// 3. Copy and paste this entire file
// 4. Run: importExtendedData()
// 5. Refresh the page to see new data
// ============================================

// Extended plants data (NEW plants not in SAMPLE_PLANTS)
const EXTENDED_PLANTS = [
  {
    "name": "Эхинацея пурпурная",
    "englishName": "Purple Coneflower (Echinacea purpurea)",
    "latinName": "Echinacea purpurea",
    "description": "Perennial herb with purple daisy-like flowers",
    "properties": "Immunostimulant, anti-inflammatory, antiviral",
    "uses": ["Immune support", "Colds and flu", "Wound healing", "Infections"],
    "cultivation": "Easy, prefers full sun",
    "edibility": 2,
    "medicinal": 5
  },
  {
    "name": "Эвкалипт шаровидный",
    "englishName": "Blue Gum (Eucalyptus globulus)",
    "latinName": "Eucalyptus globulus",
    "description": "Tall evergreen tree with aromatic leaves",
    "properties": "Expectorant, antiseptic, anti-inflammatory",
    "uses": ["Respiratory infections", "Cough", "Cold sores", "Joint pain"],
    "cultivation": "Requires warm climate",
    "edibility": 1,
    "medicinal": 5
  },
  {
    "name": "Ромашка римская",
    "englishName": "Roman Chamomile (Chamaemelum nobile)",
    "latinName": "Chamaemelum nobile",
    "description": "Low-growing perennial with daisy-like flowers",
    "properties": "Anti-inflammatory, antispasmodic, carminative",
    "uses": ["Digestive issues", "Anxiety", "Skin conditions", "Insomnia"],
    "cultivation": "Easy, well-drained soil",
    "edibility": 3,
    "medicinal": 4
  },
  {
    "name": "Боярышник колючий",
    "englishName": "Hawthorn (Crataegus laevigata)",
    "latinName": "Crataegus laevigata",
    "description": "Deciduous shrub with white flowers and red berries",
    "properties": "Cardiotonic, vasodilator, antioxidant",
    "uses": ["Heart health", "Blood pressure", "Anxiety", "Digestion"],
    "cultivation": "Easy, hardy shrub",
    "edibility": 3,
    "medicinal": 5
  },
  {
    "name": "Мелисса лекарственная",
    "englishName": "Lemon Balm (Melissa officinalis)",
    "latinName": "Melissa officinalis",
    "description": "Perennial herb with lemon-scented leaves",
    "properties": "Calming, antiviral, digestive",
    "uses": ["Anxiety", "Insomnia", "Cold sores", "Digestive issues"],
    "cultivation": "Very easy, can be invasive",
    "edibility": 4,
    "medicinal": 4
  },
  {
    "name": "Роза шиповника",
    "englishName": "Rosehip (Rosa canina)",
    "latinName": "Rosa canina",
    "description": "Wild rose with red fruit hips",
    "properties": "High vitamin C, antioxidant, anti-inflammatory",
    "uses": ["Immune support", "Colds", "Skin health", "Joint pain"],
    "cultivation": "Easy, hardy shrub",
    "edibility": 5,
    "medicinal": 4
  },
  {
    "name": "Подорожник большой",
    "englishName": "Plantain (Plantago major)",
    "latinName": "Plantago major",
    "description": "Perennial herb with broad leaves",
    "properties": "Wound healing, anti-inflammatory, expectorant",
    "uses": ["Wounds", "Cough", "Digestive issues", "Insect bites"],
    "cultivation": "Very easy, common weed",
    "edibility": 4,
    "medicinal": 4
  },
  {
    "name": "Пустырник пятилопастный",
    "englishName": "Motherwort (Leonurus cardiaca)",
    "latinName": "Leonurus cardiaca",
    "description": "Perennial herb with pink flowers",
    "properties": "Cardiotonic, sedative, antispasmodic",
    "uses": ["Heart palpitations", "Anxiety", "Menstrual issues", "Thyroid"],
    "cultivation": "Easy, hardy perennial",
    "edibility": 2,
    "medicinal": 4
  },
  {
    "name": "Золотой ус",
    "englishName": "Golden Root (Callisia fragrans)",
    "latinName": "Callisia fragrans",
    "description": "Tropical plant with long jointed stems",
    "properties": "Anti-inflammatory, antimicrobial, immunostimulant",
    "uses": ["Joint pain", "Skin conditions", "Digestive issues", "Colds"],
    "cultivation": "Easy houseplant",
    "edibility": 2,
    "medicinal": 4
  },
  {
    "name": "Алоэ древовидное",
    "englishName": "Aloe Vera (Aloe barbadensis)",
    "latinName": "Aloe barbadensis",
    "description": "Succulent with fleshy leaves",
    "properties": "Wound healing, anti-inflammatory, moisturizing",
    "uses": ["Burns", "Wounds", "Skin conditions", "Digestive issues"],
    "cultivation": "Easy houseplant",
    "edibility": 2,
    "medicinal": 5
  }
];

// Extended diseases data
const EXTENDED_DISEASES = [
  { "name": "Грипп", "category": "Respiratory", "description": "Вирусная инфекция" },
  { "name": "Бронхит", "category": "Respiratory", "description": "Воспаление бронхов" },
  { "name": "Аллергия", "category": "Respiratory", "description": "Аллергические реакции" },
  { "name": "Изжога", "category": "Digestive", "description": "Рефлюкс кислоты" },
  { "name": "Запор", "category": "Digestive", "description": "Затрудненное опорожнение" },
  { "name": "Диарея", "category": "Digestive", "description": "Жидкий стул" },
  { "name": "Стресс", "category": "Nervous System", "description": "Психоэмоциональное напряжение" },
  { "name": "Тревожность", "category": "Nervous System", "description": "Чувство беспокойства" },
  { "name": "Мигрень", "category": "Pain", "description": "Сильная головная боль" },
  { "name": "Артрит", "category": "Pain", "description": "Воспаление суставов" },
  { "name": "Ожоги", "category": "Skin", "description": "Термические повреждения кожи" },
  { "name": "Угревая сыпь", "category": "Skin", "description": "Воспаление сальных желез" },
  { "name": "Герпес", "category": "Skin", "description": "Вирусное поражение кожи" },
  { "name": "Авитаминоз", "category": "Other", "description": "Недостаток витаминов" },
  { "name": "Снижение иммунитета", "category": "Other", "description": "Ослабление защитных сил" }
];

// Plant-disease links with recipes
const PLANT_DISEASE_LINKS = [
  {
    "plant": "Эхинацея пурпурная",
    "disease": "Грипп",
    "recipe": "1 ч.ложка травы на стакан кипятка, настоять 30 минут",
    "dosage": "3-4 раза в день за 30 минут до еды"
  },
  {
    "plant": "Эхинацея пурпурная",
    "disease": "Снижение иммунитета",
    "recipe": "Настойка или отвар по инструкции",
    "dosage": "Курсом 2-3 недели"
  },
  {
    "plant": "Эвкалипт шаровидный",
    "disease": "Бронхит",
    "recipe": "1 ст.ложка листьев на стакан кипятка, 15 минут",
    "dosage": "Полоскать горло 3-4 раза в день"
  },
  {
    "plant": "Эвкалипт шаровидный",
    "disease": "Кашель",
    "recipe": "Ингаляции с эфирным маслом",
    "dosage": "2-3 ингаляции в день"
  },
  {
    "plant": "Ромашка римская",
    "disease": "Стресс",
    "recipe": "2 ст.ложки цветков на 500 мл кипятка",
    "dosage": "1 стакан перед сном"
  },
  {
    "plant": "Ромашка римская",
    "disease": "Тревожность",
    "recipe": "Чай с медом",
    "dosage": "2-3 раза в день"
  },
  {
    "plant": "Боярышник колючий",
    "disease": "Стресс",
    "recipe": "Настойка плодов по инструкции",
    "dosage": "20-30 капель 2-3 раза в день"
  },
  {
    "plant": "Боярышник колючий",
    "disease": "Мигрень",
    "recipe": "Чай из плодов и цветков",
    "dosage": "1 стакан при появлении боли"
  },
  {
    "plant": "Мелисса лекарственная",
    "disease": "Тревожность",
    "recipe": "Свежие листья заварить кипятком",
    "dosage": "Чай 2-3 раза в день"
  },
  {
    "plant": "Мелисса лекарственная",
    "disease": "Герпес",
    "recipe": "Свежий сок листьев наносить на высыпания",
    "dosage": "Несколько раз в день"
  },
  {
    "plant": "Роза шиповника",
    "disease": "Авитаминоз",
    "recipe": "2 ст.ложки плодов на 500 мл кипятка",
    "dosage": "1/2 стакана 2-3 раза в день"
  },
  {
    "plant": "Роза шиповника",
    "disease": "Грипп",
    "recipe": "Витаминный настой",
    "dosage": "1 стакан в день"
  },
  {
    "plant": "Подорожник большой",
    "disease": "Ожоги",
    "recipe": "Свежие листья измельчить, приложить к ожогу",
    "dosage": "Менять повязку каждые 2-3 часа"
  },
  {
    "plant": "Подорожник большой",
    "disease": "Бронхит",
    "recipe": "1 ст.ложка листьев на стакан кипятка",
    "dosage": "1/3 стакана 3 раза в день"
  },
  {
    "plant": "Пустырник пятилопастный",
    "disease": "Стресс",
    "recipe": "1 ст.ложка травы на стакан кипятка",
    "dosage": "1/3 стакана 3 раза в день"
  },
  {
    "plant": "Пустырник пятилопастный",
    "disease": "Тревожность",
    "recipe": "Настойка по инструкции",
    "dosage": "30-40 капель 2-3 раза в день"
  },
  {
    "plant": "Золотой ус",
    "disease": "Артрит",
    "recipe": "Настойка суставов по инструкции",
    "dosage": "Натирать больные суставы"
  },
  {
    "plant": "Алоэ древовидное",
    "disease": "Ожоги",
    "recipe": "Свежий гель из листьев",
    "dosage": "Наносить на ожог несколько раз в день"
  },
  {
    "plant": "Алоэ древовидное",
    "disease": "Угревая сыпь",
    "recipe": "Свежий сок смешать с медом",
    "dosage": "Наносить на пораженные участки"
  }
];

// ============================================
// Import Function
// ============================================

async function importExtendedData() {
    console.log('📦 Importing extended herbal database...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
        // Check if DatabaseManager is available
        if (typeof DatabaseManager === 'undefined') {
            throw new Error('DatabaseManager not found. Make sure db.js is loaded.');
        }
        
        // Get existing plants to avoid duplicates
        console.log('🔍 Checking for existing plants...');
        const existingPlants = await DatabaseManager.getAllPlants();
        const existingPlantNames = new Set(existingPlants.map(p => p.name.toLowerCase()));
        console.log(`   Found ${existingPlants.length} existing plants`);
        
        // Import new plants only
        console.log('🌿 Importing new plants...');
        const plantMap = new Map();
        let plantsImported = 0;
        let plantsSkipped = 0;
        
        for (const plant of EXTENDED_PLANTS) {
            if (existingPlantNames.has(plant.name.toLowerCase())) {
                console.log(`   ⏭️  Skipped (exists): ${plant.name}`);
                plantsSkipped++;
                continue;
            }
            
            const id = await DatabaseManager.addPlant({
                name: plant.name,
                description: plant.description,
                properties: plant.properties,
                imagePath: '🌿'
            });
            plantMap.set(plant.name, id);
            plantsImported++;
            console.log(`   ✅ Added plant: ${plant.name} (ID: ${id})`);
        }
        console.log(`📊 Plants imported: ${plantsImported}, skipped: ${plantsSkipped}`);
        
        // Get existing diseases to avoid duplicates
        console.log('🔍 Checking for existing diseases...');
        const existingDiseases = await DatabaseManager.getAllDiseases();
        const existingDiseaseNames = new Set(existingDiseases.map(d => d.name.toLowerCase()));
        console.log(`   Found ${existingDiseases.length} existing diseases`);
        
        // Import new diseases only
        console.log('💊 Importing new diseases...');
        const diseaseMap = new Map();
        let diseasesImported = 0;
        let diseasesSkipped = 0;
        
        for (const disease of EXTENDED_DISEASES) {
            if (existingDiseaseNames.has(disease.name.toLowerCase())) {
                console.log(`   ⏭️  Skipped (exists): ${disease.name}`);
                diseasesSkipped++;
                continue;
            }
            
            const id = await DatabaseManager.addDisease(disease);
            diseaseMap.set(disease.name, id);
            diseasesImported++;
            console.log(`   ✅ Added disease: ${disease.name} (ID: ${id})`);
        }
        console.log(`📊 Diseases imported: ${diseasesImported}, skipped: ${diseasesSkipped}`);
        
        // Create links
        console.log('🔗 Creating plant-disease links...');
        let linksCreated = 0;
        let linksSkipped = 0;
        
        for (const link of PLANT_DISEASE_LINKS) {
            const plantId = plantMap.get(link.plant) || 
                          existingPlants.find(p => p.name.toLowerCase() === link.plant.toLowerCase())?.id;
            const diseaseId = diseaseMap.get(link.disease) || 
                            existingDiseases.find(d => d.name.toLowerCase() === link.disease.toLowerCase())?.id;
            
            if (plantId && diseaseId) {
                await DatabaseManager.linkPlantDisease(
                    plantId,
                    diseaseId,
                    link.recipe,
                    link.dosage,
                    link.notes || ''
                );
                linksCreated++;
                console.log(`   ✅ Linked: ${link.plant} → ${link.disease}`);
            } else {
                linksSkipped++;
                console.log(`   ⏭️  Skipped: ${link.plant} → ${link.disease} (missing IDs)`);
            }
        }
        console.log(`📊 Links created: ${linksCreated}, skipped: ${linksSkipped}`);
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Extended data import complete!');
        console.log('');
        console.log('📊 Summary:');
        console.log(`   • Plants: ${plantsImported} imported, ${plantsSkipped} skipped`);
        console.log(`   • Diseases: ${diseasesImported} imported, ${diseasesSkipped} skipped`);
        console.log(`   • Links: ${linksCreated} created, ${linksSkipped} skipped`);
        console.log('');
        console.log('📝 Next steps:');
        console.log('   1. Refresh page (F5 or Cmd+R)');
        console.log('   2. Search for new plants and diseases');
        console.log('   3. Check plant details for recipes and dosages');
        
    } catch (error) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ Import error:', error);
        console.error('');
        console.error('Troubleshooting:');
        console.error('   • Make sure you are on Травник app page');
        console.error('   • Make sure db.js is loaded');
        console.error('   • Check browser console for additional errors');
    }
}

// ============================================
// Alternative: Clear and Reset Database
// ============================================

async function resetDatabase() {
    console.log('⚠️  WARNING: This will delete all data!');
    console.log('Type: confirmReset() to proceed');
}

async function confirmReset() {
    try {
        console.log('🗑️  Deleting database...');
        const request = indexedDB.deleteDatabase('HerbalGuideDB');
        
        request.onsuccess = () => {
            console.log('✅ Database deleted successfully!');
            console.log('📝 Refresh page to reinitialize with sample data');
        };
        
        request.onerror = () => {
            console.error('❌ Error deleting database:', request.error);
        };
        
    } catch (error) {
        console.error('❌ Reset error:', error);
    }
}

// ============================================
// Display Import Summary
// ============================================

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🌿 Травник - Extended Data Import Module');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('📦 Data ready to import:');
console.log(`   • ${EXTENDED_PLANTS.length} new plants`);
console.log(`   • ${EXTENDED_DISEASES.length} new diseases`);
console.log(`   • ${PLANT_DISEASE_LINKS.length} recipes`);
console.log('');
console.log('🚀 To import data, run:');
console.log('   importExtendedData()');
console.log('');
console.log('⚠️  To reset database, run:');
console.log('   resetDatabase()');
console.log('   confirmReset()');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
