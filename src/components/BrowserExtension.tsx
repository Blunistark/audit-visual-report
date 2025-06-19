import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, ExternalLink, Chrome, Globe, Camera, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Screenshot {
  filename: string;
  url: string;
  metadata: {
    sourceUrl: string;
    area?: {
      left: number;
      top: number;
      width: number;
      height: number;
    };
    timestamp: string;
  };
}

interface BrowserExtensionProps {
  onScreenshotSelect: (screenshot: File, url: string) => void;
}

export const BrowserExtension = ({ onScreenshotSelect }: BrowserExtensionProps) => {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  useEffect(() => {
    checkExtensionInstallation();
    fetchRecentScreenshots();
    
    // Listen for extension announcements
    const handleExtensionAnnounce = (event: MessageEvent) => {
      if (event.data.type === 'WEB_AUDIT_EXTENSION_ANNOUNCE' && event.data.installed) {
        console.log('Extension announced its presence');
        setIsExtensionInstalled(true);
      }
    };
    
    window.addEventListener('message', handleExtensionAnnounce);
    
    // Poll for new screenshots every 5 seconds when needed
    if (isPolling) {
      const interval = setInterval(fetchRecentScreenshots, 5000);
      return () => {
        clearInterval(interval);
        window.removeEventListener('message', handleExtensionAnnounce);
      };
    }
    
    return () => {
      window.removeEventListener('message', handleExtensionAnnounce);
    };
  }, [isPolling]);  const checkExtensionInstallation = () => {
    console.log('Checking for extension installation...');
    
    // Method 1: Check for injected marker element
    const extensionMarker = document.querySelector('[data-web-audit-extension]');
    console.log('Extension marker found:', !!extensionMarker);
    if (extensionMarker) {
      console.log('Extension detected via marker element');
      setIsExtensionInstalled(true);
      return;
    }

    // Method 2: Try to communicate with content script
    let responseReceived = false;
    
    const messageHandler = (event: MessageEvent) => {
      console.log('Received message during detection:', event.data);
      if (event.data.type === 'WEB_AUDIT_EXTENSION_RESPONSE' && event.data.installed) {
        console.log('Extension detected via message response');
        responseReceived = true;
        setIsExtensionInstalled(true);
        window.removeEventListener('message', messageHandler);
      }
    };

    window.addEventListener('message', messageHandler);
    
    // Send detection message
    console.log('Sending extension detection message');
    window.postMessage({
      type: 'WEB_AUDIT_EXTENSION_CHECK'
    }, '*');

    // If no response in 1 second, assume extension is not installed
    setTimeout(() => {
      if (!responseReceived) {
        console.log('No extension response received, assuming not installed');
        setIsExtensionInstalled(false);
        window.removeEventListener('message', messageHandler);
      }
    }, 1000);
  };
  const fetchRecentScreenshots = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/screenshots');
      if (response.ok) {
        const data = await response.json();
        setScreenshots(data.screenshots || []);
      }
    } catch (error) {
      console.error('Failed to fetch screenshots:', error);
    }
  };
  const handleScreenshotSelect = async (screenshot: Screenshot) => {
    try {
      // Fetch the actual image file from the API server
      const response = await fetch(`http://localhost:8081${screenshot.url}`);
      const blob = await response.blob();
      const file = new File([blob], screenshot.filename, { type: 'image/png' });
      
      onScreenshotSelect(file, screenshot.metadata.sourceUrl);
      toast.success('Screenshot imported from browser extension!');
    } catch (error) {
      console.error('Failed to import screenshot:', error);
      toast.error('Failed to import screenshot');
    }
  };

  const startScreenshotCapture = () => {
    setIsPolling(true);
    toast.info('Browser extension capture mode activated. Take a screenshot in your browser.');
    
    // Stop polling after 5 minutes
    setTimeout(() => {
      setIsPolling(false);
    }, 5 * 60 * 1000);
  };  const downloadExtension = () => {
    // Show installation instructions
    toast.info('Opening extension installation guide...', {
      duration: 2000
    });
    
    // Open installation instructions in a new tab
    setTimeout(() => {
      const instructionsUrl = window.location.origin + '/extension-install.html';
      window.open(instructionsUrl, '_blank');
      
      toast.success('Installation guide opened! Follow the steps then click "Check Again".', {
        duration: 5000
      });
    }, 500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Chrome className="h-5 w-5" />
          Browser Extension
        </CardTitle>
        <CardDescription>
          Capture screenshots directly from any website using our browser extension
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isExtensionInstalled ? (
          <div className="text-center py-6">
            <Chrome className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="font-medium mb-2">Browser Extension Not Detected</h3>
            <p className="text-sm text-gray-600 mb-4">
              Install our browser extension to capture screenshots directly from any website, 
              including those requiring login credentials.
            </p>            <div className="space-y-3">
              <Button onClick={downloadExtension} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Install Browser Extension
              </Button>
              <Button 
                onClick={checkExtensionInstallation} 
                variant="outline" 
                className="w-full"
              >
                🔄 Check Again
              </Button>
              <div className="text-xs text-gray-500">
                <p>Extension features:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Capture any website area</li>
                  <li>Works with login-protected pages</li>
                  <li>Automatic integration with audit tool</li>
                  <li>Area selection overlay</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">
                  Extension Connected
                </Badge>
                <span className="text-sm text-gray-600">Ready to capture</span>
              </div>
              <Button 
                onClick={startScreenshotCapture}
                disabled={isPolling}
                size="sm"
              >
                <Camera className="h-4 w-4 mr-2" />
                {isPolling ? 'Waiting for Capture...' : 'Start Capture'}
              </Button>
            </div>

            {screenshots.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Recent Screenshots</h4>                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {screenshots.map((screenshot, index) => {
                    // Safety check for screenshot structure
                    if (!screenshot.metadata || !screenshot.metadata.sourceUrl) {
                      console.warn('Invalid screenshot structure:', screenshot);
                      return null;
                    }
                    
                    return (
                      <div key={index} className="border rounded-lg p-3 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Globe className="h-3 w-3 text-gray-400 flex-shrink-0" />
                              <span className="text-xs text-gray-600 truncate">
                                {new URL(screenshot.metadata.sourceUrl).hostname}
                              </span>
                              {screenshot.metadata.area && (
                                <Badge variant="secondary" className="text-xs">
                                  {screenshot.metadata.area.width}×{screenshot.metadata.area.height}
                                </Badge>
                              )}                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              {new Date(screenshot.metadata.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(screenshot.url, '_blank')}
                              className="h-7 px-2"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleScreenshotSelect(screenshot)}
                              className="h-7 px-2"
                            >
                              Use
                            </Button>
                          </div></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {isPolling && (
              <div className="text-center py-4 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50">
                <Camera className="h-8 w-8 mx-auto mb-2 text-blue-500 animate-pulse" />
                <p className="text-sm font-medium text-blue-700">Waiting for screenshot capture...</p>
                <p className="text-xs text-blue-600 mt-1">
                  Use the browser extension to capture a screenshot
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
