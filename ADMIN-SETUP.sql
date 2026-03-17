-- ============================================================
-- PetPass Admin Users & Audit Log
-- Run this in Supabase SQL Editor
-- ============================================================

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'editor' CHECK (role IN ('superadmin', 'editor', 'viewer')),
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Audit log table
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_username TEXT NOT NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: allow anon to read/write (internal tool, protected by admin login)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on admin_users" ON admin_users;
CREATE POLICY "Allow all on admin_users" ON admin_users FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on admin_audit_log" ON admin_audit_log;
CREATE POLICY "Allow all on admin_audit_log" ON admin_audit_log FOR ALL USING (true) WITH CHECK (true);
