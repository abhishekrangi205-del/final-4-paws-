-- Create pets table for pet profiles
CREATE TABLE IF NOT EXISTS public.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  breed TEXT,
  age_years INTEGER,
  age_months INTEGER,
  weight_lbs DECIMAL,
  size TEXT CHECK (size IN ('small', 'large')),
  gender TEXT CHECK (gender IN ('male', 'female')),
  spayed_neutered BOOLEAN DEFAULT false,
  medical_notes TEXT,
  special_instructions TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  vet_name TEXT,
  vet_phone TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vaccination records table
CREATE TABLE IF NOT EXISTS public.vaccination_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  vaccine_name TEXT NOT NULL,
  date_administered DATE NOT NULL,
  expiration_date DATE,
  document_url TEXT,
  document_pathname TEXT,
  notes TEXT,
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccination_records ENABLE ROW LEVEL SECURITY;

-- Pets policies
CREATE POLICY "Users can view own pets" ON public.pets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own pets" ON public.pets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pets" ON public.pets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pets" ON public.pets
  FOR DELETE USING (auth.uid() = user_id);

-- Admin can view all pets
CREATE POLICY "Admin can view all pets" ON public.pets
  FOR SELECT USING (auth.role() = 'authenticated');

-- Vaccination records policies
CREATE POLICY "Users can view own pet vaccinations" ON public.vaccination_records
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.pets WHERE pets.id = vaccination_records.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can create vaccinations for own pets" ON public.vaccination_records
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.pets WHERE pets.id = vaccination_records.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can update own pet vaccinations" ON public.vaccination_records
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.pets WHERE pets.id = vaccination_records.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can delete own pet vaccinations" ON public.vaccination_records
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.pets WHERE pets.id = vaccination_records.pet_id AND pets.user_id = auth.uid())
  );

-- Admin can view all vaccination records
CREATE POLICY "Admin can view all vaccinations" ON public.vaccination_records
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admin can update vaccination verification
CREATE POLICY "Admin can update vaccinations" ON public.vaccination_records
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pets_user_id ON public.pets(user_id);
CREATE INDEX IF NOT EXISTS idx_vaccination_records_pet_id ON public.vaccination_records(pet_id);
