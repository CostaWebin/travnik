## 🌿 Features

### 1. **Data Import from Multiple Sources**

- **PFAF (Plants For A Future)**: 10 sample medicinal plants with English data
- **Dr. Duke's Database**: Phytochemical information
- **Automatic Russian Translation**: Converts plant names to Russian

### 2. **Data Conversion**

- Converts English plant data to your Травник format
- Creates plant-disease relationships
- Generates recipes and dosages in Russian
- Maintains your existing database structure

### 3. **Export Options**

- **JavaScript file**: Ready to paste into browser console
- **JSON file**: For manual integration or backup

### 4. **Sample Plants Included**

- Chamomile (Ромашка аптечная)
- Peppermint (Мята перечная)
- St. John's Wort (Зверобой)
- Calendula (Календула)
- Valerian (Валериана)
- Sage (Шалфей)
- Nettle (Крапива)
- Linden (Липа)
- Thyme (Чабрец)
- Ginger (Имбирь)

## 📥 How to Use

### Option 1: Using the Web Importer Tool

1. **Open the importer tool**: Navigate to `http://localhost:8000/db-importer.html`
2. **Click "Start Import"** in the tool
3. **Download JavaScript** or JSON file
4. **Open your Травник app** in browser (`http://localhost:8000`)
5. **Open browser console** (F12 or Cmd+Option+I)
6. **Paste the JavaScript code** from the downloaded file
7. **Run**: `importExtendedData()`
8. **Refresh** the page to see new plants and diseases!

### Option 2: Direct Import

1. **Open your Травник app** in browser (`http://localhost:8000`)
2. **Open browser console** (F12 or Cmd+Option+I)
3. **Load the import script** by adding to console:
   ```javascript
   const script = document.createElement('script');
   script.src = 'herbal-data-import.js';
   document.head.appendChild(script);
   ```
4. **Wait for script to load** (you'll see a summary in console)
5. **Run**: `importExtendedData()`
6. **Refresh** the page to see new plants and diseases!

### Option 3: Copy-Paste Import

1. **Open `herbal-data-import.js`** in a text editor
2. **Copy the entire file content**
3. **Open your Травник app** in browser (`http://localhost:8000`)
4. **Open browser console** (F12 or Cmd+Option+I)
5. **Paste the code** into the console
6. **Run**: `importExtendedData()`
7. **Refresh** the page to see new plants and diseases!

## 🔗 Database Links Provided

The tool includes direct links to:

- **PFAF Database**: [https://pfaf.org](https://pfaf.org/)
- **Dr. Duke's Database**: [https://phytochem.nal.usda.gov](https://phytochem.nal.usda.gov/)
- **GBIF**: [https://www.gbif.org](https://www.gbif.org/)
- **E-library.ru**: [https://elibrary.ru](https://elibrary.ru/) (Russian sources)

## 🚀 Next Steps

### To Add Real Data from PFAF:

You can manually copy data from PFAF and add it to the tool by modifying the `fetchPFAFData()` function. For each plant, include:

- Common name
- Latin name
- Description
- Medicinal properties
- Uses

### To Expand the Database:

The generated JavaScript code is fully compatible with your existing [`db.js`](db.js:1). You can:

- Run multiple imports
- Add custom recipes
- Translate more plants
- Link plants to existing diseases

## 🔧 Troubleshooting

### Import function not found

**Problem**: `DatabaseManager is not defined`

**Solution**:
1. Make sure [`db.js`](db.js:1) is loaded before running the import
2. Check browser console for errors when loading [`index.html`](index.html:1)
3. Try refreshing the page before running the import

### Plants already exist

**Problem**: Duplicate plants being added

**Solution**:
- The import will add all plants even if they already exist
- To reset the database, run:
  ```javascript
  resetDatabase()
  confirmReset()
  ```
- Then refresh the page to reinitialize with sample data

### Data not showing after import

**Problem**: Import completed but plants/diseases not visible

**Solution**:
1. Refresh the page (F5 or Cmd+R)
2. Clear browser cache if needed
3. Check browser console for errors
4. Verify IndexedDB has data:
   ```javascript
   // In browser console
   indexedDB.open('HerbalGuideDB').onsuccess = (e) => {
     const db = e.target.result;
     const tx = db.transaction(['plants'], 'readonly');
     const store = tx.objectStore('plants');
     store.count().onsuccess = (e) => console.log('Plants:', e.target.result);
   };
   ```

### Importer tool not loading

**Problem**: [`db-importer.html`](db-importer.html:1) page not working

**Solution**:
1. Make sure local server is running: `python3 -m http.server 8000`
2. Check browser console for errors
3. Verify all CDN links are accessible (React, Tailwind, Lucide)
4. Try opening in a different browser

## 📊 Data Structure

### Plant Object
```javascript
{
  name: "Ромашка аптечная",           // Russian name (required)
  description: "Anti-inflammatory...",   // Description (required)
  properties: "Anti-inflammatory...",    // Medicinal properties (required)
  imagePath: "🌿"                      // Icon (optional, defaults to 🌿)
}
```

### Disease Object
```javascript
{
  name: "Простуда",                    // Disease name (required)
  category: "Respiratory",              // Category (required)
  description: "ОРВИ, грипп"            // Description (optional)
}
```

### Plant-Disease Link
```javascript
{
  plant: "Ромашка аптечная",           // Plant name (must exist)
  disease: "Простуда",                 // Disease name (must exist)
  recipe: "1 ст.ложка на стакан...",   // Recipe (required)
  dosage: "3 раза в день...",          // Dosage (required)
  notes: "Не сочетать с..."            // Notes (optional)
}
```

## 🎯 Categories

Valid disease categories:
- `Respiratory` - Respiratory system
- `Digestive` - Digestive system
- `Nervous System` - Nervous system
- `Pain` - Pain management
- `Skin` - Skin conditions
- `Other` - Other conditions

## 💡 Tips

1. **Test with sample data first**: Always test imports with a small dataset before importing large amounts of data

2. **Backup your data**: Before importing new data, export your current database:
   ```javascript
   // Export all data to JSON
   DatabaseManager.getAllPlants().then(console.log);
   DatabaseManager.getAllDiseases().then(console.log);
   ```

3. **Use the web tool**: The [`db-importer.html`](db-importer.html:1) tool provides a visual interface and progress tracking

4. **Check for duplicates**: The importer doesn't check for duplicates, so reset the database before importing if you want a clean slate

5. **Add more data**: You can easily extend the data by adding more entries to [`EXTENDED_PLANTS`](herbal-data-import.js:12), [`EXTENDED_DISEASES`](herbal-data-import.js:96), and [`PLANT_DISEASE_LINKS`](herbal-data-import.js:108) arrays in [`herbal-data-import.js`](herbal-data-import.js:1)