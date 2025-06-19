#!/bin/bash

# Web Audit Screenshot Browser Extension Setup Script

echo "🔧 Setting up Web Audit Screenshot Browser Extension..."
echo ""

# Check if Chrome is installed
if ! command -v google-chrome &> /dev/null && ! command -v chromium-browser &> /dev/null; then
    echo "❌ Chrome or Chromium browser not found. Please install Chrome first."
    exit 1
fi

echo "✅ Chrome browser detected"

# Check if we're in the right directory
if [ ! -f "manifest.json" ]; then
    echo "❌ Error: manifest.json not found. Please run this script from the browser-extension directory."
    exit 1
fi

echo "✅ Extension files found"

# Create icons directory if it doesn't exist
if [ ! -d "icons" ]; then
    mkdir -p icons
    echo "📁 Created icons directory"
fi

# Generate simple placeholder icons if they don't exist
for size in 16 32 48 128; do
    icon_file="icons/icon${size}.png"
    if [ ! -f "$icon_file" ]; then
        # Create a simple colored square as placeholder
        # This requires ImageMagick - if not available, we'll skip
        if command -v convert &> /dev/null; then
            convert -size ${size}x${size} xc:"#667eea" "$icon_file"
            echo "🎨 Created placeholder icon: $icon_file"
        else
            echo "⚠️  Warning: $icon_file not found and ImageMagick not available to create it"
        fi
    fi
done

echo ""
echo "🎉 Extension setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Open Chrome and go to chrome://extensions/"
echo "2. Enable 'Developer mode' (toggle in top right)"
echo "3. Click 'Load unpacked'"
echo "4. Select this directory: $(pwd)"
echo "5. The extension will appear in your Chrome toolbar"
echo ""
echo "🔗 For detailed instructions, see README.md"
echo ""

# Optionally open Chrome extensions page
read -p "🚀 Would you like to open Chrome extensions page now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v google-chrome &> /dev/null; then
        google-chrome chrome://extensions/ &
    elif command -v chromium-browser &> /dev/null; then
        chromium-browser chrome://extensions/ &
    fi
    echo "✅ Chrome extensions page opened"
fi

echo "✨ Happy auditing!"
