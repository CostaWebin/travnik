# 🚀 Quick Start Guide - Database Importer

## Overview

The Травник PWA now includes a **Database Importer Tool** that allows you to extend the herbal database with additional plants, diseases, and recipes from external sources like PFAF and Dr. Duke's Phytochemical Database.

---

## 📁 Files Created

1. **[`db-importer.html`](db-importer.html:1)** - Visual web interface for importing data
2. **[`herbal-data-import.js`](herbal-data-import.js:1)** - JavaScript import script with extended data
3. **[`README-DB.md`](README-DB.md:1)** - Detailed documentation and troubleshooting

---

## 🎯 Three Ways to Import Data

### Method 1: Web Importer Tool (Recommended)

**Best for:** Visual interface, progress tracking, downloading files

**Steps:**
1. Open your browser and navigate to: `http://localhost:8000/db-importer.html`
2. Click "Start Import" button
3. Watch the import progress in real-time
4. Download the generated JavaScript or JSON file
5. Open your Травник app: `http://localhost:8000`
6. Open browser console (F12 or Cmd+Option+I)
7. Paste the downloaded code into the console
8. Run: `importExtendedData()`
9. Refresh the page to see new data

**Pros:**
- Visual progress tracking
- Downloadable files for backup
- Clear error messages
- Links to external databases

---

### Method 2: Direct Script Loading

**Best for:** Quick import without downloading files

**Steps:**
1. Open your Травник app in browser: `http://localhost:8000`
2. Open browser console (F12 or Cmd+Option+I)
3. Run this command in the console:
   ```javascript
   const script = document.createElement('script');
   script.src = 'herbal-data-import.js';
   document.head.appendChild(script);
   ```
4. Wait for the script to load (you'll see a summary in console)
5. Run: `importExtendedData()`
6. Refresh the page to see new data

**Pros:**
- No file downloads needed
- Fast and direct
- Works offline after first load

---

### Method 3: Copy-Paste

**Best for:** Maximum control, offline usage

**Steps:**
1. Open [`herbal-data-import.js`](herbal-data-import.js:1) in a text editor
2. Copy the entire file content
3. Open your Травник app in browser: `http://localhost:8000`
4. Open browser console (F12 or Cmd+Option+I)
5. Paste the code into the console
6. Run: `importExtendedData()`
7. Refresh the page to see new data

**Pros:**
- Works completely offline
- Can modify data before importing
- No external dependencies

---

## 📊 What Gets Imported

### Current Extended Data Includes:

**10 New Plants:**
- Эхинацея пурпурная (Purple Coneflower)
- Эвкалипт шаровидный (Blue Gum)
- Ромашка римская (Roman Chamomile)
- Боярышник колючий (Hawthorn)
- Мелисса лекарственная (Lemon Balm)
- Роза шиповника (Rosehip)
- Подорожник большой (Plantain)
- Пустырник пятилопастный (Motherwort)
- Золотой ус (Golden Root)
- Алоэ древовидное (Aloe Vera)

**15 New Diseases:**
- Грипп, Бронхит, Аллергия (Respiratory)
- Изжога, Запор, Диарея (Digestive)
- Стресс, Тревожность (Nervous System)
- Мигрень, Артрит (Pain)
- Ожоги, Угревая сыпь, Герпес (Skin)
- Авитаминоз, Снижение иммунитета (Other)

**19 Recipes:**
- Detailed preparation instructions
- Dosage recommendations
- Notes and warnings

---

## 🔍 Verifying Import

After importing, verify the data:

1. **Search for new plants:**
   - Type "эхинацея" in the plant search
   - Should see "Эхинацея пурпурная"

2. **Search for new diseases:**
   - Select "Respiratory" category
   - Should see "Грипп" and "Бронхит"

3. **Check recipes:**
   - Click on any plant
   - Scroll to "Рекомендуется при:" section
   - Should see linked diseases with recipes

---

## 🛠️ Troubleshooting

### Import function not found

**Error:** `DatabaseManager is not defined`

**Solution:**
- Make sure [`db.js`](db.js:1) is loaded before running import
- Refresh the page and try again
- Check browser console for errors when loading [`index.html`](index.html:1)

### Data not showing after import

**Solution:**
- Refresh the page (F5 or Cmd+R)
- Clear browser cache if needed
- Check IndexedDB has data:
  ```javascript
  indexedDB.open('HerbalGuideDB').onsuccess = (e) => {
    const db = e.target.result;
    const tx = db.transaction(['plants'], 'readonly');
    const store = tx.objectStore('plants');
    store.count().onsuccess = (e) => console.log('Plants:', e.target.result);
  };
  ```

### Duplicate entries

**Issue:** Same plants appearing multiple times

**Solution:**
- Reset database and start fresh:
  ```javascript
  resetDatabase()
  confirmReset()
  ```
- Refresh page to reinitialize with sample data
- Run import again

### Importer tool not loading

**Solution:**
- Make sure local server is running: `python3 -m http.server 8000`
- Check browser console for errors
- Verify CDN links are accessible (React, Tailwind, Lucide icons)
- Try opening in a different browser

---

## 📝 Adding Custom Data

To add your own plants and diseases:

1. **Open [`herbal-data-import.js`](herbal-data-import.js:1)** in a text editor
2. **Add to `EXTENDED_PLANTS` array:**
   ```javascript
   {
     "name": "Ваше растение",
     "englishName": "Your Plant (Latin name)",
     "latinName": "Latin name",
     "description": "Description",
     "properties": "Medicinal properties",
     "uses": ["Use 1", "Use 2"],
     "cultivation": "Growing instructions",
     "edibility": 3,
     "medicinal": 5
   }
   ```

3. **Add to `EXTENDED_DISEASES` array:**
   ```javascript
   {
     "name": "Ваша болезнь",
     "category": "Respiratory",
     "description": "Description"
   }
   ```

4. **Add to `PLANT_DISEASE_LINKS` array:**
   ```javascript
   {
     "plant": "Ваше растение",
     "disease": "Ваша болезнь",
     "recipe": "Preparation instructions",
     "dosage": "Dosage instructions",
     "notes": "Optional notes"
   }
   ```

5. **Save the file**
6. **Run import** using any of the three methods above

---

## 🎨 Using the Web Importer Tool

The [`db-importer.html`](db-importer.html:1) tool provides:

- **Visual Progress Bar**: Shows import progress in real-time
- **Detailed Logs**: Color-coded log messages (info, success, error)
- **Download Options**: Export as JavaScript or JSON
- **Statistics**: Shows counts of plants, diseases, and recipes
- **External Links**: Direct links to PFAF, Dr. Duke's, GBIF, and E-library.ru

### Features:

1. **Database Sources**:
   - PFAF: 7,000+ edible and medicinal plants
   - Dr. Duke's: Phytochemical database
   - GBIF: Global biodiversity information
   - E-library.ru: Russian scientific literature

2. **Data Conversion**:
   - Automatic Russian translation
   - Травnik format compatibility
   - Recipe generation

3. **Export Options**:
   - JavaScript: Ready to paste into console
   - JSON: For backup or manual integration

---

## 📚 Next Steps

1. **Test the import**: Try importing the sample data
2. **Explore the data**: Search for new plants and diseases
3. **Add your own data**: Customize the import script
4. **Backup regularly**: Export your database as JSON
5. **Share with others**: Send the import script to friends

---

## 🆘 Support

For issues or questions:

1. Check [`README-DB.md`](README-DB.md:1) for detailed troubleshooting
2. Review [`DOCUMENTATION.md`](DOCUMENTATION.md:1) for PWA documentation
3. Check browser console for error messages
4. Test in different browsers (Chrome, Firefox, Safari)

---

**Last Updated:** 2025-12-31
**Version:** 1.0.0
