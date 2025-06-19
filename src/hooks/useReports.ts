import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Report, ReportInsert, ReportUpdate, ReportSummary } from '@/integrations/supabase/types';
import { toast } from 'sonner';

interface ReportData {
  url: string;
  description: string;
  severity: string;
  category: string;
  screenshot?: File;
  annotatedImage?: string;
  projectId?: string;
}

export const useReports = (projectId?: string) => {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      let query = supabase
        .from('report_summary')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter by project if projectId is provided
      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const saveReport = async (reportData: ReportData): Promise<Report | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let screenshotUrl = null;
      let annotatedImageUrl = null;

      // Upload screenshot if provided
      if (reportData.screenshot) {
        const fileExt = reportData.screenshot.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('screenshots')
          .upload(fileName, reportData.screenshot);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('screenshots')
          .getPublicUrl(fileName);
        
        screenshotUrl = publicUrl;
      }

      // Upload annotated image if provided
      if (reportData.annotatedImage) {
        const fileName = `${user.id}/${Date.now()}_annotated.png`;
        
        // Convert data URL to blob
        const response = await fetch(reportData.annotatedImage);
        const blob = await response.blob();
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('screenshots')
          .upload(fileName, blob);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('screenshots')
          .getPublicUrl(fileName);
        
        annotatedImageUrl = publicUrl;
      }

      // Create the report
      const reportInsert: ReportInsert = {
        url: reportData.url,
        description: reportData.description,
        severity: reportData.severity,
        category: reportData.category,
        screenshot_url: screenshotUrl,
        annotated_image_url: annotatedImageUrl,
        user_id: user.id,
        project_id: reportData.projectId || null
      };

      const { data, error } = await supabase
        .from('reports')
        .insert(reportInsert)
        .select()
        .single();

      if (error) throw error;

      await fetchReports();
      toast.success('Report saved successfully!');
      return data;
    } catch (error) {
      console.error('Error saving report:', error);
      toast.error('Failed to save report');
      return null;
    }
  };

  const updateReport = async (id: string, updates: Partial<ReportData>): Promise<boolean> => {
    try {
      const reportUpdate: ReportUpdate = {};
      
      if (updates.url) reportUpdate.url = updates.url;
      if (updates.description) reportUpdate.description = updates.description;
      if (updates.severity) reportUpdate.severity = updates.severity;
      if (updates.category) reportUpdate.category = updates.category;
      if (updates.projectId !== undefined) reportUpdate.project_id = updates.projectId;

      const { error } = await supabase
        .from('reports')
        .update(reportUpdate)
        .eq('id', id);

      if (error) throw error;

      await fetchReports();
      toast.success('Report updated successfully!');
      return true;
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('Failed to update report');
      return false;
    }
  };

  const toggleSolved = async (id: string, solved: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ solved })
        .eq('id', id);

      if (error) throw error;

      await fetchReports();
      toast.success(`Report marked as ${solved ? 'solved' : 'unsolved'}!`);
      return true;
    } catch (error) {
      console.error('Error updating report status:', error);
      toast.error('Failed to update report status');
      return false;
    }
  };

  const deleteReport = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchReports();
      toast.success('Report deleted successfully!');
      return true;
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete report');
      return false;
    }
  };

  useEffect(() => {
    fetchReports();
  }, [projectId]);

  return {
    reports,
    loading,
    saveReport,
    updateReport,
    toggleSolved,
    deleteReport,
    refetchReports: fetchReports
  };
};
