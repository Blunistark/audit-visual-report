// Popup script for the Web Audit Screenshot Tool
let auditToolUrl = 'http://localhost:8080';
let isConnected = false;

document.addEventListener('DOMContentLoaded', async () => {
    // Load saved settings
    const result = await chrome.storage.sync.get(['auditToolUrl', 'isConnected']);
    if (result.auditToolUrl) {
        auditToolUrl = result.auditToolUrl;
        document.getElementById('auditToolUrl').value = auditToolUrl;
    }
    if (result.isConnected) {
        isConnected = result.isConnected;
        switchToCaptureMode();
    }

    // Get current tab URL
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
        document.getElementById('currentUrl').textContent = tab.url;
        document.getElementById('websiteUrl').value = tab.url;
    }

    // Event listeners
    document.getElementById('connectBtn').addEventListener('click', connectToAuditTool);
    document.getElementById('navigateBtn').addEventListener('click', navigateToWebsite);
    document.getElementById('startCaptureBtn').addEventListener('click', startCapture);
    document.getElementById('cancelCaptureBtn').addEventListener('click', cancelCapture);
});

async function connectToAuditTool() {
    const url = document.getElementById('auditToolUrl').value;
    if (!url) {
        showStatus('Please enter the audit tool URL', 'error');
        return;
    }

    try {
        // Test connection to audit tool
        const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
        auditToolUrl = url;
        isConnected = true;
        
        // Save settings
        await chrome.storage.sync.set({ auditToolUrl: url, isConnected: true });
        
        showStatus('Connected to audit tool successfully!', 'success');
        setTimeout(switchToCaptureMode, 1000);
    } catch (error) {
        showStatus('Failed to connect to audit tool. Make sure it\'s running.', 'error');
    }
}

async function navigateToWebsite() {
    const url = document.getElementById('websiteUrl').value;
    if (!url) {
        showStatus('Please enter a website URL', 'error');
        return;
    }

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        await chrome.tabs.update(tab.id, { url: url });
        showStatus('Navigating to website...', 'info');
        setTimeout(() => window.close(), 500);
    } catch (error) {
        showStatus('Failed to navigate to website', 'error');
    }
}

async function startCapture() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Inject the capture overlay
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: initializeCapture
        });

        showStatus('Capture mode activated! Select area to screenshot.', 'success');
        window.close();
    } catch (error) {
        showStatus('Failed to start capture mode', 'error');
        console.error(error);
    }
}

function cancelCapture() {
    isConnected = false;
    chrome.storage.sync.set({ isConnected: false });
    document.getElementById('setup-mode').classList.remove('hidden');
    document.getElementById('capture-mode').classList.remove('active');
}

function switchToCaptureMode() {
    document.getElementById('setup-mode').classList.add('hidden');
    document.getElementById('capture-mode').classList.add('active');
}

function showStatus(message, type) {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
}

// Function to be injected into the page
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
            <button id="capture-full-btn">🖼️ Full Page</button>
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
        }
        .capture-controls {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            display: flex;
            gap: 10px;
            z-index: 1000000;
        }
        .capture-controls button {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
        }
        #capture-area-btn {
            background: #10b981;
            color: white;
        }
        #capture-full-btn {
            background: #3b82f6;
            color: white;
        }
        #cancel-capture-btn {
            background: #ef4444;
            color: white;
        }
        .capture-instructions {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 6px;
            font-size: 14px;
            z-index: 1000000;
        }
        .selection-box {
            position: absolute;
            border: 2px dashed #10b981;
            background: rgba(16, 185, 129, 0.1);
            pointer-events: none;
            z-index: 1000000;
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

    document.getElementById('capture-area-btn').addEventListener('click', () => {
        document.querySelector('.capture-instructions').textContent = 'Click and drag to select area to capture';
    });

    document.getElementById('capture-full-btn').addEventListener('click', captureFullPage);
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
        }
    }

    async function captureArea(area) {
        try {
            // Send message to background script to capture
            chrome.runtime.sendMessage({
                action: 'captureArea',
                area: area,
                url: window.location.href
            });
            overlay.remove();
        } catch (error) {
            console.error('Capture failed:', error);
        }
    }

    async function captureFullPage() {
        try {
            chrome.runtime.sendMessage({
                action: 'captureFullPage',
                url: window.location.href
            });
            overlay.remove();
        } catch (error) {
            console.error('Full page capture failed:', error);
        }
    }

    function cancelCapture() {
        overlay.remove();
    }
}
