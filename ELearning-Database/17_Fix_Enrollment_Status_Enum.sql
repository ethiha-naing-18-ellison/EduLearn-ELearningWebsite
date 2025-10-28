-- Fix EnrollmentStatus enum mapping issue
-- This script updates the Status column in Enrollments table to use string values instead of integer

-- First, let's check the current data
SELECT "Id", "UserId", "CourseId", "Status" FROM "Enrollments" LIMIT 5;

-- Update the Status column to use string values
-- Map integer values to string values:
-- 0 = 'Active'
-- 1 = 'Completed' 
-- 2 = 'Dropped'
-- 3 = 'Suspended'

UPDATE "Enrollments" 
SET "Status" = CASE 
    WHEN "Status" = '0' THEN 'Active'
    WHEN "Status" = '1' THEN 'Completed'
    WHEN "Status" = '2' THEN 'Dropped'
    WHEN "Status" = '3' THEN 'Suspended'
    ELSE "Status"
END
WHERE "Status" IN ('0', '1', '2', '3');

-- Verify the update
SELECT "Id", "UserId", "CourseId", "Status" FROM "Enrollments" LIMIT 5;

-- If the above doesn't work, try this alternative approach:
-- ALTER TABLE "Enrollments" ALTER COLUMN "Status" TYPE text USING "Status"::text;
