# Quick Setup Guide

## Step 1: Generate Icons (Required)

The extension needs icon files to work properly. You have two options:

### Option A: Use the Icon Generator (Easiest)
1. Open `icons/generate-icons.html` in your browser
2. Click "Download All Icons"
3. Save the files in the `icons/` folder with these exact names:
   - `icon16.png`
   - `icon48.png`
   - `icon128.png`

### Option B: Create Your Own Icons
- Create 16x16, 48x48, and 128x128 pixel PNG images
- Use any image editor or online tool
- Save them in the `icons/` folder with the names above

**Note:** The extension will work without icons, but Chrome will show default icons.

## Step 2: Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the folder containing `manifest.json`
5. The extension should now appear in your extensions list

## Step 3: Pin the Extension (Recommended)

1. Click the puzzle icon (🧩) in Chrome's toolbar
2. Find "Practice Tracker" and click the pin icon
3. The extension icon will now be visible in your toolbar

## Step 4: Start Using

1. Click the extension icon
2. Go to Settings tab
3. Add your first category (e.g., "Coding", "DSA", "IELTS")
4. Select the category and click "Start" to begin tracking!

## Troubleshooting

### Extension won't load
- Make sure all files are in the same folder
- Check that `manifest.json` is valid
- Ensure Developer mode is enabled

### Icons not showing
- The extension works without icons, but you can add them later
- Icons must be PNG format and exact sizes

### Timer not working
- Make sure you've selected a category before starting
- Check browser console (F12) for any errors

## File Checklist

Make sure you have these files:
- ✅ `manifest.json`
- ✅ `popup.html`
- ✅ `popup.js`
- ✅ `style.css`
- ✅ `background.js`
- ✅ `icons/icon16.png` (optional but recommended)
- ✅ `icons/icon48.png` (optional but recommended)
- ✅ `icons/icon128.png` (optional but recommended)

## Next Steps

- Read the full `README.md` for detailed feature documentation
- Start tracking your practice sessions!
- Set daily goals and build your streak

Happy practicing! 🎯

