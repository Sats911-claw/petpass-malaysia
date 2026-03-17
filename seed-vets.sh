#!/bin/bash
# VET PORTAL SEED DATA - PetPass Malaysia
# Run this AFTER VET-PORTAL-SETUP.sql has been executed

SUPABASE_URL="https://jwsykevuitxrpbgnoklq.supabase.co"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3c3lrZXZ1aXR4cnBiZ25va2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTgyNDI0OSwiZXhwIjoyMDg3NDAwMjQ5fQ.2XYsqRZUM60vmgysboUQNhwrzBldxzmGIL_XR3uRyBs"

echo "Creating clinics..."

# Clinic 1: 24h Emergency Hospital
CLINIC1=$(curl -s -X POST "$SUPABASE_URL/rest/v1/vet_clinics" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "apikey: $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "name": "PetCare Emergency Hospital",
    "address": "Jalan Bukit Bintang, Kuala Lumpur",
    "area": "Bukit Bintang",
    "phone": "+60 3-2148 9999",
    "email": "info@petcareemergency.my",
    "is_24h": true,
    "emergency_line": "+60 12-345 6789"
  }' | jq -r '.[0].id // .id')

echo "Clinic 1 ID: $CLINIC1"

# Clinic 2: Mont Kiara Vet Centre
CLINIC2=$(curl -s -X POST "$SUPABASE_URL/rest/v1/vet_clinics" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "apikey: $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "name": "Mont Kiara Veterinary Centre",
    "address": "Plaza Mont Kiara, Jalan Kiara, Mont Kiara, KL",
    "area": "Mont Kiara",
    "phone": "+60 3-6203 1788",
    "email": "hello@montkiaravet.my",
    "operating_hours": {"1":"8:00-20:00","2":"8:00-20:00","3":"8:00-20:00","4":"8:00-20:00","5":"8:00-20:00","6":"9:00-18:00","0":"9:00-18:00"}
  }' | jq -r '.[0].id // .id')

echo "Clinic 2 ID: $CLINIC2"

# Clinic 3: Damansara Heights Pet Clinic
CLINIC3=$(curl -s -X POST "$SUPABASE_URL/rest/v1/vet_clinics" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "apikey: $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "name": "Damansara Heights Pet Clinic",
    "address": "Jalan Setia Damai, Damansara Heights, KL",
    "area": "Damansara Heights",
    "phone": "+60 3-2095 1234",
    "email": "care@dhpetclinic.my",
    "operating_hours": {"1":"9:00-19:00","2":"9:00-19:00","3":"9:00-19:00","4":"9:00-19:00","5":"9:00-19:00","6":"9:00-17:00"}
  }' | jq -r '.[0].id // .id')

echo "Clinic 3 ID: $CLINIC3"

echo ""
echo "Creating vets..."

# Vet 1: On Call, Emergency Specialist
curl -s -X POST "$SUPABASE_URL/rest/v1/vets" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "apikey: $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "{
    \"clinic_id\": \"$CLINIC1\",
    \"full_name\": \"Dr. Sarah Ahmad\",
    \"license_number\": \"VET/2015/001234\",
    \"license_expiry\": \"2027-12-31\",
    \"years_in_service\": 12,
    \"bio\": \"Dr. Sarah Ahmad is a certified emergency and critical care specialist with over 12 years of experience in pet emergencies. She leads our 24/7 emergency team and is passionate about providing immediate, life-saving care.\",
    \"specialities\": [\"Emergency & Critical Care\", \"Surgery\", \"Internal Medicine\"],
    \"animal_types\": [\"small\", \"exotic\"],
    \"is_on_call\": true,
    \"on_call_until\": \"2026-03-10T08:00:00Z\",
    \"phone\": \"+60 12-888 9999\",
    \"email\": \"sarah.ahmad@petcareemergency.my\"
  }"

# Vet 2: House Calls, Surgery Specialist
curl -s -X POST "$SUPABASE_URL/rest/v1/vets" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "apikey: $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "{
    \"clinic_id\": \"$CLINIC2\",
    \"full_name\": \"Dr. Michael Chen\",
    \"license_number\": \"VET/2018/005678\",
    \"license_expiry\": \"2026-06-30\",
    \"years_in_service\": 8,
    \"bio\": \"Dr. Michael Chen is a renowned soft tissue surgeon who also offers house call services for pets that are more comfortable at home. He specializes in minimally invasive procedures.\",
    \"specialities\": [\"Surgery\", \"Orthopaedics\", \"Dentistry\"],
    \"animal_types\": [\"small\", \"large\"],
    \"does_house_calls\": true,
    \"house_call_areas\": [\"Mont Kiara\", \"Bangsar\", \"Taman Tun Dr Ismail\", \"Petaling Jaya\"],
    \"phone\": \"+60 17-666 7777\",
    \"email\": \"m.chen@montkiaravet.my\"
  }"

# Vet 3: General Practice, Dermatology
curl -s -X POST "$SUPABASE_URL/rest/v1/vets" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "apikey: $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "{
    \"clinic_id\": \"$CLINIC3\",
    \"full_name\": \"Dr. Nurul Huda\",
    \"license_number\": \"VET/2020/009012\",
    \"license_expiry\": \"2028-03-15\",
    \"years_in_service\": 5,
    \"bio\": \"Dr. Nurul Huda is a dedicated general practitioner with a special interest in dermatology and preventative care. She believes in building lasting relationships with pets and their families.\",
    \"specialities\": [\"Dermatology\", \"General Practice\", \"Internal Medicine\"],
    \"animal_types\": [\"small\", \"avian\", \"exotic\"],
    \"phone\": \"+60 19-555 3333\",
    \"email\": \"nurul@dhpetclinic.my\"
  }"

echo ""
echo "Seed data created successfully!"
echo ""
echo "To verify, visit: $SUPABASE_URL/project/console/table-editor"
