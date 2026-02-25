-- PetPass Malaysia - RLS Policies
-- Run this in Supabase SQL Editor

-- ============================================
-- PETS TABLE - Enable RLS + Policies
-- ============================================
alter table pets enable row level security;

-- Owners can view their own pets
create policy "Users can view own pets"
on pets for select
to authenticated
using (owner_id = auth.uid());

-- Public can view pets for QR scan (limited fields handled in app)
create policy "Public can view pets for QR scan"
on pets for select
to anon
using (true);

-- Owners can insert their own pets
create policy "Users can insert own pets"
on pets for insert
to authenticated
with check (owner_id = auth.uid());

-- Owners can update their own pets
create policy "Users can update own pets"
on pets for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

-- Owners can delete their own pets
create policy "Users can delete own pets"
on pets for delete
to authenticated
using (owner_id = auth.uid());

-- ============================================
-- VACCINATIONS TABLE - Enable RLS + Policies
-- ============================================
alter table vaccinations enable row level security;

-- Users can view vaccinations for their own pets
create policy "Users can view own vaccinations"
on vaccinations for select
to authenticated
using (
  exists (
    select 1 from pets
    where pets.id = vaccinations.pet_id
    and pets.owner_id = auth.uid()
  )
);

-- Public can view vaccinations for QR scan
create policy "Public can view vaccinations for scan"
on vaccinations for select
to anon
using (true);

-- Users can insert vaccinations for their own pets
create policy "Users can insert own vaccinations"
on vaccinations for insert
to authenticated
with check (
  exists (
    select 1 from pets
    where pets.id = vaccinations.pet_id
    and pets.owner_id = auth.uid()
  )
);

-- Users can delete vaccinations for their own pets
create policy "Users can delete own vaccinations"
on vaccinations for delete
to authenticated
using (
  exists (
    select 1 from pets
    where pets.id = vaccinations.pet_id
    and pets.owner_id = auth.uid()
  )
);
