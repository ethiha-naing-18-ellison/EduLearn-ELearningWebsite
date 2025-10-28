-- ===========================================
-- TEST ASSIGNMENTS TABLE SCRIPT
-- This script tests if the Assignments table exists and is working
-- ===========================================

-- Connect to ELearning database
\c ELearning;

-- Check if Assignments table exists
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'Assignments' 
ORDER BY ordinal_position;

-- Check if Submissions table exists
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'Submissions' 
ORDER BY ordinal_position;

-- Test inserting a sample assignment
INSERT INTO "Assignments" (
    "Title", 
    "Description", 
    "Instructions", 
    "MaxPoints", 
    "DueDate", 
    "AllowLateSubmission", 
    "LatePenaltyPercentage", 
    "Type", 
    "CourseId"
) VALUES (
    'Test Assignment',
    'This is a test assignment to verify the table works',
    'Complete this test assignment to verify everything is working',
    100.00,
    NOW() + INTERVAL '7 days',
    true,
    10,
    'Essay',
    1
) RETURNING "Id", "Title", "CreatedAt";

-- Check if the assignment was inserted
SELECT COUNT(*) as assignment_count FROM "Assignments";

-- Clean up test data
DELETE FROM "Assignments" WHERE "Title" = 'Test Assignment';

-- Final verification
SELECT 'Assignments table is working correctly!' as Status;
