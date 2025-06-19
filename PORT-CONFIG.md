# Port Configuration Summary

## Updated Ports:
- **Main App (React/Vite)**: `http://localhost:8080`
- **API Server (Express)**: `http://localhost:8081`

## Files Updated:
1. `src/api/server.js` - Changed API port from 3001 to 8081
2. `browser-extension/background.js` - Updated default URLs and API endpoints
3. `browser-extension/popup.js` - Changed default audit tool URL to 8080
4. `browser-extension/popup.html` - Updated input placeholders and default values
5. `src/pages/Index.tsx` - Updated API endpoint from 3001 to 8081
6. `src/components/BrowserExtension.tsx` - Updated all API calls to port 8081
7. `browser-extension/README.md` - Updated setup instructions with correct ports

## How to Start:
```bash
# Option 1: Start both servers
npm run dev:full

# Option 2: Use the provided scripts
# Windows:
start-servers.bat
# Linux/Mac:
./start-servers.sh

# Option 3: Start manually
npm run dev     # Main app on port 8080
npm run api     # API server on port 8081
```

## Extension Configuration:
- Open extension popup
- Set Audit Tool URL to: `http://localhost:8080`
- Click "Connect to Audit Tool"

## Flow:
1. Extension captures screenshot → sends to API server (port 8081)
2. API server stores screenshot and returns metadata
3. Extension opens main app (port 8080) with screenshot parameters
4. Main app fetches screenshot from API server and displays it
