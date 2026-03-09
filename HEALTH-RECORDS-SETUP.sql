-- Pet Health Records Database Setup
-- Run this SQL in Supabase to set up the pet_medical_records table

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create pet_medical_records table
CREATE TABLE IF NOT EXISTS public.pet_medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  pet_uid TEXT,
  record_type TEXT NOT NULL CHECK (record_type IN ('checkup', 'medication', 'procedure', 'vaccination', 'other')),
  title TEXT NOT NULL,
  medication_name TEXT,
  dosage TEXT,
  frequency TEXT,
  clinic_name TEXT,
  vet_name TEXT,
  performed_at DATE NOT NULL,
  next_followup DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on pet_id for faster queries
CREATE INDEX IF NOT EXISTS idx_pet_medical_records_pet_id ON public.pet_medical_records(pet_id);

-- Enable Row Level Security
ALTER TABLE public.pet_medical_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Owners can CRUD their own pet records
CREATE POLICY "Owners can manage their pet medical records" ON public.pet_medical_records
  FOR ALL
  USING (
    pet_id IN (
      SELECT id FROM public.pets WHERE owner_id = auth.uid()
    )
  );

-- Allow public read access (for clinic scanning)
CREATE POLICY "Public can read medical records" ON public.pet_medical_records
  FOR SELECT
  USING (true);

-- Allow public insert (for clinic use - they don't have auth)
CREATE POLICY "Public can insert medical records" ON public.pet_medical_records
  FOR INSERT
  WITH CHECK (true);

-- Allow public update (for clinic use)
CREATE POLICY "Public can update medical records" ON public.pet_medical_records
  FOR UPDATE
  USING (true);

-- Allow public delete (for clinic use)
CREATE POLICY "Public can delete medical records" ON public.pet_medical_records
  FOR DELETE
  USING (true);

-- Add comments for documentation
COMMENT ON TABLE public.pet_medical_records IS 'Medical records for pets including checkups, medications, procedures, and vaccinations';
COMMENT ON COLUMN public.pet_medical_records.record_type IS 'Type of medical record: checkup, medication, procedure, vaccination, or other';
COMMENT ON COLUMN public.pet_medical_records.next_followup IS 'Date for next follow-up visit or medication dose';
