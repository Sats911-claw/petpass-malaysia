-- PetPass Malaysia - Database Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- WAITLIST TABLE
-- ============================================
create table if not exists waitlist (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text unique not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS for waitlist (optional - currently open for anyone to submit)
alter table waitlist enable row level security;

-- Allow anyone to submit to waitlist
create policy "Anyone can join waitlist"
on waitlist for insert
with check (true);

-- Allow public to view waitlist count (for social proof)
create policy "Public can view waitlist count"
on waitlist for select
using (true);

-- ============================================
-- PETS TABLE
-- ============================================
create table if not exists pets (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references auth.users not null,
  name text not null,
  species text,
  breed text,
  dob date,
  weight_kg numeric,
  colour text,
  microchip text,
  photo_url text,
  is_lost boolean default false,
  show_contact_public boolean default true,
  owner_phone text,
  owner_email text,
  created_at timestamp with time zone default now()
);

-- ============================================
-- VACCINATIONS TABLE
-- ============================================
create table if not exists vaccinations (
  id uuid default gen_random_uuid() primary key,
  pet_id uuid references pets on delete cascade not null,
  vaccine_name text not null,
  date_given date not null,
  next_due date,
  vet_name text,
  clinic text,
  notes text,
  created_at timestamp with time zone default now()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
create index if not exists idx_pets_owner_id on pets(owner_id);
create index if not exists idx_vaccinations_pet_id on vaccinations(pet_id);
create index if not exists idx_waitlist_email on waitlist(email);

-- ============================================
-- STORAGE (for pet photos)
-- ============================================
-- Create a bucket for pet photos
insert into storage.buckets (id, name, public)
values ('pet-photos', 'pet-photos', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload photos
create policy "Users can upload pet photos"
on storage.objects for insert
to authenticated
with check (bucket_id = 'pet-photos');

-- Allow anyone to view pet photos
create policy "Anyone can view pet photos"
on storage.objects for select
using (bucket_id = 'pet-photos');

-- Allow owners to delete their photos
create policy "Users can delete their pet photos"
on storage.objects for delete
to authenticated
using (
  exists (
    select 1 from pets
    where pets.photo_url = storage.objects.name
    and pets.owner_id = auth.uid()
  )
);
