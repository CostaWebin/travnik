#!/usr/bin/env node

/**
 * ============================================
 * Травник - Data Mapping Script
 * ============================================
 * 
 * This script maps plant names to Russian names from Wikidata
 * and creates a comprehensive mapping database.
 * 
 * Usage:
 *   node data-mapping.js
 * 
 * Output:
 *   name-mapping.json - Plant and disease name mappings
 * 
 * ============================================
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const WIKIDATA_ENDPOINT = 'https://query.wikidata.org/sparql';
const OUTPUT_FILE = path.join(__dirname, 'name-mapping.json');

/**
 * SPARQL query to get plant name mappings
 */
const PLANT_NAME_MAPPING_QUERY = `
SELECT ?plant ?latinName ?nameEn ?nameRu ?synonymEn ?synonymRu WHERE {
  ?plant wdt:P31 wd:Q188.  # Medicinal plant
  ?plant wdt:P225 ?latinName.  # Latin name
  
  # Get labels
  SERVICE wikibase:label { bd:serviceParam wikibase:language "ru,en". }
  
  # Get synonyms (also known as)
  OPTIONAL {
    ?plant wdt:P1420 ?synonymEn.
    FILTER(LANG(?synonymEn) = "en")
  }
  OPTIONAL {
    ?plant wdt:P1420 ?synonymRu.
    FILTER(LANG(?synonymRu) = "ru")
  }
}
LIMIT 1000
`;

/**
 * SPARQL query to get disease name mappings
 */
const DISEASE_NAME_MAPPING_QUERY = `
SELECT ?disease ?nameEn ?nameRu ?icd10 ?icd9 WHERE {
  ?disease wdt:P31 wd:Q12136.  # Disease
  
  # Get labels
  SERVICE wikibase:label { bd:serviceParam wikibase:language "ru,en". }
  
  # Get ICD codes
  OPTIONAL {
    ?disease wdt:P1995 ?icd10.
  }
  OPTIONAL {
    ?disease wdt:P4229 ?icd9.
  }
}
LIMIT 500
`;

/**
 * Execute SPARQL query
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
 * Process plant name mappings
 */
function processPlantMappings(results) {
  console.log('🌿 Processing plant name mappings...');
  
  const mappings = [];
  
  for (const binding of results.results.bindings) {
    const mapping = {
      wikidataId: binding.plant.value,
      latinName: binding.latinName.value,
      names: {
        en: [binding.nameEn.value],
        ru: binding.nameRu ? [binding.nameRu.value] : []
      },
      synonyms: {
        en: binding.synonymEn ? [binding.synonymEn.value] : [],
        ru: binding.synonymRu ? [binding.synonymRu.value] : []
      }
    };
    
    mappings.push(mapping);
  }
  
  console.log(`   ✅ Processed ${mappings.length} plant mappings`);
  return mappings;
}

/**
 * Process disease name mappings
 */
function processDiseaseMappings(results) {
  console.log('💊 Processing disease name mappings...');
  
  const mappings = [];
  
  for (const binding of results.results.bindings) {
    const mapping = {
      wikidataId: binding.disease.value,
      names: {
        en: [binding.nameEn.value],
        ru: binding.nameRu ? [binding.nameRu.value] : []
      },
      codes: {
        icd10: binding.icd10?.value || '',
        icd9: binding.icd9?.value || ''
      }
    };
    
    mappings.push(mapping);
  }
  
  console.log(`   ✅ Processed ${mappings.length} disease mappings`);
  return mappings;
}

/**
 * Create search index for fuzzy matching
 */
function createSearchIndex(mappings) {
  console.log('🔍 Creating search index...');
  
  const searchIndex = {
    plants: {},
    diseases: {}
  };
  
  // Index plant names
  for (const mapping of mappings.plants) {
    // Add all name variants
    const allNames = [
      mapping.latinName,
      ...mapping.names.en,
      ...mapping.names.ru,
      ...mapping.synonyms.en,
      ...mapping.synonyms.ru
    ];
    
    for (const name of allNames) {
      const key = name.toLowerCase().trim();
      if (key && !searchIndex.plants[key]) {
        searchIndex.plants[key] = {
          wikidataId: mapping.wikidataId,
          primaryName: mapping.names.ru[0] || mapping.names.en[0],
          latinName: mapping.latinName
        };
      }
    }
  }
  
  // Index disease names
  for (const mapping of mappings.diseases) {
    const allNames = [
      ...mapping.names.en,
      ...mapping.names.ru,
      mapping.codes.icd10,
      mapping.codes.icd9
    ];
    
    for (const name of allNames) {
      const key = name.toLowerCase().trim();
      if (key && !searchIndex.diseases[key]) {
        searchIndex.diseases[key] = {
          wikidataId: mapping.wikidataId,
          primaryName: mapping.names.ru[0] || mapping.names.en[0],
          icd10: mapping.codes.icd10
        };
      }
    }
  }
  
  console.log(`   ✅ Created search index with ${Object.keys(searchIndex.plants).length} plant entries and ${Object.keys(searchIndex.diseases).length} disease entries`);
  return searchIndex;
}

/**
 * Save mappings to JSON file
 */
function saveMappings(mappings, filename) {
  console.log(`💾 Saving mappings to ${filename}...`);
  
  try {
    const json = JSON.stringify(mappings, null, 2);
    fs.writeFileSync(filename, json, 'utf8');
    console.log(`   ✅ Mappings saved successfully`);
    console.log(`   📊 Total size: ${(json.length / 1024).toFixed(2)} KB`);
  } catch (error) {
    throw new Error(`Failed to save mappings: ${error.message}`);
  }
}

/**
 * Main mapping process
 */
async function runMapping() {
  console.log('🚀 Starting name mapping process...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  
  try {
    // Step 1: Fetch plant name mappings
    console.log('📡 Fetching plant name mappings from Wikidata...');
    const plantResults = await executeSPARQLQuery(PLANT_NAME_MAPPING_QUERY);
    const plantMappings = processPlantMappings(plantResults);
    console.log('');
    
    // Step 2: Fetch disease name mappings
    console.log('📡 Fetching disease name mappings from Wikidata...');
    const diseaseResults = await executeSPARQLQuery(DISEASE_NAME_MAPPING_QUERY);
    const diseaseMappings = processDiseaseMappings(diseaseResults);
    console.log('');
    
    // Step 3: Create search index
    const searchIndex = createSearchIndex({
      plants: plantMappings,
      diseases: diseaseMappings
    });
    console.log('');
    
    // Step 4: Create unified mapping structure
    const mappings = {
      metadata: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        source: 'Wikidata SPARQL endpoint'
      },
      plants: plantMappings,
      diseases: diseaseMappings,
      searchIndex: searchIndex
    };
    
    // Step 5: Save to file
    saveMappings(mappings, OUTPUT_FILE);
    console.log('');
    
    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Name mapping process completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   • Plant mappings: ${plantMappings.length}`);
    console.log(`   • Disease mappings: ${diseaseMappings.length}`);
    console.log(`   • Search index entries: ${Object.keys(searchIndex.plants).length + Object.keys(searchIndex.diseases).length}`);
    console.log('');
    console.log('📁 Output file:');
    console.log(`   ${OUTPUT_FILE}`);
    console.log('');
    console.log('📝 Usage:');
    console.log('   1. Load name-mapping.json in your application');
    console.log('   2. Use searchIndex for fuzzy name matching');
    console.log('   3. Map user queries to primary Russian names');
    console.log('   4. Display primary names in the UI');
    
  } catch (error) {
    console.error('');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ Name mapping process failed!');
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

// Run mapping process
if (require.main === module) {
  runMapping();
}

module.exports = { runMapping };
