-- ===========================================
-- CHECK DATABASE STATUS SCRIPT
-- This script shows what data exists in your database
-- ===========================================

-- Connect to ELearning database
\c ELearning;

-- Check all tables and their record counts
SELECT 'Database Status:' as Info;

SELECT 
    'Users' as table_name,
    COUNT(*) as record_count
FROM "Users"
UNION ALL
SELECT 
    'Categories' as table_name,
    COUNT(*) as record_count
FROM "Categories"
UNION ALL
SELECT 
    'Courses' as table_name,
    COUNT(*) as record_count
FROM "Courses"
UNION ALL
SELECT 
    'Lessons' as table_name,
    COUNT(*) as record_count
FROM "Lessons"
UNION ALL
SELECT 
    'Assignments' as table_name,
    COUNT(*) as record_count
FROM "Assignments"
UNION ALL
SELECT 
    'Submissions' as table_name,
    COUNT(*) as record_count
FROM "Submissions"
UNION ALL
SELECT 
    'Quizzes' as table_name,
    COUNT(*) as record_count
FROM "Quizzes"
UNION ALL
SELECT 
    'Enrollments' as table_name,
    COUNT(*) as record_count
FROM "Enrollments";

-- Show detailed course information
SELECT 'Course Details:' as Info;
SELECT 
    "Id",
    "Title",
    "InstructorId",
    "Status",
    "CreatedAt"
FROM "Courses" 
ORDER BY "Id";

-- Show instructor information
SELECT 'Instructor Details:' as Info;
SELECT 
    "Id",
    "Email",
    "FirstName",
    "LastName",
    "Role"
FROM "Users" 
WHERE "Role" = 'Instructor'
ORDER BY "Id";

-- Show category information
SELECT 'Category Details:' as Info;
SELECT 
    "Id",
    "Name",
    "Description"
FROM "Categories" 
ORDER BY "Id";
