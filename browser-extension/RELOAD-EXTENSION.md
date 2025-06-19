# How to Reload Browser Extension After Changes

When you make changes to the browser extension code, you need to reload it in Chrome:

## Method 1: Chrome Extensions Page
1. Open Chrome and go to `chrome://extensions/`
2. Find the "Web Audit Screenshot Tool" extension
3. Click the **Reload** button (🔄) next to the extension

## Method 2: Extension Manager
1. Right-click on the extension icon in the toolbar
2. Select "Manage extension"
3. Click the **Reload** button

## Method 3: Developer Tools
1. Open Chrome DevTools (F12)
2. Go to the "Application" tab
3. Click "Service Workers" in the left sidebar
4. Find your extension and click "Update"

## After Reloading:
- Check the console logs again by right-clicking the extension icon
- Select "Inspect popup" or "Inspect service worker"
- The logs should now show the correct API URL: `http://localhost:8081/api/screenshot`

## Common Issues:
- **Still seeing old URLs?** → The extension cache needs clearing. Try disabling and re-enabling the extension.
- **"Failed to fetch" errors?** → Make sure both servers are running (`npm run dev:full`)
- **CORS errors?** → The API server should handle CORS automatically.
