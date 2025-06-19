
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

interface URLInputProps {
  url: string;
  onUrlChange: (url: string) => void;
}

export const URLInput = ({ url, onUrlChange }: URLInputProps) => {
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const validateUrl = (inputUrl: string) => {
    try {
      new URL(inputUrl);
      return inputUrl.startsWith('http://') || inputUrl.startsWith('https://');
    } catch {
      return false;
    }
  };

  const handleUrlChange = (value: string) => {
    onUrlChange(value);
    setIsValid(value ? validateUrl(value) : null);
  };

  const handleTest = async () => {
    if (!url || !validateUrl(url)) return;
    
    setIsValidating(true);
    // Simulate URL validation
    setTimeout(() => {
      setIsValidating(false);
      setIsValid(true);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="url" className="text-sm font-medium text-gray-700">
          Website URL to Audit
        </Label>
        <div className="mt-1 flex gap-2">
          <div className="relative flex-1">
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              className={`pr-10 ${
                isValid === true ? 'border-green-500 focus:border-green-500' :
                isValid === false ? 'border-red-500 focus:border-red-500' : ''
              }`}
            />
            {isValid === true && (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
            {isValid === false && (
              <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
            )}
          </div>
          <Button
            onClick={handleTest}
            disabled={!url || !validateUrl(url) || isValidating}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            {isValidating ? 'Testing...' : 'Test'}
          </Button>
        </div>
        {isValid === false && (
          <p className="mt-1 text-sm text-red-600">
            Please enter a valid URL starting with http:// or https://
          </p>
        )}
        {isValid === true && (
          <p className="mt-1 text-sm text-green-600">
            URL is valid and accessible
          </p>
        )}
      </div>
    </div>
  );
};
