-- Create measurements table to store fitness tracking data
CREATE TABLE public.measurements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  measurement_type TEXT NOT NULL,
  value NUMERIC(5,1) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own measurements" 
ON public.measurements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own measurements" 
ON public.measurements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own measurements" 
ON public.measurements 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own measurements" 
ON public.measurements 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_measurements_user_created ON public.measurements(user_id, created_at DESC);
CREATE INDEX idx_measurements_type ON public.measurements(measurement_type);