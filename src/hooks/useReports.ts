
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

export const useReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedReports = data.map(report => ({
        id: report.id,
        url: report.url,
        description: report.description,
        severity: report.severity,
        category: report.category,
        createdAt: new Date(report.created_at),
        screenshot: report.screenshot_url,
        annotatedImage: report.annotated_image_url,
      }));

      setReports(formattedReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const saveReport = async (reportData: {
    url: string;
    description: string;
    severity: string;
    category: string;
    screenshot?: File;
    annotatedImage?: string;
  }) => {
    try {
      let screenshotUrl = null;
      let annotatedImageUrl = null;

      // Upload screenshot if provided
      if (reportData.screenshot) {
        const fileExt = reportData.screenshot.name.split('.').pop();
        const fileName = `${Date.now()}-screenshot.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('audit-screenshots')
          .upload(fileName, reportData.screenshot);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('audit-screenshots')
          .getPublicUrl(fileName);

        screenshotUrl = publicUrl;
      }

      // Upload annotated image if provided
      if (reportData.annotatedImage) {
        const fileName = `${Date.now()}-annotated.png`;
        
        // Convert data URL to blob
        const response = await fetch(reportData.annotatedImage);
        const blob = await response.blob();
        
        const { error: uploadError } = await supabase.storage
          .from('audit-screenshots')
          .upload(fileName, blob);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('audit-screenshots')
          .getPublicUrl(fileName);

        annotatedImageUrl = publicUrl;
      }

      // Save report to database
      const { error } = await supabase
        .from('reports')
        .insert({
          url: reportData.url,
          description: reportData.description,
          severity: reportData.severity,
          category: reportData.category,
          screenshot_url: screenshotUrl,
          annotated_image_url: annotatedImageUrl,
        });

      if (error) throw error;

      toast.success('Report saved successfully!');
      fetchReports(); // Refresh the reports list
      return true;
    } catch (error) {
      console.error('Error saving report:', error);
      toast.error('Failed to save report');
      return false;
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return {
    reports,
    loading,
    saveReport,
    refetch: fetchReports,
  };
};
