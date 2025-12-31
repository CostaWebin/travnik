# PWA Icons

This folder should contain the following icon files:

- `icon-72.png` (72x72px)
- `icon-96.png` (96x96px)
- `icon-128.png` (128x128px)
- `icon-144.png` (144x144px)
- `icon-152.png` (152x152px)
- `icon-192.png` (192x192px) - Main icon
- `icon-384.png` (384x384px)
- `icon-512.png` (512x512px) - Largest icon

## Icon Design

The app icon should feature:
- A green leaf/plant emoji or botanical illustration
- Green color palette matching the app theme (#2d5016)
- Clean, simple design that scales well

## How to Create Icons

### Option 1: Online Icon Generator
Visit one of these free PWA icon generators:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/
- https://www.favicon-generator.org/

### Option 2: Using ImageMagick (if installed)
```bash
# Create a simple green square with leaf emoji
convert -size 512x512 xc:#2d5016 -fill white -pointsize 400 -gravity center -annotate 0,0 '🌿' icon-512.png
# Generate all sizes
for size in 72 96 128 144 152 192 384 512; do
  convert icon-512.png -resize ${size}x${size} icon-${size}.png
done
```

### Option 3: Using Python with PIL (if installed)
```bash
pip install Pillow
python3 << 'EOF'
from PIL import Image, ImageDraw
import os

os.makedirs('icons', exist_ok=True)
sizes = [(72,72), (96,96), (128,128), (144,144), (152,152), (192,192), (384,384), (512,512)]
colors = {'bg': (45, 80, 22), 'text': (255, 255, 255)}

for w, h in sizes:
    img = Image.new('RGBA', (w, h), colors['bg'] + (255,))
    draw = ImageDraw.Draw(img)
    # Add leaf emoji or simple plant shape
    draw.text((w//2, h//2), '🌿', fill=colors['text'], anchor='mm')
    img.save(f'icons/icon-{w}x{h}.png')

print('Icons created successfully!')
EOF
```

### Option 4: Using Figma/Sketch
1. Create a 512x512px design
2. Export as PNG
3. Use a tool like https://squoosh.app/ to generate all sizes

## Temporary Solution

For testing purposes, you can use any green PNG images. The app will work without proper icons, but they won't look professional.

## Screenshots Folder

The `screenshots/ folder should contain:
- `screenshot1.png` (540x720px) - Plants search view
- `screenshot2.png` (540x720px) - Plant detail view

These are optional but recommended for better PWA install experience.
