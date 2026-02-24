# PetPass Malaysia 🐾

Malaysia's first all-in-one pet management platform. One QR code. Your pet's full medical history. Instant lost pet alerts.

## Features

- **Digital Pet Passport** - Store all your pet's information in one place
- **QR Code Generation** - Unique QR code for each pet for easy identification
- **Vaccination Records** - Keep track of vaccinations with automatic reminders
- **Lost Pet Alerts** - Mark pets as lost to alert the community
- **Pet-Friendly Directory** - Find pet-friendly places in Malaysia (coming soon)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase
- **Styling:** Tailwind CSS
- **Authentication:** Supabase Auth
- **QR Generation:** qrcode

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

## Getting Started

### 1. Clone and Install

```bash
cd petpass-malaysia
npm install
```

### 2. Set Up Supabase

Follow the instructions in [SUPABASE-SETUP.md](./SUPABASE-SETUP.md) to:

1. Create a Supabase project
2. Run the SQL schema
3. Get your API keys

### 3. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and add your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
petpass-malaysia/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/                # Login/Signup page
│   ├── dashboard/            # User dashboard (protected)
│   ├── pets/
│   │   ├── new/              # Add new pet
│   │   └── [id]/             # Pet profile
│   │       └── vaccinations/
│   │           └── new/     # Add vaccination
│   └── scan/
│       └── [petId]/         # Public scan page (QR landing)
├── components/               # React components
├── lib/
│   └── supabase.ts          # Supabase client
├── middleware.ts            # Auth middleware
└── SUPABASE-SETUP.sql       # Database Deployment to schema
```

## Vercel

### Option 1: Deploy from Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "Add New..." → "Project"
4. Import your GitHub repository
5. Add the environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click "Deploy"

### Option 2: Deploy from CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Follow the prompts to complete deployment.

### Option 3: Deploy from GitHub (CI/CD)

1. Push code to GitHub
2. Go to Vercel Dashboard
3. Import repository
4. Vercel automatically deploys on every push to main branch

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

## Supabase Setup Steps

### 1. Create Project
- Go to [supabase.com](https://supabase.com)
- Create new project "PetPass Malaysia"

### 2. Run SQL
- Open SQL Editor in Supabase dashboard
- Copy and run the contents of `SUPABASE-SETUP.sql`

### 3. Get Credentials
- Go to Project Settings → API
- Copy Project URL and anon key

### 4. Update .env.local
- Paste your credentials

## License

MIT

---

Built with ❤️ for Malaysian pet owners
