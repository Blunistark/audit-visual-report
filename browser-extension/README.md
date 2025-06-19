# Web Audit Screenshot Browser Extension

This browser extension allows you to capture screenshots directly from any website and automatically send them to your Web Audit Tool. It works with login-protected pages and provides an overlay for precise area selection.

## Features

- 🔍 **Capture Any Website**: Works on any website, including those requiring login credentials
- 📸 **Area Selection**: Interactive overlay to select specific areas for screenshot
- 🔄 **Auto Integration**: Automatically sends screenshots to your audit tool
- 🎯 **Precise Selection**: Shows selection dimensions in real-time
- ⌨️ **Keyboard Shortcuts**: ESC to cancel, click and drag to select

## Installation

### Method 1: Load Unpacked Extension (Development)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select the `browser-extension` folder from your audit tool project
5. The extension should now appear in your extensions list

### Method 2: Chrome Web Store (Coming Soon)

The extension will be available on the Chrome Web Store once published.

## Setup

1. **Start your Audit Tool**: Make sure your web audit tool is running:
   - Main app: `http://localhost:8080` 
   - API server: `http://localhost:8081`
   - You can start both with: `npm run dev:full`

2. **Configure Extension**: Click the extension icon in Chrome toolbar and:
   - Enter your audit tool URL: `http://localhost:8080`
   - Click "Connect to Audit Tool" to verify connection

3. **Navigate to Website**: 
   - Enter the website URL you want to audit
   - Click "Navigate to Website" or manually browse to any website

## Usage

### Capturing Screenshots

1. **Activate Capture Mode**: Click the extension icon and click "Start Capture"

2. **Select Area**: An overlay will appear on the page with options:
   - **Capture Area**: Click and drag to select a specific area
   - **Visible Area**: Capture the currently visible portion of the page
   - **Cancel**: Exit capture mode (or press ESC)

3. **Auto Integration**: Screenshots are automatically sent to your audit tool

### Working with Login-Protected Sites

1. **Login First**: Navigate to the website and login normally
2. **Browse to Issue Page**: Navigate to the page with the issue
3. **Capture**: Use the extension to capture the screenshot
4. **Audit Tool**: The screenshot will appear in your audit tool with the URL

## Extension Permissions

The extension requires these permissions:

- **activeTab**: To capture screenshots of the current tab
- **storage**: To save your audit tool URL and settings
- **tabs**: To navigate and interact with browser tabs
- **scripting**: To inject the capture overlay
- **host_permissions**: To work on all websites

## API Integration

The extension communicates with your audit tool via:

- **Endpoint**: `POST /api/screenshot`
- **Data**: Sends screenshot file, URL, and area coordinates
- **Fallback**: If connection fails, screenshots are saved to downloads

## Troubleshooting

### Extension Not Working

1. Check that the audit tool is running
2. Verify the audit tool URL in extension popup
3. Refresh the page and try again
4. Check browser console for error messages

### Screenshots Not Appearing in Audit Tool

1. Verify the API server is running on port 3001
2. Check that CORS is properly configured
3. Look for error messages in the extension popup

### Capture Overlay Not Showing

1. Try refreshing the page
2. Check if the page blocks content scripts
3. Some pages may prevent overlay injection

## Development

### File Structure

```
browser-extension/
├── manifest.json          # Extension configuration
├── popup.html             # Extension popup interface
├── popup.js              # Popup logic
├── content.js            # Page content script
├── content.css           # Content script styles
├── background.js         # Background service worker
└── icons/               # Extension icons
```

### Building

The extension is ready to use as-is. For production:

1. Update the manifest version
2. Add proper icons (16x16, 32x32, 48x48, 128x128)
3. Test on multiple websites
4. Submit to Chrome Web Store

### Testing

1. Test on various websites (with and without login)
2. Test area selection accuracy
3. Verify integration with audit tool
4. Test error handling scenarios

## Security Considerations

- The extension only captures screenshots when explicitly activated
- No automatic data collection or tracking
- Screenshots are sent only to your configured audit tool
- All communication is local or to your specified audit tool URL

## Support

For issues or questions:

1. Check the browser console for error messages
2. Verify all setup steps are completed
3. Ensure your audit tool API server is running
4. Check network requests in browser developer tools
