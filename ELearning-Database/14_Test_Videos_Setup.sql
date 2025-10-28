-- ===========================================
-- TEST VIDEOS SETUP SCRIPT
-- This script tests the Videos table setup and functionality
-- ===========================================

-- Connect to ELearning database
\c ELearning;

-- ===========================================
-- STEP 1: CHECK VIDEOS TABLE EXISTS
-- ===========================================
SELECT 
    'Videos Table Check' as Test,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Videos') 
        THEN '✅ Videos table exists' 
        ELSE '❌ Videos table does not exist' 
    END as Result;

-- ===========================================
-- STEP 2: CHECK VIDEOS TABLE STRUCTURE
-- ===========================================
SELECT 
    'Videos Table Structure' as Test,
    COUNT(*) as Column_Count
FROM information_schema.columns 
WHERE table_name = 'Videos';

-- Show table structure
\d "Videos";

-- ===========================================
-- STEP 3: CHECK SAMPLE DATA
-- ===========================================
SELECT 
    'Sample Videos Data' as Test,
    COUNT(*) as Video_Count
FROM "Videos";

-- Show sample videos
SELECT 
    "Id", 
    "Title", 
    "VideoType", 
    "Quality", 
    "Duration", 
    "IsFree", 
    "IsPublished",
    "CourseId"
FROM "Videos" 
ORDER BY "Order";

-- ===========================================
-- STEP 4: CHECK FOREIGN KEY RELATIONSHIPS
-- ===========================================
SELECT 
    'Foreign Key Check' as Test,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM "Videos" v 
            JOIN "Courses" c ON v."CourseId" = c."Id"
        ) 
        THEN '✅ Foreign key relationships working' 
        ELSE '❌ Foreign key relationships broken' 
    END as Result;

-- ===========================================
-- STEP 5: TEST VIDEO CREATION
-- ===========================================
-- Insert a test video
INSERT INTO "Videos" (
    "Title", 
    "Description", 
    "VideoUrl", 
    "Thumbnail", 
    "Duration", 
    "Order", 
    "IsFree", 
    "IsPublished", 
    "VideoType", 
    "Quality", 
    "CourseId"
) VALUES (
    'Test Video Creation',
    'This is a test video to verify the setup',
    'https://www.youtube.com/watch?v=test123',
    'https://via.placeholder.com/320x180?text=Test+Video',
    120, -- 2 minutes
    99, -- High order number
    true,
    true,
    'YouTube',
    'HD',
    (SELECT "Id" FROM "Courses" ORDER BY "Id" LIMIT 1)
);

-- Check if test video was created
SELECT 
    'Test Video Creation' as Test,
    CASE 
        WHEN EXISTS (SELECT 1 FROM "Videos" WHERE "Title" = 'Test Video Creation') 
        THEN '✅ Test video created successfully' 
        ELSE '❌ Test video creation failed' 
    END as Result;

-- Clean up test video
DELETE FROM "Videos" WHERE "Title" = 'Test Video Creation';

-- ===========================================
-- SUCCESS MESSAGE
-- ===========================================
SELECT 
    '🎉 Videos Setup Complete!' as Status,
    'Videos table is ready for use' as Message,
    'You can now create videos through the ManageCourseMaterials page' as Next_Step;
