-- Create pets table in public schema
CREATE TABLE IF NOT EXISTS public.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  breed TEXT,
  age_years INTEGER,
  size TEXT,
  status TEXT DEFAULT 'active',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vaccination_records table
CREATE TABLE IF NOT EXISTS public.vaccination_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  vaccine_name TEXT NOT NULL,
  vaccination_date DATE NOT NULL,
  expiry_date DATE,
  verified BOOLEAN DEFAULT FALSE,
  verified_by TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pets_user_id ON public.pets(user_id);
CREATE INDEX IF NOT EXISTS idx_vaccination_records_pet_id ON public.vaccination_records(pet_id);
CREATE INDEX IF NOT EXISTS idx_pets_status ON public.pets(status);

-- Enable RLS on pets table
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- RLS policies for pets (admin can view all)
CREATE POLICY "Enable read access for authenticated users" ON public.pets
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.pets
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.pets
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Enable RLS on vaccination_records
ALTER TABLE public.vaccination_records ENABLE ROW LEVEL SECURITY;

-- RLS policies for vaccination_records
CREATE POLICY "Enable read access for authenticated users" ON public.vaccination_records
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.vaccination_records
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.vaccination_records
  FOR UPDATE USING (auth.role() = 'authenticated');
