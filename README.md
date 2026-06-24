# Diet Tracker PWA v3

Version 3 adds preload support when selecting a date.

## What changed

- Select a date and the app checks Google Sheets for that row.
- If found, it fills Weight, Calories, Protein, Steps, Workout, and Notes.
- If not found, it clears the fields.
- Saving still updates the matching date row.
- Blank fields do not erase existing saved values.

## Upload to GitHub Pages

Upload these frontend files:

- index.html
- style.css
- app.js
- manifest.json
- icon.svg

Do not upload:

- google-apps-script.js
- README.md

## Setup

1. Copy your current Web App URL into app.js.
2. Copy your current secret key into app.js.
3. Replace your Google Apps Script code with google-apps-script.js.
4. Add the same secret key in google-apps-script.js.
5. Redeploy Apps Script as a new version using the same deployment.
6. Upload the frontend files to GitHub Pages.
