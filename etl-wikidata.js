#!/usr/bin/env node

/**
 * ============================================
 * Травник - Wikidata ETL Script
 * ============================================
 * 
 * This script extracts medicinal plant and disease data from Wikidata
 * using SPARQL queries and creates a unified JSON database file.
 * 
 * Usage:
 *   node etl-wikidata.js
 * 
 * Output:
 *   plants_db.json - Unified database file
 * 
 * ============================================
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const WIKIDATA_ENDPOINT = 'https://query.wikidata.org/sparql';
const OUTPUT_FILE = path.join(__dirname, 'plants_db.json');

// SPARQL Query to extract medicinal plants with Russian names
const PLANTS_SPARQL_QUERY = `
SELECT ?plant ?plantLabel ?plantLabelRu ?taxonName ?description ?descriptionRu ?toxicity WHERE {
  ?plant wdt:P31 wd:Q188.  # Instance of: medicinal plant
  ?plant wdt:P225 ?taxonName.  # Taxon name (Latin)
  
  # Get labels in Russian and English
  SERVICE wikibase:label { bd:serviceParam wikibase:language "ru,en". }
  
  # Get description in Russian and English
  OPTIONAL {
    ?plant schema:description ?description.
    FILTER(LANG(?description) = "en")
  }
  OPTIONAL {
    ?plant schema:description ?descriptionRu.
    FILTER(LANG(?descriptionRu) = "ru")
  }
  
  # Get toxicity information
  OPTIONAL {
    ?plant wdt:P2832 ?toxicity.
  }
}
LIMIT 1000
`;

// SPARQL Query to extract diseases with Russian names
const DISEASES_SPARQL_QUERY = `
SELECT ?disease ?diseaseLabel ?diseaseLabelRu ?description ?descriptionRu ?category WHERE {
  ?disease wdt:P31 wd:Q12136.  # Instance of: disease
  ?disease wdt:P1995 ?icd10.  # ICD-10 code
  
  # Get labels in Russian and English
  SERVICE wikibase:label { bd:serviceParam wikibase:language "ru,en". }
  
  # Get description in Russian and English
  OPTIONAL {
    ?disease schema:description ?description.
    FILTER(LANG(?description) = "en")
  }
  OPTIONAL {
    ?disease schema:description ?descriptionRu.
    FILTER(LANG(?descriptionRu) = "ru")
  }
  
  # Try to determine category based on ICD-10 code
  BIND(
    IF(
      STRSTARTS(?icd10, "J"), "Respiratory",
      IF(
        STRSTARTS(?icd10, "K"), "Digestive",
        IF(
          STRSTARTS(?icd10, "F"), "Nervous System",
          IF(
            STRSTARTS(?icd10, "R"), "Pain",
            IF(
              STRSTARTS(?icd10, "L"), "Skin",
              "Other"
            )
          )
        )
      )
    ) AS ?category
  )
}
LIMIT 500
`;

// SPARQL Query to extract plant-disease relationships
const RELATIONSHIPS_SPARQL_QUERY = `
SELECT ?plantLabel ?plantLabelRu ?diseaseLabel ?diseaseLabelRu WHERE {
  ?plant wdt:P31 wd:Q188.  # Medicinal plant
  ?plant wdt:P2175 ?disease.  # Treats medical condition
  ?disease wdt:P31 wd:Q12136.  # Disease
  
  # Get labels in Russian and English
  SERVICE wikibase:label { bd:serviceParam wikibase:language "ru,en". }
}
LIMIT 2000
`;

/**
 * Execute SPARQL query against Wikidata endpoint
 */
function executeSPARQLQuery(query) {
  return new Promise((resolve, reject) => {
    const encodedQuery = encodeURIComponent(query);
    const url = `${WIKIDATA_ENDPOINT}?query=${encodedQuery}&format=json`;
    
    https.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Process plants data from SPARQL results
 */
function processPlantsData(results) {
  console.log('🌿 Processing plants data...');
  
  const plants = [];
  const plantMap = new Map(); // Map Russian name to plant object
  
  for (const binding of results.results.bindings) {
    const plant = {
      wikidataId: binding.plant.value,
      nameRu: binding.plantLabelRu?.value || binding.plantLabel.value,
      nameEn: binding.plantLabel.value,
      latinName: binding.taxonName.value,
      descriptionRu: binding.descriptionRu?.value || '',
      descriptionEn: binding.description?.value || '',
      toxicity: binding.toxicity?.value || null,
      properties: '', // Will be filled from other sources
      uses: [], // Will be filled from other sources
      imagePath: '🌿' // Default icon
    };
    
    plants.push(plant);
    plantMap.set(plant.nameRu, plant);
    plantMap.set(plant.nameEn, plant);
  }
  
  console.log(`   ✅ Processed ${plants.length} plants`);
  return { plants, plantMap };
}

/**
 * Process diseases data from SPARQL results
 */
function processDiseasesData(results) {
  console.log('💊 Processing diseases data...');
  
  const diseases = [];
  const diseaseMap = new Map(); // Map Russian name to disease object
  
  for (const binding of results.results.bindings) {
    const disease = {
      wikidataId: binding.disease.value,
      nameRu: binding.diseaseLabelRu?.value || binding.diseaseLabel.value,
      nameEn: binding.diseaseLabel.value,
      descriptionRu: binding.descriptionRu?.value || '',
      descriptionEn: binding.description?.value || '',
      category: binding.category.value,
      icd10Code: '' // Will be filled if needed
    };
    
    diseases.push(disease);
    diseaseMap.set(disease.nameRu, disease);
    diseaseMap.set(disease.nameEn, disease);
  }
  
  console.log(`   ✅ Processed ${diseases.length} diseases`);
  return { diseases, diseaseMap };
}

/**
 * Process relationships data from SPARQL results
 */
function processRelationshipsData(results, plantMap, diseaseMap) {
  console.log('🔗 Processing plant-disease relationships...');
  
  const relationships = [];
  
  for (const binding of results.results.bindings) {
    const plantNameRu = binding.plantLabelRu?.value || binding.plantLabel.value;
    const plantNameEn = binding.plantLabel.value;
    const diseaseNameRu = binding.diseaseLabelRu?.value || binding.diseaseLabel.value;
    const diseaseNameEn = binding.diseaseLabel.value;
    
    // Find plant and disease objects
    const plant = plantMap.get(plantNameRu) || plantMap.get(plantNameEn);
    const disease = diseaseMap.get(diseaseNameRu) || diseaseMap.get(diseaseNameEn);
    
    if (plant && disease) {
      relationships.push({
        plantNameRu: plant.nameRu,
        plantNameEn: plant.nameEn,
        diseaseNameRu: disease.nameRu,
        diseaseNameEn: disease.nameEn,
        recipe: '', // Will be filled from other sources
        dosage: '', // Will be filled from other sources
        notes: '' // Will be filled from other sources
      });
    }
  }
  
  console.log(`   ✅ Processed ${relationships.length} relationships`);
  return relationships;
}

/**
 * Add sample recipes and dosages (this would normally come from other sources)
 */
function addSampleData(plants, diseases, relationships) {
  console.log('📝 Adding sample recipes and dosages...');
  
  // Sample recipes (in production, this would come from other APIs or databases)
  const sampleRecipes = {
    'Ромашка аптечная': {
      'Простуда': {
        recipe: '1 ст.ложка цветков на стакан кипятка, настоять 15 минут',
        dosage: '3 раза в день по 1/3 стакана',
        notes: 'Не применять при аллергии на сложноцветные'
      },
      'Гастрит': {
        recipe: '1 ч.ложка на стакан кипятка, настоять 20 минут',
        dosage: 'За 30 минут до еды, 3 раза в день',
        notes: ''
      }
    },
    'Мята перечная': {
      'Головная боль': {
        recipe: '1 ч.ложка листьев на чашку, настоять 10 минут',
        dosage: 'При появлении боли',
        notes: ''
      }
    }
  };
  
  // Apply sample recipes to relationships
  for (const rel of relationships) {
    const plantRecipes = sampleRecipes[rel.plantNameRu];
    if (plantRecipes && plantRecipes[rel.diseaseNameRu]) {
      const recipeData = plantRecipes[rel.diseaseNameRu];
      rel.recipe = recipeData.recipe;
      rel.dosage = recipeData.dosage;
      rel.notes = recipeData.notes;
    }
  }
  
  console.log('   ✅ Sample data added');
}

/**
 * Create unified database structure
 */
function createDatabase(plants, diseases, relationships) {
  console.log('💾 Creating unified database structure...');
  
  const database = {
    metadata: {
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      source: 'Wikidata SPARQL endpoint',
      language: 'ru',
      disclaimer: '⚠️ ВНИМАНИЕ: Эта информация носит справочный характер. Перед применением любых лекарственных растений обязательно проконсультируйтесь с врачом.'
    },
    plants: plants.map(plant => ({
      id: plant.wikidataId,
      name: plant.nameRu,
      nameEn: plant.nameEn,
      latinName: plant.latinName,
      description: plant.descriptionRu || plant.descriptionEn,
      properties: plant.properties,
      uses: plant.uses,
      toxicity: plant.toxicity ? '⚠️ Токсичное растение' : '✅ Нетоксичное',
      imagePath: plant.imagePath
    })),
    diseases: diseases.map(disease => ({
      id: disease.wikidataId,
      name: disease.nameRu,
      nameEn: disease.nameEn,
      description: disease.descriptionRu || disease.descriptionEn,
      category: disease.category
    })),
    relationships: relationships.map(rel => ({
      plantName: rel.plantNameRu,
      diseaseName: rel.diseaseNameRu,
      recipe: rel.recipe,
      dosage: rel.dosage,
      notes: rel.notes
    })),
    categories: {
      'Respiratory': 'Заболевания органов дыхания',
      'Digestive': 'Заболевания органов пищеварения',
      'Nervous System': 'Заболевания нервной системы',
      'Pain': 'Болевой синдром',
      'Skin': 'Заболевания кожи',
      'Other': 'Прочие заболевания'
    }
  };
  
  console.log('   ✅ Database structure created');
  return database;
}

/**
 * Save database to JSON file
 */
function saveDatabase(database, filename) {
  console.log(`💾 Saving database to ${filename}...`);
  
  try {
    const json = JSON.stringify(database, null, 2);
    fs.writeFileSync(filename, json, 'utf8');
    console.log(`   ✅ Database saved successfully`);
    console.log(`   📊 Total size: ${(json.length / 1024).toFixed(2)} KB`);
  } catch (error) {
    throw new Error(`Failed to save database: ${error.message}`);
  }
}

/**
 * Main ETL process
 */
async function runETL() {
  console.log('🚀 Starting Wikidata ETL process...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  
  try {
    // Step 1: Fetch plants data
    console.log('📡 Fetching plants data from Wikidata...');
    const plantsResults = await executeSPARQLQuery(PLANTS_SPARQL_QUERY);
    const { plants, plantMap } = processPlantsData(plantsResults);
    console.log('');
    
    // Step 2: Fetch diseases data
    console.log('📡 Fetching diseases data from Wikidata...');
    const diseasesResults = await executeSPARQLQuery(DISEASES_SPARQL_QUERY);
    const { diseases, diseaseMap } = processDiseasesData(diseasesResults);
    console.log('');
    
    // Step 3: Fetch relationships data
    console.log('📡 Fetching plant-disease relationships from Wikidata...');
    const relationshipsResults = await executeSPARQLQuery(RELATIONSHIPS_SPARQL_QUERY);
    let relationships = processRelationshipsData(relationshipsResults, plantMap, diseaseMap);
    console.log('');
    
    // Step 4: Add sample data
    addSampleData(plants, diseases, relationships);
    console.log('');
    
    // Step 5: Create unified database
    const database = createDatabase(plants, diseases, relationships);
    console.log('');
    
    // Step 6: Save to file
    saveDatabase(database, OUTPUT_FILE);
    console.log('');
    
    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ ETL process completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   • Plants extracted: ${plants.length}`);
    console.log(`   • Diseases extracted: ${diseases.length}`);
    console.log(`   • Relationships extracted: ${relationships.length}`);
    console.log('');
    console.log('📁 Output file:');
    console.log(`   ${OUTPUT_FILE}`);
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Review the generated plants_db.json file');
    console.log('   2. Add additional recipes and dosages if needed');
    console.log('   3. Import into the PWA using db-importer.html');
    console.log('   4. Test the application with new data');
    console.log('');
    console.log('⚠️  Medical Disclaimer:');
    console.log(database.metadata.disclaimer);
    
  } catch (error) {
    console.error('');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ ETL process failed!');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('   • Check your internet connection');
    console.error('   • Wikidata endpoint may be temporarily unavailable');
    console.error('   • Try running the script again later');
    process.exit(1);
  }
}

// Run the ETL process
if (require.main === module) {
  runETL();
}

module.exports = { runETL };
