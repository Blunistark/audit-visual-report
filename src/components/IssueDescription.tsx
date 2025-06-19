
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface IssueDescriptionProps {
  description: string;
  onDescriptionChange: (description: string) => void;
  severity: string;
  onSeverityChange: (severity: string) => void;
  category: string;
  onCategoryChange: (category: string) => void;
}

export const IssueDescription = ({
  description,
  onDescriptionChange,
  severity,
  onSeverityChange,
  category,
  onCategoryChange
}: IssueDescriptionProps) => {
  const [wordCount, setWordCount] = useState(0);

  const handleDescriptionChange = (value: string) => {
    onDescriptionChange(value);
    setWordCount(value.trim().split(/\s+/).filter(word => word.length > 0).length);
  };

  const severityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-700">
            Issue Category
          </Label>
          <Select value={category} onValueChange={onCategoryChange}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ui-ux">UI/UX Design</SelectItem>
              <SelectItem value="accessibility">Accessibility</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="functionality">Functionality</SelectItem>
              <SelectItem value="seo">SEO</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="content">Content</SelectItem>
              <SelectItem value="mobile">Mobile Responsiveness</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700">
            Severity Level
          </Label>
          <Select value={severity} onValueChange={onSeverityChange}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Low - Minor issues
                </div>
              </SelectItem>
              <SelectItem value="medium">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  Medium - Moderate impact
                </div>
              </SelectItem>
              <SelectItem value="high">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  High - Significant issues
                </div>
              </SelectItem>
              <SelectItem value="critical">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Critical - Urgent fix needed
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium text-gray-700">
            Issue Description
          </Label>
          <div className="flex items-center gap-2">
            {severity && (
              <Badge className={severityColors[severity as keyof typeof severityColors]}>
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
              </Badge>
            )}
            <span className="text-xs text-gray-500">
              {wordCount} words
            </span>
          </div>
        </div>
        
        <Textarea
          placeholder="Describe the issue in detail. Include what you expected vs what you observed, steps to reproduce, browser information, and any other relevant context..."
          value={description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          className="min-h-[120px] resize-y"
        />
        
        <div className="mt-2 text-xs text-gray-500">
          <p>
            <strong>Pro tip:</strong> Include specific details like browser version, screen size, 
            user actions that triggered the issue, and expected behavior for better issue tracking.
          </p>
        </div>
      </div>
    </div>
  );
};
