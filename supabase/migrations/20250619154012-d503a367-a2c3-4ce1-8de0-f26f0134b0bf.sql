
-- Create reports table to store audit reports
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  url TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  category TEXT NOT NULL CHECK (category IN ('ui/ux', 'performance', 'accessibility', 'functionality')),
  screenshot_url TEXT,
  annotated_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for screenshots and annotated images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('audit-screenshots', 'audit-screenshots', true);

-- Enable Row Level Security
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for reports
CREATE POLICY "Anyone can view reports" 
  ON public.reports 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create reports" 
  ON public.reports 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update reports" 
  ON public.reports 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can delete reports" 
  ON public.reports 
  FOR DELETE 
  USING (true);

-- Create storage policies for the bucket
CREATE POLICY "Anyone can upload audit screenshots"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'audit-screenshots');

CREATE POLICY "Anyone can view audit screenshots"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'audit-screenshots');

CREATE POLICY "Anyone can update audit screenshots"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'audit-screenshots');

CREATE POLICY "Anyone can delete audit screenshots"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'audit-screenshots');
