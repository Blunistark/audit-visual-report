const fs = require('fs');
const path = require('path');

// Simple PNG data for a blue square icon
// This is a minimal valid PNG file in base64
const createIcon = (size) => {
  // SVG data for a simple icon
  const svgData = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="6" fill="url(#grad)"/>
    <text x="50%" y="50%" text-anchor="middle" dy="0.35em" fill="white" font-family="Arial" font-size="${Math.floor(size/2)}" font-weight="bold">🔍</text>
  </svg>`;
  
  return svgData;
};

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

// Since we can't easily convert SVG to PNG without additional libraries,
// let's create a simple HTML file that can be used to generate the icons
const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Icon Generator</title>
</head>
<body>
    <h3>Right-click each icon and "Save image as..." to save as PNG:</h3>
    ${[16, 32, 48, 128].map(size => `
        <div style="margin: 20px;">
            <h4>Icon ${size}x${size}:</h4>
            <div style="width: ${size}px; height: ${size}px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-size: ${Math.floor(size/3)}px; font-weight: bold;">🔍</div>
        </div>
    `).join('')}
    
    <script>
        // Convert divs to canvas and create download links
        window.onload = function() {
            const sizes = [16, 32, 48, 128];
            sizes.forEach((size, index) => {
                const div = document.querySelectorAll('div')[index + 1];
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                
                // Create gradient
                const gradient = ctx.createLinearGradient(0, 0, size, size);
                gradient.addColorStop(0, '#667eea');
                gradient.addColorStop(1, '#764ba2');
                
                // Draw background
                ctx.fillStyle = gradient;
                ctx.roundRect(0, 0, size, size, 6);
                ctx.fill();
                
                // Draw emoji
                ctx.fillStyle = 'white';
                ctx.font = \`bold \${Math.floor(size/2)}px Arial\`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('🔍', size/2, size/2);
                
                // Create download link
                const link = document.createElement('a');
                link.download = \`icon\${size}.png\`;
                link.href = canvas.toDataURL();
                link.textContent = \`Download icon\${size}.png\`;
                link.style.display = 'block';
                link.style.marginTop = '10px';
                div.parentNode.appendChild(link);
            });
        };
    </script>
</body>
</html>
`;

// Write the HTML file
fs.writeFileSync(path.join(__dirname, 'generate-icons.html'), htmlTemplate);

console.log('📁 Icons directory created');
console.log('🎨 Open generate-icons.html in your browser to download the icon files');
console.log('📥 Save each icon as icon16.png, icon32.png, icon48.png, and icon128.png in the icons folder');
