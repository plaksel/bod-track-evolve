-- Re-enable RLS on measurements table now that we're implementing authentication
ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;