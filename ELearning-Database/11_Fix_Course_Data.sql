-- ===========================================
-- FIX COURSE DATA SCRIPT
-- This script checks existing courses and creates sample data if needed
-- ===========================================

-- Connect to ELearning database
\c ELearning;

-- Check what courses exist
SELECT 'Existing Courses:' as Info;
SELECT "Id", "Title", "InstructorId", "Status" FROM "Courses" ORDER BY "Id";

-- Check what users exist (instructors)
SELECT 'Existing Users:' as Info;
SELECT "Id", "Email", "FirstName", "LastName", "Role" FROM "Users" WHERE "Role" = 'Instructor' ORDER BY "Id";

-- Check what categories exist
SELECT 'Existing Categories:' as Info;
SELECT "Id", "Name" FROM "Categories" ORDER BY "Id";

-- If no courses exist, create some sample data
DO $$
DECLARE
    instructor_id INTEGER;
    category_id INTEGER;
    course_id INTEGER;
BEGIN
    -- Get or create an instructor
    SELECT "Id" INTO instructor_id FROM "Users" WHERE "Role" = 'Instructor' LIMIT 1;
    
    IF instructor_id IS NULL THEN
        -- Create a sample instructor if none exists
        INSERT INTO "Users" ("Email", "FirstName", "LastName", "PasswordHash", "DateOfBirth", "PhoneNumber", "Address", "Role", "IsActive")
        VALUES ('instructor@test.com', 'Test', 'Instructor', '$2a$11$K8Y1OjvJ8Y1OjvJ8Y1OjvO', '1985-01-01T00:00:00Z', '+1234567890', '123 Test St', 'Instructor', true)
        RETURNING "Id" INTO instructor_id;
        
        RAISE NOTICE 'Created instructor with ID: %', instructor_id;
    ELSE
        RAISE NOTICE 'Using existing instructor with ID: %', instructor_id;
    END IF;
    
    -- Get or create a category
    SELECT "Id" INTO category_id FROM "Categories" LIMIT 1;
    
    IF category_id IS NULL THEN
        -- Create a sample category if none exists
        INSERT INTO "Categories" ("Name", "Description", "Icon", "Color", "IsActive")
        VALUES ('Programming', 'Programming courses', 'code', '#3498db', true)
        RETURNING "Id" INTO category_id;
        
        RAISE NOTICE 'Created category with ID: %', category_id;
    ELSE
        RAISE NOTICE 'Using existing category with ID: %', category_id;
    END IF;
    
    -- Check if we have any courses
    IF NOT EXISTS (SELECT 1 FROM "Courses") THEN
        -- Create a sample course
        INSERT INTO "Courses" (
            "Title", 
            "Description", 
            "Thumbnail", 
            "Price", 
            "IsFree", 
            "Level", 
            "Status", 
            "Duration", 
            "Prerequisites", 
            "LearningOutcomes", 
            "InstructorId", 
            "CategoryId"
        ) VALUES (
            'Test Web Development Course',
            'A comprehensive web development course for beginners',
            'https://via.placeholder.com/300x200?text=Web+Development',
            99.99,
            false,
            'Beginner',
            'Published',
            40,
            'Basic computer skills',
            'Build websites, Learn HTML/CSS/JS, Create responsive designs',
            instructor_id,
            category_id
        ) RETURNING "Id" INTO course_id;
        
        RAISE NOTICE 'Created course with ID: %', course_id;
    ELSE
        -- Get the first existing course
        SELECT "Id" INTO course_id FROM "Courses" ORDER BY "Id" LIMIT 1;
        RAISE NOTICE 'Using existing course with ID: %', course_id;
    END IF;
END $$;

-- Show final course data
SELECT 'Final Course Data:' as Info;
SELECT "Id", "Title", "InstructorId", "Status" FROM "Courses" ORDER BY "Id";

-- Now test creating an assignment with a valid course ID
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
    (SELECT "Id" FROM "Courses" ORDER BY "Id" LIMIT 1)
) RETURNING "Id", "Title", "CourseId", "CreatedAt";

-- Verify the assignment was created
SELECT 'Assignment Created Successfully!' as Status;
SELECT COUNT(*) as assignment_count FROM "Assignments";
