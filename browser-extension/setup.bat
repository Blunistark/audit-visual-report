@echo off
echo 🔧 Setting up Web Audit Screenshot Browser Extension...
echo.

REM Check if manifest.json exists
if not exist "manifest.json" (
    echo ❌ Error: manifest.json not found. Please run this script from the browser-extension directory.
    pause
    exit /b 1
)

echo ✅ Extension files found

REM Create icons directory if it doesn't exist
if not exist "icons" (
    mkdir icons
    echo 📁 Created icons directory
)

echo.
echo 🎉 Extension setup complete!
echo.
echo 📋 Next steps:
echo 1. Open Chrome and go to chrome://extensions/
echo 2. Enable 'Developer mode' (toggle in top right)
echo 3. Click 'Load unpacked'
echo 4. Select this directory: %cd%
echo 5. The extension will appear in your Chrome toolbar
echo.
echo 🔗 For detailed instructions, see README.md
echo.

REM Ask user if they want to open Chrome extensions page
set /p choice="🚀 Would you like to open Chrome extensions page now? (y/n): "
if /i "%choice%"=="y" (
    start chrome chrome://extensions/
    echo ✅ Chrome extensions page opened
)

echo ✨ Happy auditing!
pause
