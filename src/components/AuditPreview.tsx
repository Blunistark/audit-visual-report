import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar, User, Tag } from 'lucide-react';

interface AuditPreviewProps {
  url: string;
  screenshot: File | null;
  annotatedImage: string | null;
  description: string;
  severity: string;
  category: string;
}

export const AuditPreview = ({
  url,
  screenshot,
  annotatedImage,
  description,
  severity,
  category
}: AuditPreviewProps) => {
  // Helper function to get the correct image source
  const getImageSource = () => {
    if (annotatedImage) {
      // If annotatedImage is a URL (from database) or data URL (from canvas)
      return annotatedImage;
    }
    if (screenshot) {
      // If screenshot is a File object, create object URL
      return URL.createObjectURL(screenshot);
    }
    return '';
  };

  const severityColors = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    critical: 'bg-red-100 text-red-800 border-red-200'
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Audit Report Preview
            </CardTitle>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {currentDate}
              </div>
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                Web Auditor
              </div>
            </div>
          </div>
          {severity && (
            <Badge className={severityColors[severity as keyof typeof severityColors]}>
              {severity.charAt(0).toUpperCase() + severity.slice(1)} Priority
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* URL Section */}
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Audited Website</h3>
          {url ? (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <ExternalLink className="h-4 w-4 text-gray-500" />
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline break-all"
              >
                {url}
              </a>
            </div>
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg text-gray-500 italic">
              No URL provided
            </div>
          )}
        </div>

        {/* Category Section */}
        {category && (
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Issue Category</h3>
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-gray-500" />              <Badge variant="secondary">
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Badge></div>
          </div>
        )}
        
        {/* Screenshot Section */}
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Screenshot Evidence</h3>
          {(annotatedImage || screenshot) ? (
            <div className="border rounded-lg p-2 bg-gray-50">
              <img
                src={getImageSource()}
                alt="Issue screenshot"
                className="max-w-full h-auto rounded block"
                onError={(e) => {
                  console.error('Image failed to load:', e);
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              {annotatedImage && (
                <p className="text-xs text-green-600 mt-2">
                  ✓ Includes annotations highlighting the issue area
                </p>
              )}
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-500">
              No screenshot provided
            </div>
          )}
        </div>

        {/* Description Section */}
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Issue Description</h3>
          {description ? (
            <div className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg">
              <p className="whitespace-pre-wrap text-gray-700">{description}</p>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg text-gray-500 italic">
              No description provided
            </div>
          )}
        </div>

        {/* Completeness Indicator */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Report Completeness
            </div>
            <div className="flex gap-1">
              {[url, screenshot, description, severity, category].map((item, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    item ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {[url, screenshot, description, severity, category].filter(Boolean).length}/5 sections completed
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
