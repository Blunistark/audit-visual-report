# Web Audit Visual Report Tool

A comprehensive web auditing tool that allows you to create detailed visual reports for web issues with screenshots, annotations, and descriptions. Includes a browser extension for seamless screenshot capture from any website.

## Features

- 📝 **Complete Audit Workflow**: URL → Screenshot → Annotation → Description → Report
- 🖼️ **Screenshot Annotation**: Interactive canvas with drawing and shape tools
- 🌐 **Browser Extension**: Capture screenshots directly from any website with login support
- 📊 **Report Management**: Save, organize, and manage audit reports
- 🏷️ **Categorization**: Organize issues by type (UI/UX, Performance, Accessibility, Functionality)
- 🔥 **Severity Levels**: Critical, High, Medium, Low priority classification
- ✅ **Report Status**: Mark reports as solved/unsolved, delete completed reports
- 🎨 **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS

## Project info

**URL**: https://lovable.dev/projects/62af4daa-508d-476d-bba7-b7ac9cce64c2

## Quick Start

### 1. Install Dependencies

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install
```

### 2. Start the Application

```sh
# Start the web application (default: http://localhost:8080)
npm run dev

# Start the API server for browser extension (port 3001)
npm run api

# Or start both simultaneously
npm run dev:full
```

### 3. Set Up Browser Extension (Optional)

```sh
# Navigate to the browser extension directory
cd browser-extension

# Run setup script (Windows)
setup.bat

# Or run setup script (Linux/Mac)
chmod +x setup.sh
./setup.sh
```

## Browser Extension Setup

The browser extension allows you to capture screenshots directly from any website, including those requiring login credentials.

### Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select the `browser-extension` folder
5. The extension will appear in your Chrome toolbar

### Usage

1. **Configure**: Click the extension icon and set your audit tool URL
2. **Navigate**: Browse to any website (login if needed)
3. **Capture**: Click "Start Capture" in the extension popup
4. **Select**: Use the overlay to select the area to screenshot
5. **Auto-Import**: Screenshots automatically appear in your audit tool

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/62af4daa-508d-476d-bba7-b7ac9cce64c2) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/62af4daa-508d-476d-bba7-b7ac9cce64c2) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
