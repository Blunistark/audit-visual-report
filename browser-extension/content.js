// Content script for Web Audit Screenshot Tool
// This script runs on all web pages and provides capture functionality

console.log('Web Audit Extension: Content script loaded on', window.location.href);

// Inject a marker element to indicate extension is installed
const marker = document.createElement('div');
marker.setAttribute('data-web-audit-extension', 'installed');
marker.setAttribute('data-extension-version', '1.0.0');
marker.style.display = 'none';
document.head.appendChild(marker);

console.log('Web Audit Extension: Marker element injected');

// Listen for extension detection messages from the audit tool
window.addEventListener('message', (event) => {
    console.log('Web Audit Extension: Received message', event.data);
    if (event.data.type === 'WEB_AUDIT_EXTENSION_CHECK') {
        console.log('Web Audit Extension: Responding to detection check');
        // Respond that extension is installed
        window.postMessage({
            type: 'WEB_AUDIT_EXTENSION_RESPONSE',
            installed: true,
            version: '1.0.0'
        }, '*');
    }
});

// Also immediately announce presence if this is the audit tool page
if (window.location.href.includes('localhost:8080')) {
    console.log('Web Audit Extension: On audit tool page, announcing presence');
    setTimeout(() => {
        window.postMessage({
            type: 'WEB_AUDIT_EXTENSION_ANNOUNCE',
            installed: true,
            version: '1.0.0'
        }, '*');
    }, 1000);
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'initializeCapture') {
        initializeCapture();
        sendResponse({ success: true });
    }
});

// Initialize capture overlay (this function is also called from popup.js injection)
function initializeCapture() {
    // Remove existing capture overlay if any
    const existing = document.getElementById('web-audit-capture-overlay');
    if (existing) {
        existing.remove();
    }

    // Create and inject the capture overlay
    const overlay = document.createElement('div');
    overlay.id = 'web-audit-capture-overlay';
    overlay.innerHTML = `
        <div class="capture-controls">
            <button id="capture-area-btn">📷 Capture Area</button>
            <button id="capture-visible-btn">🖼️ Visible Area</button>
            <button id="cancel-capture-btn">❌ Cancel</button>
        </div>
        <div class="capture-instructions">
            Click and drag to select area, or use buttons above
        </div>
        <div class="selection-box" style="display: none;"></div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        #web-audit-capture-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.3);
            z-index: 999999;
            cursor: crosshair;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .capture-controls {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            padding: 15px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            display: flex;
            gap: 12px;
            z-index: 1000000;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .capture-controls button {
            padding: 10px 16px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .capture-controls button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        #capture-area-btn {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
        }
        #capture-visible-btn {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: white;
        }
        #cancel-capture-btn {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
        }
        .capture-instructions {
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 1000000;
            backdrop-filter: blur(10px);
        }
        .selection-box {
            position: absolute;
            border: 3px dashed #10b981;
            background: rgba(16, 185, 129, 0.1);
            pointer-events: none;
            z-index: 1000000;
            border-radius: 4px;
        }
        .selection-info {
            position: absolute;
            background: #10b981;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            top: -30px;
            left: 0;
            white-space: nowrap;
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(overlay);

    // Capture functionality
    let isSelecting = false;
    let startX, startY, endX, endY;
    const selectionBox = overlay.querySelector('.selection-box');

    // Event listeners
    overlay.addEventListener('mousedown', startSelection);
    overlay.addEventListener('mousemove', updateSelection);
    overlay.addEventListener('mouseup', endSelection);
    overlay.addEventListener('keydown', handleKeydown);

    // Focus the overlay to capture keyboard events
    overlay.setAttribute('tabindex', '0');
    overlay.focus();

    document.getElementById('capture-area-btn').addEventListener('click', () => {
        document.querySelector('.capture-instructions').textContent = 'Click and drag to select area to capture';
    });

    document.getElementById('capture-visible-btn').addEventListener('click', captureVisibleArea);
    document.getElementById('cancel-capture-btn').addEventListener('click', cancelCapture);

    function startSelection(e) {
        if (e.target.closest('.capture-controls')) return;
        isSelecting = true;
        startX = e.clientX;
        startY = e.clientY;
        selectionBox.style.display = 'block';
        selectionBox.style.left = startX + 'px';
        selectionBox.style.top = startY + 'px';
        selectionBox.style.width = '0px';
        selectionBox.style.height = '0px';
        
        // Remove any existing info
        const existingInfo = selectionBox.querySelector('.selection-info');
        if (existingInfo) existingInfo.remove();
    }

    function updateSelection(e) {
        if (!isSelecting) return;
        endX = e.clientX;
        endY = e.clientY;

        const left = Math.min(startX, endX);
        const top = Math.min(startY, endY);
        const width = Math.abs(endX - startX);
        const height = Math.abs(endY - startY);

        selectionBox.style.left = left + 'px';
        selectionBox.style.top = top + 'px';
        selectionBox.style.width = width + 'px';
        selectionBox.style.height = height + 'px';

        // Update selection info
        let info = selectionBox.querySelector('.selection-info');
        if (!info) {
            info = document.createElement('div');
            info.className = 'selection-info';
            selectionBox.appendChild(info);
        }
        info.textContent = `${Math.round(width)} × ${Math.round(height)}`;
    }

    function endSelection(e) {
        if (!isSelecting) return;
        isSelecting = false;

        const left = Math.min(startX, endX);
        const top = Math.min(startY, endY);
        const width = Math.abs(endX - startX);
        const height = Math.abs(endY - startY);

        if (width > 10 && height > 10) {
            captureArea({ left, top, width, height });
        } else {
            selectionBox.style.display = 'none';
        }
    }

    function handleKeydown(e) {
        if (e.key === 'Escape') {
            cancelCapture();
        }
    }

    async function captureArea(area) {
        try {
            // Add visual feedback
            selectionBox.style.background = 'rgba(16, 185, 129, 0.3)';
            selectionBox.style.border = '3px solid #10b981';
            
            // Show capturing message
            document.querySelector('.capture-instructions').textContent = 'Capturing screenshot...';
            
            // Send message to background script to capture
            chrome.runtime.sendMessage({
                action: 'captureArea',
                area: area,
                url: window.location.href
            });
            
            // Small delay to show feedback, then remove overlay
            setTimeout(() => {
                overlay.remove();
            }, 500);
        } catch (error) {
            console.error('Capture failed:', error);
            alert('Capture failed. Please try again.');
        }
    }

    async function captureVisibleArea() {
        try {
            // Show capturing message
            document.querySelector('.capture-instructions').textContent = 'Capturing visible area...';
            
            chrome.runtime.sendMessage({
                action: 'captureFullPage',
                url: window.location.href
            });
            
            setTimeout(() => {
                overlay.remove();
            }, 500);
        } catch (error) {
            console.error('Visible area capture failed:', error);
            alert('Capture failed. Please try again.');
        }
    }

    function cancelCapture() {
        overlay.remove();
    }

    // Add some helpful instructions
    setTimeout(() => {
        if (document.getElementById('web-audit-capture-overlay')) {
            document.querySelector('.capture-instructions').textContent = 'Click and drag to select area, use buttons above, or press ESC to cancel';
        }
    }, 2000);
}
