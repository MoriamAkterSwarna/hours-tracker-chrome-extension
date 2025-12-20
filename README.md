# Practice Tracker - Chrome Extension

A comprehensive Chrome Extension for tracking focused practice time across different skills. Inspired by the 10,000 Hours Rule, 20 Hours Rule, and Deep Practice methodology.

## Features

### Core Features
- ✅ **Timer System**: Start, pause, resume, and end practice sessions
- ✅ **Practice History**: All sessions stored locally with full details
- ✅ **Categories**: Create, edit, and delete custom practice categories
- ✅ **10,000 Hours View**: Track progress toward mastery (10,000 hours per category)
- ✅ **20 Hours Mode**: Beginner-friendly mode tracking first 20 hours
- ✅ **Daily Practice Goal**: Set and track daily practice targets
- ✅ **Streak System**: Track consecutive days of practice
- ✅ **Session Notes**: Add optional notes to each practice session

### Bonus Features
- ✅ **Export History**: Export all data as JSON
- ✅ **Weekly Summary**: View total practice hours for the current week
- ✅ **Dark Mode**: Toggle between light and dark themes

## Installation

### Load as Unpacked Extension

1. **Download or Clone** this repository to your computer

2. **Open Chrome Extensions Page**
   - Open Chrome browser
   - Navigate to `chrome://extensions/`
   - Or go to Menu (⋮) → Extensions → Manage Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**
   - Click "Load unpacked"
   - Select the folder containing this extension (the folder with `manifest.json`)
   - The extension should now appear in your extensions list

5. **Pin the Extension** (Optional but Recommended)
   - Click the puzzle icon (🧩) in Chrome's toolbar
   - Find "Practice Tracker" and click the pin icon to keep it visible

## Usage

### Starting Your First Session

1. **Create a Category**
   - Click on the extension icon
   - Go to the "Settings" tab
   - Click "Add Category"
   - Enter a name (e.g., "DSA", "IELTS", "Coding", "Writing")
   - Click "Save"

2. **Start a Practice Session**
   - Select a category from the dropdown
   - (Optional) Add notes about what you'll practice
   - Click "Start"
   - The timer will begin counting

3. **During Practice**
   - You can pause/resume the timer as needed
   - The timer continues even if you close the popup
   - Click "End" when finished to save the session

### Viewing Progress

- **Progress Tab**: See your progress toward 10,000 hours (or 20 hours in beginner mode)
- **History Tab**: View all past practice sessions, filter by category
- **Settings Tab**: Manage categories, set daily goals, view weekly summary

### Daily Goals and Streaks

- Set a daily practice goal in the Settings tab
- Your streak automatically tracks consecutive days of practice
- The extension shows today's progress and warns if you haven't met your goal

### Exporting Data

- Go to the History tab
- Click "Export" to download all your data as a JSON file
- This includes all sessions, categories, and settings

## Technical Details

### Architecture

- **Manifest V3**: Modern Chrome Extension architecture
- **Storage**: Uses `chrome.storage.local` for persistent data
- **Service Worker**: Background script handles timer persistence
- **No External Dependencies**: Pure HTML, CSS, and Vanilla JavaScript

### Data Structure

- **Categories**: Stored with ID, name, and creation timestamp
- **Sessions**: Include category, start/end times, duration, notes, and date
- **Settings**: Daily goal, dark mode preference, and display mode

### Edge Cases Handled

- ✅ Browser restart during active timer
- ✅ Multiple pause/resume cycles
- ✅ Accidental popup close
- ✅ Long pauses (auto-pause after 5 minutes of inactivity)
- ✅ Very short sessions (confirmation prompt)

## File Structure

```
practice-tracker/
├── manifest.json          # Extension manifest (V3)
├── popup.html             # Main UI
├── popup.js               # Main logic and UI interactions
├── style.css              # Styling
├── background.js          # Service worker for timer persistence
├── icons/                 # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md              # This file
```

## Icons

The extension requires icons at 16x16, 48x48, and 128x128 pixels. You can:

1. Create your own icons and place them in the `icons/` folder
2. Use placeholder icons (the extension will work but may show default Chrome icons)
3. Use an online icon generator to create matching icons

## Publishing to Chrome Web Store

To publish this extension:

1. **Prepare Icons**: Ensure you have proper icons (16, 48, 128px)
2. **Update Version**: Update version in `manifest.json`
3. **Create ZIP**: Package all files (except README) into a ZIP
4. **Chrome Web Store**: Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
5. **Upload**: Upload your ZIP file and fill in store listing details
6. **Submit**: Submit for review

## Privacy

- **100% Local Storage**: All data is stored locally in your browser
- **No External Servers**: No data is sent to any external servers
- **No Tracking**: No analytics or tracking code
- **Export Your Data**: You can export all your data at any time

## Troubleshooting

### Timer Not Persisting
- Ensure the extension has storage permissions (should be automatic)
- Check Chrome's storage quota (shouldn't be an issue for this extension)

### Data Not Showing
- Try refreshing the extension (disable and re-enable)
- Check browser console for errors (F12 → Console)

### Extension Not Loading
- Ensure all files are in the same folder
- Check that `manifest.json` is valid JSON
- Verify Developer Mode is enabled

## Future Enhancements

Potential features for future versions:
- Reminder notifications (requires notifications permission)
- CSV export option
- Data import functionality
- Multiple daily goals per category
- Practice statistics and insights
- Integration with calendar

## License

This project is open source and available for personal and commercial use.

## Support

For issues, questions, or contributions, please refer to the project repository.

---

**Built with ❤️ for dedicated learners pursuing mastery through deliberate practice.**

