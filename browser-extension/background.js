// Background script for Web Audit Screenshot Tool
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'captureArea') {
        captureAreaScreenshot(message.area, message.url, sender.tab.id);
    } else if (message.action === 'captureFullPage') {
        captureFullPageScreenshot(message.url, sender.tab.id);
    }
});

async function captureAreaScreenshot(area, url, tabId) {
    try {
        // Capture the visible tab
        const dataUrl = await chrome.tabs.captureVisibleTab(null, {
            format: 'png',
            quality: 100
        });

        // Send the screenshot data to the content script for cropping
        const results = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: cropScreenshotInContentScript,
            args: [dataUrl, area]
        });

        if (results && results[0] && results[0].result) {
            const croppedDataUrl = results[0].result;
            
            // Convert dataUrl to blob
            const response = await fetch(croppedDataUrl);
            const blob = await response.blob();
            
            // Send to audit tool
            await sendToAuditTool(blob, url, area);
        } else {
            throw new Error('Failed to crop screenshot in content script');
        }

    } catch (error) {
        console.error('Screenshot capture failed:', error);
        try {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: 'Capture Failed',
                message: 'Failed to capture screenshot. Please try again.'
            });
        } catch (notificationError) {
            console.error('Failed to show notification:', notificationError);
        }
    }
}

// Function to be executed in content script context where DOM APIs are available
function cropScreenshotInContentScript(dataUrl, area) {
    return new Promise((resolve, reject) => {
        try {
            const devicePixelRatio = window.devicePixelRatio || 1;
            
            // Create a canvas to crop the area
            const canvas = document.createElement('canvas');
            canvas.width = area.width;
            canvas.height = area.height;
            const ctx = canvas.getContext('2d');
            
            // Create image from dataUrl
            const img = new Image();
            img.onload = () => {
                try {
                    // Adjust coordinates for device pixel ratio
                    const scaledArea = {
                        left: area.left * devicePixelRatio,
                        top: area.top * devicePixelRatio,
                        width: area.width * devicePixelRatio,
                        height: area.height * devicePixelRatio
                    };

                    // Draw the cropped area
                    ctx.drawImage(
                        img,
                        scaledArea.left, scaledArea.top, scaledArea.width, scaledArea.height,
                        0, 0, area.width, area.height
                    );

                    // Convert to data URL
                    const croppedDataUrl = canvas.toDataURL('image/png');
                    resolve(croppedDataUrl);
                } catch (drawError) {
                    reject(drawError);
                }
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = dataUrl;
        } catch (error) {
            reject(error);
        }
    });
}

async function captureFullPageScreenshot(url, tabId) {
    try {
        // For full page, we might need to scroll and capture multiple parts
        // For now, just capture the visible area
        const dataUrl = await chrome.tabs.captureVisibleTab(null, {
            format: 'png',
            quality: 100
        });

        // Convert dataUrl to blob
        const response = await fetch(dataUrl);
        const blob = await response.blob();

        // Send to audit tool
        await sendToAuditTool(blob, url, null);

    } catch (error) {
        console.error('Full page capture failed:', error);
        try {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: 'Capture Failed',
                message: 'Failed to capture full page. Please try again.'
            });
        } catch (notificationError) {
            console.error('Failed to show notification:', notificationError);
        }
    }
}

async function sendToAuditTool(blob, url, area) {
    try {
        // Get audit tool URL from storage
        const result = await chrome.storage.sync.get(['auditToolUrl']);        const auditToolUrl = result.auditToolUrl || 'http://localhost:8080';

        // Create FormData
        const formData = new FormData();
        formData.append('screenshot', blob, 'screenshot.png');
        formData.append('url', url);
        if (area) {
            formData.append('area', JSON.stringify(area));
        }        // Send to audit tool API (API server runs on port 8081)
        // Convert the audit tool URL to the API server URL
        let apiUrl;
        try {
            const urlObj = new URL(auditToolUrl);
            urlObj.port = '8081';
            apiUrl = urlObj.toString().replace(/\/$/, ''); // Remove trailing slash
        } catch (urlError) {
            // Fallback if URL parsing fails
            apiUrl = auditToolUrl.replace(/:\d+/, ':8081').replace(/\/$/, '');        }
        
        console.log('Sending screenshot to API:', `${apiUrl}/api/screenshot`);
        console.log('Extension updated to use port 8081');
        
        try {
            const response = await fetch(`${apiUrl}/api/screenshot`, {
                method: 'POST',
                body: formData
            });

            console.log('API Response status:', response.status);
            
            if (response.ok) {
                const responseData = await response.json();
                console.log('Screenshot uploaded successfully:', responseData);
                
                // Open audit tool in new tab with screenshot parameter
                const auditUrl = new URL(auditToolUrl);
                auditUrl.searchParams.set('screenshot', responseData.screenshot.filename);
                auditUrl.searchParams.set('sourceUrl', encodeURIComponent(url));
                chrome.tabs.create({ url: auditUrl.toString() });
                
                try {
                    chrome.notifications.create({
                        type: 'basic',
                        iconUrl: 'icons/icon48.png',
                        title: 'Screenshot Captured',
                        message: 'Screenshot uploaded and opened in audit tool!'
                    });
                } catch (notificationError) {
                    console.error('Failed to show success notification:', notificationError);
                }
                return; // Exit successfully
            } else {
                const errorText = await response.text();
                console.error('API Error:', response.status, errorText);
                throw new Error(`API returned ${response.status}: ${errorText}`);
            }
        } catch (fetchError) {
            console.error('Network/Fetch Error:', fetchError);
            throw new Error(`Failed to connect to API server: ${fetchError.message}`);
        }    } catch (error) {
        console.error('Failed to send to audit tool:', error);
        
        // Show specific error notification
        let errorMessage = 'Failed to upload screenshot';
        if (error.message.includes('Failed to connect')) {
            errorMessage = 'Cannot connect to API server. Is it running on port 8081?';
        } else if (error.message.includes('API returned')) {
            errorMessage = 'API server error. Check console for details.';
        }
        
        try {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: 'Upload Failed',
                message: errorMessage + ' Saving to downloads instead.'
            });
        } catch (notificationError) {
            console.error('Failed to show error notification:', notificationError);
        }
        
        // Fallback: Save to downloads using Data URL instead of Object URL
        try {
            // Convert blob to data URL (works in service worker)
            const reader = new FileReader();
            reader.onload = async function(event) {
                try {
                    const dataUrl = event.target.result;
                    const downloadResult = await chrome.downloads.download({
                        url: dataUrl,
                        filename: `audit-screenshot-${Date.now()}.png`
                    });
                    
                    console.log('Screenshot saved to downloads:', downloadResult);

                    chrome.notifications.create({
                        type: 'basic',
                        iconUrl: 'icons/icon48.png',
                        title: 'Screenshot Saved',
                        message: 'Screenshot saved to downloads. Upload manually to audit tool.'
                    });
                } catch (downloadError) {
                    console.error('Failed to save screenshot with data URL:', downloadError);
                    
                    // Final fallback: Just show error notification
                    chrome.notifications.create({
                        type: 'basic',
                        iconUrl: 'icons/icon48.png',
                        title: 'Error',
                        message: 'Failed to save screenshot. Please try again.'
                    });
                }
            };
            
            reader.onerror = function() {
                console.error('Failed to read blob as data URL');
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icons/icon48.png',
                    title: 'Error',
                    message: 'Failed to save screenshot. Please try again.'
                });
            };
            
            reader.readAsDataURL(blob);
            
        } catch (downloadError) {
            console.error('Failed to save screenshot:', downloadError);
            
            // Last resort: show error notification
            try {
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icons/icon48.png',
                    title: 'Capture Failed',
                    message: 'Failed to capture and save screenshot. Please try again.'
                });
            } catch (finalError) {
                console.error('Failed to show error notification:', finalError);
            }
        }
    }
}
