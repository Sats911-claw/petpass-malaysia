-- Add SSM number and years operation to vet_clinics
ALTER TABLE vet_clinics ADD COLUMN IF NOT EXISTS ssm_number TEXT;
ALTER TABLE vet_clinics ADD COLUMN IF NOT EXISTS years_operation INTEGER;
