# 🌱 Травник - Herbal Guide PWA

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Deployment Guide](#deployment-guide)
- [GitHub SSH Setup](#github-ssh-setup)
- [Hosting Options](#hosting-options)
- [Offline Usage](#offline-usage)
- [Social Sharing](#social-sharing)
- [Technical Details](#technical-details)
- [Troubleshooting](#troubleshooting)

---

## Overview

**Травник** (Herbal Guide) is a production-ready Progressive Web App (PWA) for searching medicinal plants and diseases. Built with modern web technologies and following Context7 best practices.

### Tech Stack
- **HTML5** - Semantic markup with accessibility features
- **CSS3** - Mobile-first fluid design with custom properties
- **JavaScript (ES6+)** - Modern vanilla JavaScript
- **IndexedDB** - Local database for offline storage
- **Service Worker** - Caching for offline functionality
- **Phosphor Icons** - Professional icon library

### Design System
- Mobile-first responsive design
- Fluid typography using `clamp()` functions
- CSS custom properties with `--herbal-*` prefix
- Dark mode support via `prefers-color-scheme`
- Reduced motion support for accessibility
- WCAG 2.1 AA compliance

---

## Features

### 🌿 Plant Search
- Fuzzy search with autocomplete
- Real-time filtering (300ms debounce)
- Plant details with properties and descriptions
- Disease associations with recipes and dosages

### 💊 Disease Search
- Category filters (Respiratory, Digestive, Nervous System, Pain, Skin, Other)
- Fuzzy search by name
- Disease details with recommended plants
- Recipe links with preparation instructions

### ⭐ Favorites System
- Add/remove plants and diseases to favorites
- Persistent storage using localStorage
- Export favorites to text file
- Favorites organized by type (plants/diseases)

### 📤 Share & Export
- Web Share API with clipboard fallback
- Export favorites as downloadable text file
- Share recipes with detailed information

### 💡 Tips Section
- Random herbal tips on each view
- Refresh button for new tips
- Educational content about herbal medicine

### 🕒 Recently Viewed
- Track last 5 viewed items
- Quick access to recently viewed plants/diseases
- Automatic timestamp management

### 📴 Offline Mode
- Service Worker caching strategy
- Offline indicator banner
- Full functionality without internet connection
- Automatic sync when online

### 🏠 PWA Installation
- Install prompt banner
- Add to home screen support
- Standalone app mode
- Custom icons (72, 96, 128, 144, 152, 192, 384, 512px)

---

## Quick Start

### Local Development

1. **Clone or download the project**
```bash
cd /path/to/projects
# If you have the files, navigate to the directory
cd /Users/stok/Documents/herbal_pwa
```

2. **Start local server**
```bash
# Python 3
python3 -m http.server 8000

# Or use Node.js http-server
npx http-server -p 8000

# Or use PHP built-in server
php -S localhost:8000
```

3. **Open in browser**
```
http://localhost:8000
```

4. **Generate PWA icons**
- Open `http://localhost:8000/generate-icons.html`
- Click "Generate & Download All Icons"
- Move downloaded PNG files to `icons/` folder
- Refresh browser to see updated icons

---

## Deployment Guide

### Option 1: GitHub Pages (Recommended)

#### Prerequisites
- GitHub account
- Git installed on macOS (`git --version`)
- SSH key configured

#### Step-by-Step Deployment

1. **Create SSH Key** (if you don't have one)
```bash
# Generate new SSH key (ed25519 is recommended)
ssh-keygen -t ed25519 -C "your_email@example.com" -f ~/.ssh/github_ed25519

# Start SSH agent and add key
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/github_ed25519

# Copy public key to clipboard
cat ~/.ssh/github_ed25519.pub | pbcopy
```

2. **Add SSH Key to GitHub**
- Go to https://github.com/settings/keys
- Click "New SSH key"
- Paste the public key
- Give it a title (e.g., "MacBook SSH Key")
- Click "Add SSH key"

3. **Initialize Git Repository**
```bash
# Navigate to project directory
cd /Users/stok/Documents/herbal_pwa

# Initialize git
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: Herbal Guide PWA with Phosphor icons"

# Rename branch to main (GitHub now uses 'main' by default)
git branch -M main
```

4. **Create GitHub Repository**
- Go to https://github.com/new
- Repository name: `travnik` (or your preferred name)
- Set as Public or Private
- Click "Create repository"

5. **Add Remote Repository**
```bash
# Add remote using SSH (not HTTPS!)
git remote add origin git@github.com:CostaWebin/travnik.git
```

6. **Push to GitHub**
```bash
# Push to GitHub
git push -u origin main
```

7. **Enable GitHub Pages**
- Go to https://github.com/CostaWebin/travnik/settings/pages
- Under "Source", select "Deploy from a branch"
- Select `main` branch
- Click "Save"

Your app will be available at: `https://costawebin.github.io/travnik/`

---

### Option 2: Netlify (Easiest)

1. **Prepare project**
```bash
# Create a netlify.toml file (optional)
touch netlify.toml
```

2. **Deploy**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

Or use **drag & drop**:
1. Go to https://app.netlify.com/drop
2. Drag the `herbal_pwa` folder
3. Netlify will deploy automatically

---

### Option 3: Vercel

1. **Prepare project**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

Or use **GitHub integration**:
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Vercel will auto-deploy on push

---

### Option 4: Cloudflare Pages

1. **Deploy via Wrangler**
```bash
# Install Wrangler
npm install -g @cloudflare/wrangler

# Deploy
wrangler pages deploy herbal_pwa
```

---

## GitHub SSH Setup

### Generate SSH Key (macOS)

```bash
# Generate new SSH key with email
ssh-keygen -t ed25519 -C "your_email@example.com" -f ~/.ssh/github_ed25519

# Start SSH agent
eval "$(ssh-agent -s)"

# Add key to agent
ssh-add ~/.ssh/github_ed25519

# Display public key
cat ~/.ssh/github_ed25519.pub
```

### Add to GitHub

1. Copy the public key output
2. Go to https://github.com/settings/keys
3. Click "New SSH key"
4. Paste the key
5. Save

### Test SSH Connection

```bash
# Test connection to GitHub
ssh -T git@github.com

# Should see: Hi username! You've successfully authenticated...
```

### Configure Git to Use SSH

```bash
# Add remote with SSH URL
git remote add origin git@github.com:username/repo.git

# Verify remote
git remote -v

# Should show: origin git@github.com:username/repo.git (fetch)
```

### Push Commands

```bash
# Initial push
git push -u origin main

# Subsequent pushes
git push

# Pull changes
git pull origin main
```

---

## Hosting Options

### Comparison Table

| Platform | Difficulty | HTTPS | Custom Domain | Build Time | Best For |
|-----------|-----------|--------|---------------|------------|-----------|
| GitHub Pages | Medium | ✅ Free | Manual | Personal projects |
| Netlify | Easy | ✅ Free | Fast | Quick deployment |
| Vercel | Easy | ✅ Free | Fast | Professional apps |
| Cloudflare Pages | Medium | ✅ Free | Fast | Global CDN |

### Custom Domain Setup

All platforms support custom domains:

**GitHub Pages:**
1. Buy domain (e.g., Namecheap, GoDaddy)
2. Go to repository Settings → Pages
3. Add custom domain
4. Update DNS records as instructed

**Netlify/Vercel:**
1. Add domain in platform settings
2. Update DNS to point to platform

---

## Offline Usage

### How Offline Mode Works

1. **First Visit Online**
   - Open app while connected to internet
   - Service Worker (`sw.js`) caches all assets
   - IndexedDB stores all plant/disease data locally

2. **Offline Mode**
   - Disconnect from internet
   - App continues working using cached content
   - All features work: search, favorites, tips, details

3. **Offline Indicator**
   - Banner appears at top when offline
   - Shows: `<i class="ph-bold ph-warning"></i> Работаете оффлайн`
   - Changes to: `<i class="ph-bold ph-check-circle"></i> Снова онлайн` when reconnected

### Service Worker Caching Strategy

The `sw.js` uses a **cache-first** strategy:

1. **On first visit** → caches all files
2. **On subsequent visits** → serves from cache
3. **If cache misses** → falls back to network
4. **Automatically updates** → in background when online

### Data Storage

- **IndexedDB**: Stores plants, diseases, and recipe links
- **localStorage**: Stores favorites and recently viewed items
- **Cache API**: Stores HTML, CSS, JS, and images

All data persists locally, so you don't need an internet connection to:
- Search for plants and diseases
- View detailed information
- Manage favorites
- Read recipes and dosages

---

## Social Sharing

### VKontakte (ВКонтакте)

**Important:** VKontakte is a social platform, not hosting. You share a **link** to your hosted app.

#### How to Share:

1. Host your app first (see [Deployment Guide](#deployment-guide))
2. Copy the URL (e.g., `https://costawebin.github.io/travnik/`)
3. Create a post on VKontakte

#### Example VKontakte Post:

```
🌱 Травник - справочник лекарственных растений
📱 PWA работает оффлайн!
🔗 https://costawebin.github.io/travnik/

Поиск растений и болезней, рецепты, избранное
```

#### VKontakte Post Features:
- Add photos of the app interface
- Include hashtags: #травник #лекарственныерастения #пва
- Pin the post to your profile
- Share to VK groups

### Russian Max Messenger

Max Messenger is similar to VKontakte - share a link to your hosted app.

#### How to Share:

1. Copy your app URL
2. Open Max Messenger
3. Create a new message or post
4. Paste the URL with description

#### Example Max Post:

```
🌱 Травник - справочник лекарственных растений

PWA работает оффлайн! Все растения, болезни и рецепты доступны без интернета.

🔗 https://costawebin.github.io/travnik/
```

### Alternative: QR Code

Create a QR code linking to your hosted app:

1. Go to https://qr-code-generator.com/
2. Enter your app URL
3. Download QR code image
4. Share QR code on social media

---

## Technical Details

### File Structure

```
herbal_pwa/
├── manifest.json          # PWA configuration
├── index.html            # Main HTML file
├── styles.css             # Design system and styles
├── app.js                # Application logic
├── db.js                 # IndexedDB wrapper
├── sw.js                 # Service Worker
├── generate-icons.html   # Icon generator tool
├── icons/                # PWA icons (generated)
│   ├── README.md
│   ├── icon-72.png
│   ├── icon-96.png
│   ├── icon-128.png
│   ├── icon-144.png
│   ├── icon-152.png
│   ├── icon-192.png
│   ├── icon-384.png
│   └── icon-512.png
├── README.md             # Project documentation
└── DOCUMENTATION.md      # This file
```

### CSS Variables

```css
:root {
    /* Colors */
    --herbal-primary: #2d5016;
    --herbal-primary-light: #4a7c3b;
    --herbal-bg: #f0f8f0;
    --herbal-text: #1a1a1a;
    --herbal-text-secondary: #4a5568;
    
    /* Fluid Spacing */
    --herbal-space-xs: clamp(0.25rem, 0.5vw + 0.125rem, 0.375rem);
    --herbal-space-md: clamp(0.75rem, 1.5vw + 0.5rem, 1rem);
    --herbal-space-lg: clamp(1rem, 2vw + 0.75rem, 1.5rem);
    
    /* Fluid Typography */
    --herbal-font-size-base: clamp(1rem, 0.5vw + 0.875rem, 1.125rem);
    --herbal-font-size-lg: clamp(1.125rem, 0.6vw + 1rem, 1.25rem);
}
```

### Phosphor Icons Used

| Icon | Class | Usage |
|-------|---------|--------|
| Plant | `ph ph-plant` | Plant cards, search results |
| Plant (Bold) | `ph-bold ph-plant` | Headers, active states |
| Pill | `ph-bold ph-pill` | Disease cards, search results |
| Star | `ph-bold ph-star` | Favorites, active states |
| Star (Empty) | `ph ph-star` | Empty star, inactive states |
| Magnifying Glass | `ph-bold ph-magnifying-glass` | Search inputs, empty states |
| Lightbulb | `ph-bold ph-lightbulb` | Tips section |
| Clock | `ph-bold ph-clock-counter-clockwise` | Recently viewed |
| Lungs | `ph-bold ph-lungs` | Respiratory category |
| Brain | `ph-bold ph-brain` | Nervous System category |
| Bowl Food | `ph-bold ph-bowl-food` | Digestive category |
| Warning Circle | `ph-bold ph-warning-circle` | Pain category |
| Bandage | `ph-bold ph-bandage` | Skin category |
| Export | `ph-bold ph-export` | Share button |
| Download | `ph-bold ph-download` | Export button |
| Warning | `ph-bold ph-warning` | Notes, alerts |
| X | `ph-bold ph-x` | Close buttons |
| Check Circle | `ph-bold ph-check-circle` | Success states |
| X Circle | `ph-bold ph-x-circle` | Error states |
| Arrow Right | `ph-bold ph-arrow-right` | Navigation arrows |
| Caret Right | `ph-bold ph-caret-right` | List items |

### Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 15+
- Opera 76+
- Samsung Internet 14+

### PWA Requirements Met

✅ Manifest with all required fields
✅ Service Worker for offline support
✅ Icons in all required sizes (72-512px)
✅ Start URL defined
✅ Display mode set to standalone
✅ Theme color defined
✅ Background color defined
✅ Shortcuts configured

---

## Troubleshooting

### Service Worker Not Registering

**Problem:** Service worker doesn't register

**Solutions:**
1. Check `sw.js` is in the same directory as `index.html`
2. Verify HTTPS is used (required for Service Workers)
3. Check browser console for errors
4. Unregister old service workers:
```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => registration.unregister());
});
```

### Icons Not Showing

**Problem:** PWA icons are missing

**Solutions:**
1. Open `generate-icons.html` in browser
2. Click "Generate & Download All Icons"
3. Move all PNG files to `icons/` folder
4. Refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
5. Clear browser cache if needed

### Database Not Loading

**Problem:** Plants/diseases not showing up

**Solutions:**
1. Check browser console for errors
2. Verify IndexedDB is supported (modern browsers)
3. Clear browser storage and reload:
```javascript
// In browser console
indexedDB.deleteDatabase('HerbalGuideDB');
location.reload();
```
4. Check `db.js` is loaded before `app.js`

### Offline Mode Not Working

**Problem:** App doesn't work offline

**Solutions:**
1. Visit app online first to cache assets
2. Check Service Worker is registered:
```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(console.log);
```
3. Verify cache is populated:
```javascript
// In browser console
caches.open('herbal-guide-v1').then(cache => cache.keys());
```

### SSH Connection Issues

**Problem:** Permission denied (publickey)

**Solutions:**
1. Verify SSH key is added to GitHub account
2. Check key permissions: `chmod 600 ~/.ssh/github_ed25519`
3. Test SSH connection: `ssh -T git@github.com`
4. Remove old keys from `~/.ssh/known_hosts` if needed

### Push Fails

**Problem:** `git push` fails

**Solutions:**
1. Check remote URL: `git remote -v`
2. Verify branch name: `git branch`
3. Pull first: `git pull origin main`
4. Force push if needed: `git push -f origin main`

---

## Performance Metrics

### Lighthouse Scores (Target)

- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+
- PWA: 100

### Optimization Tips

1. **Minify CSS/JS** before production
2. **Enable compression** on hosting (gzip, brotli)
3. **Use CDN** for Phosphor icons (already using unpkg.com)
4. **Lazy load images** if adding real plant photos
5. **Implement code splitting** for larger apps

---

## License

This project is open source and available for personal and commercial use.

---

## Support

For issues or questions:
1. Check this documentation
2. Review code comments
3. Test in different browsers
4. Check browser console for errors

---

**Last Updated:** 2025-12-31
**Version:** 1.0.0
