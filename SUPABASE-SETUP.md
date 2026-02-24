# PetPass Malaysia - Supabase Setup

Follow these steps to set up your Supabase backend:

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in the details:
   - **Name:** PetPass Malaysia
   - **Database Password:** Create a strong password (save this!)
   - **Region:** Southeast Asia (Singapore) - closest to Malaysia
4. Click "Create new project" and wait for it to set up (1-2 minutes)

## 2. Run the SQL Schema

1. In your Supabase dashboard, click "SQL Editor" in the left sidebar
2. Click "New query"
3. Copy the contents of `SUPABASE-SETUP.sql` from this project
4. Paste into the SQL Editor
5. Click "Run" to execute

This will create:
- `waitlist` table - for email waitlist signups
- `pets` table - for storing pet information
- `vaccinations` table - for vaccination records

## 3. Get Your API Keys

1. Click "Project Settings" (gear icon) in the left sidebar
2. Click "API"
3. Copy the following:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys" - the one that says "public")

## 4. Configure Environment Variables

Create a `.env.local` file in the project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace the values with what you copied in step 3.

## 5. Enable Auth (Optional - for production)

The app uses Supabase Auth. To enable email magic links:

1.Authentication" in the left sidebar
2 Go to ". Click "Providers"
3. Click "Email"
4. Enable "Magic Link"

You can also enable "Confirm email" if you want users to verify their email.

## 6. Set Up Row Level Security (RLS)

The tables are created without RLS for development. For production, add these policies:

### Pets table (only owners can see their pets):
```sql
alter table pets enable row level security;

create policy "Users can see their own pets"
on pets for select
using (auth.uid() = owner_id);

create policy "Users can insert their own pets"
on pets for insert
with check (auth.uid() = owner_id);

create policy "Users can update their own pets"
on pets for update
using (auth.uid() = owner_id);

create policy "Users can delete their own pets"
on pets for delete
using (auth.uid() = owner_id);
```

### Vaccinations table:
```sql
alter table vaccinations enable row level security;

create policy "Users can see vaccinations for their pets"
on vaccinations for select
using (
  exists (
    select 1 from pets
    where pets.id = vaccinations.pet_id
    and pets.owner_id = auth.uid()
  )
);

create policy "Users can insert vaccinations for their pets"
on vaccinations for insert
with check (
  exists (
    select 1 from pets
    where pets.id = vaccinations.pet_id
    and pets.owner_id = auth.uid()
  )
);

create policy "Users can update vaccinations for their pets"
on vaccinations for update
using (
  exists (
    select 1 from pets
    where pets.id = vaccinations.pet_id
    and pets.owner_id = auth.uid()
  )
);

create policy "Users can delete vaccinations for their pets"
on vaccinations for delete
using (
  exists (
    select 1 from pets
    where pets.id = vaccinations.pet_id
    and pets.owner_id = auth.uid()
  )
);
```

---

## Quick Start

After setup:
1. Run `npm run dev` to start the development server
2. Visit `http://localhost:3000` to see the landing page
3. Sign up for the waitlist to test the database connection
4. Go to `/login` to create an account and test the pet management features
