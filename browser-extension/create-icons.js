// Create placeholder icons for the browser extension
const fs = require('fs');
const path = require('path');

// Simple SVG icon as base64
const createIcon = (size) => {
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#667eea" rx="${size/8}"/>
    <circle cx="${size/2}" cy="${size/2}" r="${size/4}" fill="white"/>
    <circle cx="${size/2}" cy="${size/2}" r="${size/6}" fill="#667eea"/>
  </svg>`;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
};

// For now, let's create simple colored squares as PNG data URLs
const createSimpleIcon = (size) => {
  // This creates a simple base64 encoded 1x1 PNG that browsers can scale
  // A purple square
  const pngData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAHNIZJjpwAAAABJRU5ErkJggg==';
  return pngData;
};

console.log('Icon creation utility - run this if needed');
