-- ===========================================
-- ADD CERTIFICATE SETTINGS COLUMNS TO COURSES TABLE
-- This script adds certificate-related columns to the Courses table
-- ===========================================

-- Connect to ELearning database
-- Set timezone
SET timezone = 'UTC';

-- ===========================================
-- STEP 1: ADD CERTIFICATE COLUMNS
-- ===========================================
ALTER TABLE "Courses" 
ADD COLUMN IF NOT EXISTS "CertificateInstructorName" VARCHAR(200),
ADD COLUMN IF NOT EXISTS "CertificateSignature" VARCHAR(500);

-- ===========================================
-- STEP 2: ADD COMMENTS
-- ===========================================
COMMENT ON COLUMN "Courses"."CertificateInstructorName" IS 'Name of instructor to display on certificate';
COMMENT ON COLUMN "Courses"."CertificateSignature" IS 'URL/path to instructor signature image for certificate';

-- ===========================================
-- COMPLETION MESSAGE
-- ===========================================
SELECT 'Certificate settings columns added successfully to Courses table' AS message;
