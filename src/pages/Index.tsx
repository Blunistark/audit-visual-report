import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AnnotationCanvas } from '@/components/AnnotationCanvas';
import { ScreenshotUpload } from '@/components/ScreenshotUpload';
import { URLInput } from '@/components/URLInput';
import { IssueDescription } from '@/components/IssueDescription';
import { AuditPreview } from '@/components/AuditPreview';
import { ReportsList } from '@/components/ReportsList';
import { useReports } from '@/hooks/useReports';
import { FileText, Image, Globe, Eye, List } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [annotatedImage, setAnnotatedImage] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [severity, setSeverity] = useState('');
  const [category, setCategory] = useState('');
  const [activeTab, setActiveTab] = useState('url');
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const { reports, loading, saveReport } = useReports();

  const handleScreenshotChange = (file: File | null) => {
    setScreenshot(file);
    if (file) {
      setActiveTab('annotate');
      toast.success('Screenshot uploaded! You can now annotate it.');
    }
  };

  const handleAnnotatedImage = (dataUrl: string) => {
    setAnnotatedImage(dataUrl);
    setActiveTab('description');
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
  };

  const handleUrlSubmit = () => {
    if (url) {
      setActiveTab('screenshot');
      toast.success('URL saved! Now upload a screenshot of the issue.');
    }
  };

  const handleDescriptionComplete = () => {
    if (issueDescription) {
      setActiveTab('preview');
      toast.success('Issue description saved! Check the preview.');
    }
  };

  const handleSaveReport = async () => {
    if (url && issueDescription && severity && category) {
      const success = await saveReport({
        url,
        description: issueDescription,
        severity,
        category,
        screenshot,
        annotatedImage,
      });
      
      if (success) {
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setScreenshot(null);
    setAnnotatedImage(null);
    setUrl('');
    setIssueDescription('');
    setSeverity('');
    setCategory('');
    setActiveTab('url');
    setSelectedReport(null);
    toast.success('Form reset! Start a new audit report.');
  };

  const handleViewReport = (report: any) => {
    setSelectedReport(report);
    setActiveTab('preview');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Visual Audit Report Tool
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create detailed visual reports for web issues with screenshots, annotations, and descriptions
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Audit Report Manager
            </CardTitle>
            <CardDescription>
              Create new reports or view existing ones organized by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="url" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  URL
                </TabsTrigger>
                <TabsTrigger value="screenshot" className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Screenshot
                </TabsTrigger>
                <TabsTrigger value="annotate" className="flex items-center gap-2" disabled={!screenshot}>
                  <FileText className="h-4 w-4" />
                  Annotate
                </TabsTrigger>
                <TabsTrigger value="description" className="flex items-center gap-2" disabled={!annotatedImage && !screenshot}>
                  <FileText className="h-4 w-4" />
                  Description
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  All Reports
                </TabsTrigger>
              </TabsList>

              <TabsContent value="url" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Step 1: Enter URL</CardTitle>
                    <CardDescription>
                      Enter the URL of the page where you found the issue
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <URLInput 
                      url={url} 
                      onUrlChange={handleUrlChange}
                    />
                    <div className="mt-4">
                      <Button 
                        onClick={handleUrlSubmit}
                        disabled={!url}
                        className="w-full"
                      >
                        Continue to Screenshot
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="screenshot" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Step 2: Upload Screenshot</CardTitle>
                    <CardDescription>
                      Upload a screenshot of the issue you want to report
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScreenshotUpload 
                      screenshot={screenshot}
                      onScreenshotChange={handleScreenshotChange}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="annotate" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Step 3: Annotate Screenshot</CardTitle>
                    <CardDescription>
                      Add annotations to highlight the specific issues in your screenshot
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AnnotationCanvas 
                      screenshot={screenshot} 
                      onAnnotatedImage={handleAnnotatedImage}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="description" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Step 4: Describe the Issue</CardTitle>
                    <CardDescription>
                      Provide a detailed description of the issue and expected behavior
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <IssueDescription 
                      description={issueDescription}
                      onDescriptionChange={setIssueDescription}
                      severity={severity}
                      onSeverityChange={setSeverity}
                      category={category}
                      onCategoryChange={setCategory}
                    />
                    <div className="mt-4">
                      <Button 
                        onClick={handleDescriptionComplete}
                        disabled={!issueDescription || !severity || !category}
                        className="w-full"
                      >
                        Preview Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reports" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <List className="h-6 w-6" />
                      All Reports
                    </CardTitle>
                    <CardDescription>
                      View and manage all your audit reports organized by category
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8">Loading reports...</div>
                    ) : (
                      <ReportsList 
                        reports={reports}
                        onViewReport={handleViewReport}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preview" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-6 w-6" />
                      {selectedReport ? 'Report Details' : 'Audit Report Preview'}
                    </CardTitle>
                    <CardDescription>
                      {selectedReport ? 'Viewing saved report details' : 'Review your complete audit report'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AuditPreview 
                      url={selectedReport?.url || url}
                      screenshot={selectedReport ? undefined : screenshot}
                      annotatedImage={selectedReport?.annotatedImage || annotatedImage}
                      description={selectedReport?.description || issueDescription}
                      severity={selectedReport?.severity || severity}
                      category={selectedReport?.category || category}
                    />
                    <div className="mt-6 flex gap-4">
                      {selectedReport ? (
                        <Button onClick={() => setActiveTab('reports')} variant="outline">
                          Back to Reports
                        </Button>
                      ) : (
                        <>
                          <Button onClick={resetForm} variant="outline">
                            Create New Report
                          </Button>
                          <Button onClick={handleSaveReport}>
                            Save Report
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
