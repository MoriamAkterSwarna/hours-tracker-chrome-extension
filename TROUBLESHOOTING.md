# Troubleshooting Guide

## Buttons Not Working

If buttons in the extension are not responding, follow these steps:

### Step 1: Reload the Extension

1. Go to `chrome://extensions/`
2. Find "Practice Tracker"
3. Click the **reload icon** (circular arrow) on the extension card
4. Try clicking buttons again

### Step 2: Check Browser Console

1. Right-click on the extension popup
2. Select "Inspect" or "Inspect Popup"
3. Go to the "Console" tab
4. Look for any red error messages
5. Try clicking a button and see if any errors appear

**Common errors to look for:**
- `Cannot read property 'addEventListener' of null` - Element not found
- `Uncaught TypeError` - JavaScript error
- `Storage error` - Chrome storage issue

### Step 3: Verify File Structure

Make sure all files are in the same folder:
```
tracker/
├── manifest.json
├── popup.html
├── popup.js
├── style.css
├── background.js
└── icons/
```

### Step 4: Check Manifest Permissions

Open `manifest.json` and verify it has:
```json
"permissions": [
  "storage",
  "alarms"
]
```

### Step 5: Clear Extension Data (Last Resort)

If nothing works, you can reset the extension:

1. Go to `chrome://extensions/`
2. Find "Practice Tracker"
3. Click "Remove"
4. Reload the extension folder
5. **Note:** This will delete all your practice data!

## Debug Information

The extension now includes console logging. When you click buttons, you should see messages like:
- `Practice Tracker script loaded`
- `UI initialized successfully`
- `Start timer clicked`
- `Show category modal`

If you don't see these messages, the script might not be loading.

## Common Issues

### Issue: "Please select a category first" but no categories exist
**Solution:** Go to Settings tab → Click "Add Category" → Create a category first

### Issue: Timer doesn't start
**Solution:** 
1. Make sure you've selected a category from the dropdown
2. Check browser console for errors
3. Try reloading the extension

### Issue: Data not saving
**Solution:**
1. Check Chrome storage quota: `chrome://settings/content/all`
2. Make sure extension has storage permission
3. Check console for storage errors

### Issue: Extension popup is blank
**Solution:**
1. Check if `popup.html` exists and is valid HTML
2. Check console for loading errors
3. Verify `manifest.json` points to correct popup file

## Getting Help

If buttons still don't work after trying these steps:

1. **Check Console Errors**: Open popup inspector (right-click → Inspect) and share any errors
2. **Check Extension Status**: Go to `chrome://extensions/` and verify extension is enabled
3. **Try Incognito Mode**: Load extension in incognito to rule out conflicts
4. **Check Chrome Version**: Make sure you're using a recent version of Chrome

## Testing Individual Features

### Test Timer Buttons
1. Add a category first (Settings tab)
2. Select category from dropdown
3. Click "Start" - should see timer counting
4. Click "Pause" - timer should pause
5. Click "Resume" - timer should resume
6. Click "End" - session should be saved

### Test Tab Switching
1. Click "Progress" tab - should show progress view
2. Click "History" tab - should show history
3. Click "Settings" tab - should show settings

### Test Category Management
1. Go to Settings tab
2. Click "Add Category"
3. Enter a name and click "Save"
4. Category should appear in dropdown

## Still Not Working?

If buttons still don't work:
1. Share the console errors you see
2. Share your Chrome version
3. Try creating a fresh extension folder with just the files
4. Check if other Chrome extensions are interfering

