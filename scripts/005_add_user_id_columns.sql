-- Migration: Add user_id columns for user ownership
-- This ensures each user only sees their own pets and vaccinations

-- Add user_id to pets table if it doesn't exist
ALTER TABLE pets ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Add user_id to vaccination_records table if it doesn't exist
ALTER TABLE vaccination_records ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create index for faster user-based queries
CREATE INDEX IF NOT EXISTS idx_pets_user_id ON pets(user_id);
CREATE INDEX IF NOT EXISTS idx_vaccination_records_user_id ON vaccination_records(user_id);

-- Enable Row Level Security on pets table
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security on vaccination_records table
ALTER TABLE vaccination_records ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own pets
DROP POLICY IF EXISTS "Users can view own pets" ON pets;
CREATE POLICY "Users can view own pets" ON pets
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own pets
DROP POLICY IF EXISTS "Users can insert own pets" ON pets;
CREATE POLICY "Users can insert own pets" ON pets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own pets
DROP POLICY IF EXISTS "Users can update own pets" ON pets;
CREATE POLICY "Users can update own pets" ON pets
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own pets
DROP POLICY IF EXISTS "Users can delete own pets" ON pets;
CREATE POLICY "Users can delete own pets" ON pets
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Users can only view their own vaccination records
DROP POLICY IF EXISTS "Users can view own vaccinations" ON vaccination_records;
CREATE POLICY "Users can view own vaccinations" ON vaccination_records
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own vaccination records
DROP POLICY IF EXISTS "Users can insert own vaccinations" ON vaccination_records;
CREATE POLICY "Users can insert own vaccinations" ON vaccination_records
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own vaccination records
DROP POLICY IF EXISTS "Users can update own vaccinations" ON vaccination_records;
CREATE POLICY "Users can update own vaccinations" ON vaccination_records
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own vaccination records
DROP POLICY IF EXISTS "Users can delete own vaccinations" ON vaccination_records;
CREATE POLICY "Users can delete own vaccinations" ON vaccination_records
  FOR DELETE
  USING (auth.uid() = user_id);

-- Service role bypass policy for admin access (allows admin dashboard to see all records)
-- Note: The admin dashboard uses service role key which bypasses RLS
