-- ===========================================
-- ADD THREE INSTRUCTOR NAMES COLUMNS TO COURSES TABLE
-- This script adds three instructor name columns for certificates
-- ===========================================

-- Connect to ELearning database
-- Set timezone
SET timezone = 'UTC';

-- ===========================================
-- STEP 1: ADD THREE INSTRUCTOR NAME COLUMNS
-- ===========================================
ALTER TABLE "Courses" 
ADD COLUMN IF NOT EXISTS "CertificateInstructorName1" VARCHAR(200),
ADD COLUMN IF NOT EXISTS "CertificateInstructorName2" VARCHAR(200),
ADD COLUMN IF NOT EXISTS "CertificateInstructorName3" VARCHAR(200);

-- ===========================================
-- STEP 2: MIGRATE EXISTING DATA (if any)
-- ===========================================
-- Move existing CertificateInstructorName to CertificateInstructorName1
UPDATE "Courses"
SET "CertificateInstructorName1" = "CertificateInstructorName"
WHERE "CertificateInstructorName" IS NOT NULL 
  AND "CertificateInstructorName1" IS NULL;

-- ===========================================
-- STEP 3: ADD COMMENTS
-- ===========================================
COMMENT ON COLUMN "Courses"."CertificateInstructorName1" IS 'First instructor name for certificate (Thiha Naing)';
COMMENT ON COLUMN "Courses"."CertificateInstructorName2" IS 'Second instructor name for certificate (Nay Myo Khine)';
COMMENT ON COLUMN "Courses"."CertificateInstructorName3" IS 'Third instructor name for certificate (Min Thiha)';

-- ===========================================
-- COMPLETION MESSAGE
-- ===========================================
SELECT 'Three instructor name columns added successfully to Courses table' AS message;

