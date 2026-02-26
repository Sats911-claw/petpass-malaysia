-- PetPass Malaysia - Found Reports Table
-- Run this in Supabase SQL Editor

-- ============================================
-- FOUND REPORTS TABLE
-- ============================================
create table if not exists found_reports (
  id uuid default gen_random_uuid() primary key,
  pet_id uuid references pets on delete cascade not null,
  finder_name text not null,
  finder_phone text,
  location_text text,
  lat numeric,
  lng numeric,
  message text,
  created_at timestamp with time zone default now()
);

create index if not exists idx_found_reports_pet_id on found_reports(pet_id);

-- RLS
alter table found_reports enable row level security;

drop policy if exists "Anyone can submit found report" on found_reports;
create policy "Anyone can submit found report"
on found_reports for insert with check (true);

drop policy if exists "Anyone can view found reports" on found_reports;
create policy "Anyone can view found reports"
on found_reports for select using (true);
