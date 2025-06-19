
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar, Globe, AlertTriangle, Bug, Zap, Eye, Search, Filter } from 'lucide-react';

interface Report {
  id: string;
  url: string;
  description: string;
  severity: string;
  category: string;
  createdAt: Date;
  screenshot?: string;
  annotatedImage?: string;
}

interface ReportsListProps {
  reports: Report[];
  onViewReport: (report: Report) => void;
}

export const ReportsList = ({ reports, onViewReport }: ReportsListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'ui/ux':
        return <Eye className="h-4 w-4" />;
      case 'performance':
        return <Zap className="h-4 w-4" />;
      case 'accessibility':
        return <AlertTriangle className="h-4 w-4" />;
      case 'functionality':
        return <Bug className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || report.severity === filterSeverity;
    const matchesCategory = filterCategory === 'all' || report.category === filterCategory;
    
    return matchesSearch && matchesSeverity && matchesCategory;
  });

  const reportsByCategory = filteredReports.reduce((acc, report) => {
    if (!acc[report.category]) {
      acc[report.category] = [];
    }
    acc[report.category].push(report);
    return acc;
  }, {} as Record<string, Report[]>);

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="ui/ux">UI/UX</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="accessibility">Accessibility</SelectItem>
              <SelectItem value="functionality">Functionality</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {filteredReports.length} of {reports.length} reports
      </div>

      {/* Reports by Category */}
      {Object.keys(reportsByCategory).length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-gray-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No reports found</h3>
              <p>No reports match your current filters. Try adjusting your search criteria.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        Object.entries(reportsByCategory).map(([category, categoryReports]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getCategoryIcon(category)}
                {category}
                <Badge variant="secondary">{categoryReports.length}</Badge>
              </CardTitle>
              <CardDescription>
                Reports in the {category.toLowerCase()} category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryReports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${getSeverityColor(report.severity)} text-white`}>
                            {report.severity}
                          </Badge>
                          <div className="flex items-center text-sm text-gray-500">
                            <Globe className="h-4 w-4 mr-1" />
                            {new URL(report.url).hostname}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {report.createdAt.toLocaleDateString()}
                          </div>
                        </div>
                        <h4 className="font-medium mb-1">{report.description.slice(0, 100)}...</h4>
                        <p className="text-sm text-gray-600">{report.url}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewReport(report)}
                        className="ml-4"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
