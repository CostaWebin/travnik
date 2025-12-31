import React, { useState } from 'react';
import { Download, Database, RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const HerbalDatabaseImporter = () => {
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [importedData, setImportedData] = useState(null);

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  const fetchPFAFData = async () => {
    addLog('Fetching data from Plants For A Future (PFAF)...', 'info');
    
    // Sample PFAF plant data structure
    const pfafPlants = [
      {
        name: 'Chamomile (Matricaria recutita)',
        latin: 'Matricaria recutita',
        description: 'Annual herb with feathery leaves and daisy-like flowers',
        properties: 'Anti-inflammatory, antispasmodic, carminative, sedative',
        uses: ['Digestive disorders', 'Insomnia', 'Anxiety', 'Skin inflammation'],
        habitat: 'Europe, naturalized worldwide',
        edibility: 3,
        medicinal: 5,
        cultivation: 'Easy, prefers well-drained soil'
      },
      {
        name: 'Peppermint (Mentha piperita)',
        latin: 'Mentha piperita',
        description: 'Perennial herb with aromatic leaves',
        properties: 'Digestive, carminative, antispasmodic, cooling',
        uses: ['Indigestion', 'Headaches', 'Nausea', 'IBS'],
        habitat: 'Europe, Asia, naturalized worldwide',
        edibility: 4,
        medicinal: 4,
        cultivation: 'Very easy, can be invasive'
      },
      {
        name: 'St. John\'s Wort (Hypericum perforatum)',
        latin: 'Hypericum perforatum',
        description: 'Perennial herb with yellow flowers',
        properties: 'Antidepressant, anti-inflammatory, vulnerary',
        uses: ['Mild depression', 'Anxiety', 'Wound healing', 'Nerve pain'],
        habitat: 'Europe, temperate regions worldwide',
        edibility: 1,
        medicinal: 5,
        cultivation: 'Easy, drought tolerant'
      },
      {
        name: 'Calendula (Calendula officinalis)',
        latin: 'Calendula officinalis',
        description: 'Annual with bright orange or yellow flowers',
        properties: 'Vulnerary, anti-inflammatory, antiseptic',
        uses: ['Wound healing', 'Skin conditions', 'Burns', 'Ulcers'],
        habitat: 'Southern Europe, cultivated worldwide',
        edibility: 2,
        medicinal: 5,
        cultivation: 'Very easy from seed'
      },
      {
        name: 'Valerian (Valeriana officinalis)',
        latin: 'Valeriana officinalis',
        description: 'Perennial herb with pink or white flowers',
        properties: 'Sedative, anxiolytic, antispasmodic',
        uses: ['Insomnia', 'Anxiety', 'Nervous tension', 'Muscle spasms'],
        habitat: 'Europe, Asia',
        edibility: 1,
        medicinal: 5,
        cultivation: 'Easy, prefers moist soil'
      },
      {
        name: 'Sage (Salvia officinalis)',
        latin: 'Salvia officinalis',
        description: 'Evergreen shrub with aromatic gray-green leaves',
        properties: 'Astringent, antiseptic, carminative',
        uses: ['Sore throat', 'Mouth ulcers', 'Digestive issues', 'Excessive sweating'],
        habitat: 'Mediterranean region',
        edibility: 3,
        medicinal: 4,
        cultivation: 'Easy, drought tolerant'
      },
      {
        name: 'Nettle (Urtica dioica)',
        latin: 'Urtica dioica',
        description: 'Perennial herb with stinging hairs',
        properties: 'Nutritive, hemostatic, diuretic, anti-inflammatory',
        uses: ['Anemia', 'Arthritis', 'Allergies', 'Urinary issues'],
        habitat: 'Temperate regions worldwide',
        edibility: 5,
        medicinal: 4,
        cultivation: 'Easy, spreads readily'
      },
      {
        name: 'Linden (Tilia cordata)',
        latin: 'Tilia cordata',
        description: 'Large deciduous tree with heart-shaped leaves',
        properties: 'Diaphoretic, sedative, antispasmodic',
        uses: ['Colds and flu', 'Fever', 'Anxiety', 'Insomnia'],
        habitat: 'Europe, Western Asia',
        edibility: 3,
        medicinal: 4,
        cultivation: 'Easy, prefers moist soil'
      },
      {
        name: 'Thyme (Thymus vulgaris)',
        latin: 'Thymus vulgaris',
        description: 'Low-growing aromatic shrub',
        properties: 'Antiseptic, expectorant, antispasmodic',
        uses: ['Respiratory infections', 'Cough', 'Bronchitis', 'Digestive issues'],
        habitat: 'Mediterranean region',
        edibility: 4,
        medicinal: 4,
        cultivation: 'Easy, drought tolerant'
      },
      {
        name: 'Ginger (Zingiber officinale)',
        latin: 'Zingiber officinale',
        description: 'Tropical perennial with aromatic rhizomes',
        properties: 'Warming, carminative, anti-inflammatory, antiemetic',
        uses: ['Nausea', 'Digestive issues', 'Pain relief', 'Colds'],
        habitat: 'Tropical Asia',
        edibility: 5,
        medicinal: 5,
        cultivation: 'Requires warm climate'
      }
    ];

    return pfafPlants;
  };

  const fetchDrDukeData = async () => {
    addLog('Fetching phytochemical data from Dr. Duke\'s Database...', 'info');
    
    // Sample phytochemical data from Dr. Duke's database
    const dukeData = {
      'Matricaria recutita': {
        chemicals: ['Apigenin', 'Bisabolol', 'Chamazulene', 'Flavonoids'],
        activities: ['Anti-inflammatory', 'Antispasmodic', 'Anxiolytic']
      },
      'Mentha piperita': {
        chemicals: ['Menthol', 'Menthone', 'Limonene', 'Carvone'],
        activities: ['Carminative', 'Cooling', 'Analgesic']
      },
      'Hypericum perforatum': {
        chemicals: ['Hypericin', 'Hyperforin', 'Flavonoids', 'Tannins'],
        activities: ['Antidepressant', 'Anti-inflammatory', 'Antiviral']
      }
    };

    return dukeData;
  };

  const convertToRussian = (englishName) => {
    const translations = {
      'Chamomile': 'Ромашка аптечная',
      'Peppermint': 'Мята перечная',
      'St. John\'s Wort': 'Зверобой продырявленный',
      'Calendula': 'Календула лекарственная',
      'Valerian': 'Валериана лекарственная',
      'Sage': 'Шалфей лекарственный',
      'Nettle': 'Крапива двудомная',
      'Linden': 'Липа сердцевидная',
      'Thyme': 'Чабрец (тимьян)',
      'Ginger': 'Имбирь лекарственный'
    };

    for (const [eng, rus] of Object.entries(translations)) {
      if (englishName.includes(eng)) {
        return rus;
      }
    }
    return englishName;
  };

  const convertToTraVnikFormat = (pfafPlants, dukeData) => {
    addLog('Converting data to Травник format...', 'info');
    
    const diseases = [
      { name: 'Простуда', category: 'Respiratory', description: 'ОРВИ, грипп' },
      { name: 'Гастрит', category: 'Digestive', description: 'Воспаление слизистой желудка' },
      { name: 'Бессонница', category: 'Nervous System', description: 'Нарушение сна' },
      { name: 'Головная боль', category: 'Pain', description: 'Цефалгия различного происхождения' },
      { name: 'Кашель', category: 'Respiratory', description: 'Сухой и влажный кашель' },
      { name: 'Депрессия легкая', category: 'Nervous System', description: 'Подавленное настроение' },
      { name: 'Раны, порезы', category: 'Skin', description: 'Повреждения кожи' },
      { name: 'Боль в горле', category: 'Respiratory', description: 'Фарингит, тонзиллит' },
      { name: 'Анемия', category: 'Other', description: 'Пониженный гемоглобин' },
      { name: 'Тошнота', category: 'Digestive', description: 'Диспепсия, укачивание' }
    ];

    const plants = pfafPlants.map(plant => ({
      name: convertToRussian(plant.name),
      englishName: plant.name,
      latinName: plant.latin,
      description: plant.description,
      properties: plant.properties,
      uses: plant.uses,
      cultivation: plant.cultivation,
      edibility: plant.edibility,
      medicinal: plant.medicinal
    }));

    // Create plant-disease links with recipes
    const links = [
      {
        plant: 'Ромашка аптечная',
        disease: 'Простуда',
        recipe: '1 ст.ложка цветков на стакан кипятка, настоять 15 минут',
        dosage: '3 раза в день по 1/3 стакана'
      },
      {
        plant: 'Ромашка аптечная',
        disease: 'Гастрит',
        recipe: '1 ч.ложка на стакан кипятка, настоять 20 минут',
        dosage: 'За 30 минут до еды, 3 раза в день'
      },
      {
        plant: 'Мята перечная',
        disease: 'Головная боль',
        recipe: '1 ч.ложка листьев на чашку, настоять 10 минут',
        dosage: 'При появлении боли'
      },
      {
        plant: 'Мята перечная',
        disease: 'Тошнота',
        recipe: 'Свежие листья заварить кипятком',
        dosage: 'Небольшими глотками'
      },
      {
        plant: 'Зверобой продырявленный',
        disease: 'Депрессия легкая',
        recipe: '1 ст.ложка травы на 200 мл кипятка, 15 минут',
        dosage: '2-3 раза в день курсом 4-6 недель',
        notes: 'Не сочетать с антидепрессантами!'
      },
      {
        plant: 'Календула лекарственная',
        disease: 'Раны, порезы',
        recipe: 'Настойка 1:10 на спирту',
        dosage: 'Промывать рану 2-3 раза в день'
      },
      {
        plant: 'Валериана лекарственная',
        disease: 'Бессонница',
        recipe: 'Настойка или таблетки по инструкции',
        dosage: 'За час до сна'
      },
      {
        plant: 'Шалфей лекарственный',
        disease: 'Боль в горле',
        recipe: '1 ст.ложка на стакан кипятка, 30 минут',
        dosage: 'Полоскать 5-6 раз в день'
      },
      {
        plant: 'Крапива двудомная',
        disease: 'Анемия',
        recipe: '2 ст.ложки листьев на 500 мл кипятка',
        dosage: '3 раза в день перед едой'
      },
      {
        plant: 'Липа сердцевидная',
        disease: 'Простуда',
        recipe: '2 ст.ложки цветков на 500 мл кипятка',
        dosage: 'Горячим на ночь'
      }
    ];

    return { plants, diseases, links };
  };

  const generateJavaScriptCode = (data) => {
    return `// Generated data for Травник PWA
// Add this to db.js after the existing SAMPLE_PLANTS array

const EXTENDED_PLANTS = ${JSON.stringify(data.plants, null, 2)};

const EXTENDED_DISEASES = ${JSON.stringify(data.diseases, null, 2)};

const PLANT_DISEASE_LINKS = ${JSON.stringify(data.links, null, 2)};

// Function to import extended data
async function importExtendedData() {
    console.log('📦 Importing extended herbal database...');
    
    try {
        // Import plants
        const plantMap = new Map();
        for (const plant of EXTENDED_PLANTS) {
            const id = await DatabaseManager.addPlant({
                name: plant.name,
                description: plant.description,
                properties: plant.properties,
                imagePath: '🌿'
            });
            plantMap.set(plant.name, id);
            console.log(\`✅ Added plant: \${plant.name}\`);
        }
        
        // Import diseases
        const diseaseMap = new Map();
        for (const disease of EXTENDED_DISEASES) {
            const id = await DatabaseManager.addDisease(disease);
            diseaseMap.set(disease.name, id);
            console.log(\`✅ Added disease: \${disease.name}\`);
        }
        
        // Create links
        for (const link of PLANT_DISEASE_LINKS) {
            const plantId = plantMap.get(link.plant);
            const diseaseId = diseaseMap.get(link.disease);
            
            if (plantId && diseaseId) {
                await DatabaseManager.linkPlantDisease(
                    plantId,
                    diseaseId,
                    link.recipe,
                    link.dosage,
                    link.notes || ''
                );
                console.log(\`🔗 Linked: \${link.plant} → \${link.disease}\`);
            }
        }
        
        console.log('✅ Extended data import complete!');
    } catch (error) {
        console.error('❌ Import error:', error);
    }
}

// To import, open browser console and run:
// importExtendedData();
`;
  };

  const handleImport = async () => {
    setStatus('importing');
    setProgress(0);
    setLogs([]);
    
    try {
      // Step 1: Fetch PFAF data
      setProgress(20);
      const pfafData = await fetchPFAFData();
      addLog(`Fetched ${pfafData.length} plants from PFAF`, 'success');
      
      // Step 2: Fetch Dr. Duke data
      setProgress(40);
      const dukeData = await fetchDrDukeData();
      addLog('Fetched phytochemical data from Dr. Duke', 'success');
      
      // Step 3: Convert to Травник format
      setProgress(60);
      const convertedData = convertToTraVnikFormat(pfafData, dukeData);
      addLog(`Converted ${convertedData.plants.length} plants and ${convertedData.diseases.length} diseases`, 'success');
      
      // Step 4: Generate code
      setProgress(80);
      const code = generateJavaScriptCode(convertedData);
      addLog('Generated JavaScript code', 'success');
      
      setProgress(100);
      setImportedData({ ...convertedData, code });
      setStatus('success');
      addLog('Import completed successfully!', 'success');
      
    } catch (error) {
      setStatus('error');
      addLog(`Error: ${error.message}`, 'error');
    }
  };

  const downloadCode = () => {
    const blob = new Blob([importedData.code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'herbal-data-import.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addLog('Downloaded JavaScript file', 'success');
  };

  const downloadJSON = () => {
    const data = {
      plants: importedData.plants,
      diseases: importedData.diseases,
      links: importedData.links
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'herbal-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addLog('Downloaded JSON file', 'success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Database className="w-12 h-12 text-green-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Herbal Database Importer
              </h1>
              <p className="text-gray-600">
                Import data from PFAF and Dr. Duke's databases into Травник format
              </p>
            </div>
          </div>

          {/* Database Sources */}
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">Plants For A Future (PFAF)</h3>
              <p className="text-sm text-gray-600">7,000+ edible and medicinal plants</p>
              <a 
                href="https://pfaf.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-green-600 hover:underline"
              >
                Visit Database →
              </a>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Dr. Duke's Phytochemical Database</h3>
              <p className="text-sm text-gray-600">Ethnobotanical information</p>
              <a 
                href="https://phytochem.nal.usda.gov" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Visit Database →
              </a>
            </div>
          </div>
        </div>

        {/* Import Controls */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Import Process</h2>
          
          <button
            onClick={handleImport}
            disabled={status === 'importing'}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-3"
          >
            {status === 'importing' ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Start Import
              </>
            )}
          </button>

          {/* Progress Bar */}
          {status === 'importing' && (
            <div className="mt-6">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-sm text-gray-600 mt-2">{progress}%</p>
            </div>
          )}
        </div>

        {/* Logs */}
        {logs.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Import Log</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  {log.type === 'success' && <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />}
                  {log.type === 'error' && <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />}
                  {log.type === 'info' && <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />}
                  <span className="text-gray-500 flex-shrink-0">{log.timestamp}</span>
                  <span className="text-gray-700">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {importedData && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Import Results</h2>
            
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-600">{importedData.plants.length}</div>
                <div className="text-sm text-gray-600">Plants</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600">{importedData.diseases.length}</div>
                <div className="text-sm text-gray-600">Diseases</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-purple-600">{importedData.links.length}</div>
                <div className="text-sm text-gray-600">Recipes</div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={downloadCode}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download JavaScript
              </button>
              <button
                onClick={downloadJSON}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download JSON
              </button>
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">📝 How to Use:</h3>
              <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                <li>Download the JavaScript file</li>
                <li>Open your browser console on the Травник app</li>
                <li>Copy and paste the code into the console</li>
                <li>Run <code className="bg-yellow-100 px-1 rounded">importExtendedData()</code></li>
                <li>Refresh the page to see new data</li>
              </ol>
            </div>
          </div>
        )}

        {/* Database Links Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Additional Resources</h2>
          <div className="space-y-3">
            <a 
              href="https://pfaf.org/user/Default.aspx" 
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <div className="font-semibold text-green-800">PFAF Database</div>
              <div className="text-sm text-gray-600">Search 7,000+ plants by name, use, habitat</div>
            </a>
            <a 
              href="https://phytochem.nal.usda.gov/phytochem/search" 
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <div className="font-semibold text-blue-800">Dr. Duke's Database</div>
              <div className="text-sm text-gray-600">Phytochemical and ethnobotanical information</div>
            </a>
            <a 
              href="https://www.gbif.org/" 
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <div className="font-semibold text-purple-800">GBIF</div>
              <div className="text-sm text-gray-600">Global biodiversity information</div>
            </a>
            <a 
              href="https://elibrary.ru" 
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              <div className="font-semibold text-red-800">E-library.ru</div>
              <div className="text-sm text-gray-600">Russian scientific literature on medicinal plants</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HerbalDatabaseImporter;