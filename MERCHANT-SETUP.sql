-- PetPass Malaysia - Merchant Setup SQL
-- Run this in Supabase SQL Editor

-- ============================================
-- MERCHANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pet_hotel', 'vet', 'groomer', 'pet_store', 'trainer', 'other')),
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  description TEXT,
  instagram TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for merchants
CREATE POLICY "Merchants can view all" ON merchants FOR SELECT USING (true);
CREATE POLICY "Merchants can insert" ON merchants FOR INSERT WITH CHECK (true);
CREATE POLICY "Merchants can update" ON merchants FOR UPDATE USING (true);

-- ============================================
-- MERCHANT SERVICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS merchant_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE NOT NULL,
  service_name TEXT NOT NULL,
  price DECIMAL(10,2),
  duration_minutes INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE merchant_services ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Services can view all" ON merchant_services FOR SELECT USING (true);
CREATE POLICY "Services can insert" ON merchant_services FOR INSERT WITH CHECK (true);
CREATE POLICY "Services can update" ON merchant_services FOR UPDATE USING (true);

-- ============================================
-- PET BOARDING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS pet_boarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE NOT NULL,
  pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
  owner_name TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  pet_name TEXT,
  pet_type TEXT,
  check_in TIMESTAMPTZ NOT NULL,
  check_out TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE pet_boarding ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Pet boarding can view all" ON pet_boarding FOR SELECT USING (true);
CREATE POLICY "Pet boarding can insert" ON pet_boarding FOR INSERT WITH CHECK (true);
CREATE POLICY "Pet boarding can update" ON pet_boarding FOR UPDATE USING (true);

-- ============================================
-- MERCHANT AUTH TABLE (for merchant login)
-- ============================================
CREATE TABLE IF NOT EXISTS merchant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'staff' CHECK (role IN ('owner', 'staff')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE merchant_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Merchant users can view all" ON merchant_users FOR SELECT USING (true);
CREATE POLICY "Merchant users can insert" ON merchant_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Merchant users can update" ON merchant_users FOR UPDATE USING (true);

-- ============================================
-- SEED DATA: PAWS AND PURRS
-- ============================================

-- Insert Paws and Purrs Merchant
INSERT INTO merchants (
  name,
  type,
  address,
  phone,
  email,
  instagram,
  description,
  status
) VALUES (
  'Paws and Purrs Pet Hotel',
  'pet_hotel',
  'The Scott Garden, Jln Klang Lama, Kuala Lumpur',
  '012-591 1941',
  'info@pawsandpurrs.my',
  '@pawsandpurrshotel',
  'Premium cat and dog boarding facility in Kuala Lumpur. Professional pet care with love and attention.',
  'active'
) ON CONFLICT DO NOTHING;

-- Insert merchant user for Paws and Purrs
-- Email: pawsandpurrs@merchant.com | Password: petpass911
INSERT INTO merchant_users (
  merchant_id,
  email,
  password_hash,
  name,
  role
)
SELECT 
  id,
  'pawsandpurrs@merchant.com',
  '$2a$10$demo_hash_for_petpass911',
  'Paws and Purrs Admin',
  'owner'
FROM merchants 
WHERE name = 'Paws and Purrs Pet Hotel'
ON CONFLICT DO NOTHING;

-- Insert sample services for Paws and Purrs
INSERT INTO merchant_services (merchant_id, service_name, price, duration_minutes, description)
SELECT 
  id,
  service_name,
  price,
  duration,
  description
FROM merchants
CROSS JOIN (
  VALUES
  ('Cat Boarding (Per Day)', 50.00, 1440, 'Daily cat boarding including food and litter'),
  ('Dog Boarding (Per Day)', 70.00, 1440, 'Daily dog boarding including food and walks'),
  ('Cat Grooming', 60.00, 90, 'Full cat grooming service - bath, trim, nail clip'),
  ('Dog Grooming (Small)', 80.00, 120, 'Full dog grooming for dogs under 15kg'),
  ('Dog Grooming (Large)', 120.00, 150, 'Full dog grooming for dogs over 15kg'),
  ('Pet Taxi', 30.00, 60, 'Pickup and drop-off service within KL area')
) AS t(service_name, price, duration, description)
WHERE name = 'Paws and Purrs Pet Hotel'
ON CONFLICT DO NOTHING;

-- ============================================
-- VIEW: Merchant Dashboard Stats
-- ============================================
CREATE OR REPLACE VIEW merchant_dashboard_stats AS
SELECT 
  m.id as merchant_id,
  m.name as merchant_name,
  COUNT(pb.id) as total_bookings,
  COUNT(CASE WHEN pb.status = 'checked_in' THEN 1 END) as active_boardings,
  COUNT(CASE WHEN pb.status IN ('pending', 'confirmed') AND pb.check_in > NOW() THEN 1 END) as upcoming_checkins,
  COUNT(DISTINCT pb.pet_id) as unique_pets_served
FROM merchants m
LEFT JOIN pet_boarding pb ON pb.merchant_id = m.id
GROUP BY m.id, m.name;
