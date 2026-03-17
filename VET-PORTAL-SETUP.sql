-- VET PORTAL SETUP - PetPass Malaysia
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clinics table
CREATE TABLE IF NOT EXISTS public.vet_clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  area TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  photo_url TEXT,
  operating_hours JSONB,  -- {"mon":"8:00-18:00", "tue":"8:00-18:00", ...}
  is_24h BOOLEAN DEFAULT FALSE,
  emergency_line TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vets/Doctors table
CREATE TABLE IF NOT EXISTS public.vets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  clinic_id UUID REFERENCES vet_clinics(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  photo_url TEXT,
  license_number TEXT UNIQUE NOT NULL,
  license_expiry DATE,
  years_in_service INTEGER,
  bio TEXT,
  specialities TEXT[],          -- ['surgery','dermatology','oncology']
  animal_types TEXT[],          -- ['small','large','exotic','avian','aquatic']
  does_house_calls BOOLEAN DEFAULT FALSE,
  house_call_areas TEXT[],      -- ['Bangsar','Mont Kiara','Petaling Jaya']
  is_on_call BOOLEAN DEFAULT FALSE,
  on_call_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vet availability/schedule (for on-call tracking)
CREATE TABLE IF NOT EXISTS public.vet_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vet_id UUID REFERENCES vets(id) ON DELETE CASCADE,
  day_of_week INTEGER,          -- 0=Sun, 1=Mon ... 6=Sat
  start_time TIME,
  end_time TIME,
  is_on_call BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies - Open for all reads
ALTER TABLE public.vet_clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vet_availability ENABLE ROW LEVEL SECURITY;

-- All tables: open SELECT
CREATE POLICY "Allow public read vet_clinics" ON public.vet_clinics FOR SELECT USING (true);
CREATE POLICY "Allow public read vets" ON public.vets FOR SELECT USING (true);
CREATE POLICY "Allow public read vet_availability" ON public.vet_availability FOR SELECT USING (true);

-- Open INSERT/UPDATE for self-registration
CREATE POLICY "Allow insert vets" ON public.vets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update vets" ON public.vets FOR UPDATE USING (true);

-- Open INSERT/UPDATE for clinics (for self-registration)
CREATE POLICY "Allow insert vet_clinics" ON public.vet_clinics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update vet_clinics" ON public.vet_clinics FOR UPDATE USING (true);

-- Availability INSERT/UPDATE
CREATE POLICY "Allow insert vet_availability" ON public.vet_availability FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update vet_availability" ON public.vet_availability FOR UPDATE USING (true);
