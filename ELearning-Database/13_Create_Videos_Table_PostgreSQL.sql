-- ===========================================
-- CREATE VIDEOS TABLE SCRIPT
-- This script creates the Videos table for learning video content
-- ===========================================

-- Connect to ELearning database
\c ELearning;

-- Create extension for UUID generation (if not exists)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';

-- ===========================================
-- STEP 1: DROP VIDEOS TABLE IF EXISTS
-- ===========================================
DROP TABLE IF EXISTS "Videos" CASCADE;

-- ===========================================
-- STEP 2: CREATE VIDEOS TABLE
-- ===========================================
-- Create Videos table for learning video content
CREATE TABLE "Videos" (
    "Id" SERIAL PRIMARY KEY,
    "Title" VARCHAR(200) NOT NULL,
    "Description" TEXT NOT NULL,
    "VideoUrl" VARCHAR(500), -- For external video URLs (YouTube, Vimeo, etc.)
    "VideoFile" VARCHAR(500), -- For uploaded video files
    "Thumbnail" VARCHAR(500), -- Video thumbnail image
    "Duration" INTEGER NOT NULL DEFAULT 0, -- Duration in seconds
    "Order" INTEGER NOT NULL DEFAULT 0, -- Display order within course
    "IsFree" BOOLEAN NOT NULL DEFAULT false, -- Free or premium content
    "IsPublished" BOOLEAN NOT NULL DEFAULT true, -- Published or draft
    "VideoType" VARCHAR(20) NOT NULL DEFAULT 'Upload', -- Upload, YouTube, Vimeo, etc.
    "Quality" VARCHAR(10) NOT NULL DEFAULT 'HD', -- HD, SD, 4K, etc.
    "Transcript" TEXT, -- Video transcript/subtitles
    "Notes" TEXT, -- Instructor notes
    "CourseId" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY ("CourseId") REFERENCES "Courses"("Id") ON DELETE CASCADE
);

-- ===========================================
-- STEP 3: CREATE PERFORMANCE INDEXES
-- ===========================================

-- Indexes for Videos table
CREATE INDEX "IX_Videos_CourseId" ON "Videos"("CourseId");
CREATE INDEX "IX_Videos_Order" ON "Videos"("CourseId", "Order");
CREATE INDEX "IX_Videos_IsPublished" ON "Videos"("IsPublished");
CREATE INDEX "IX_Videos_IsFree" ON "Videos"("IsFree");
CREATE INDEX "IX_Videos_VideoType" ON "Videos"("VideoType");
CREATE INDEX "IX_Videos_CreatedAt" ON "Videos"("CreatedAt");

-- ===========================================
-- STEP 4: INSERT SAMPLE VIDEO DATA
-- ===========================================

-- Insert sample videos for existing courses
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
    "Transcript", 
    "Notes", 
    "CourseId"
) VALUES
(
    'Introduction to Web Development',
    'Learn the basics of web development and understand how websites work',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://via.placeholder.com/320x180?text=Web+Dev+Intro',
    300, -- 5 minutes
    1,
    true,
    true,
    'YouTube',
    'HD',
    'Welcome to our web development course. In this video, we will cover the fundamentals...',
    'This is the introductory video for the course. Make sure students understand the basics.',
    (SELECT "Id" FROM "Courses" ORDER BY "Id" LIMIT 1)
),
(
    'HTML Fundamentals',
    'Master the building blocks of web pages with HTML',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://via.placeholder.com/320x180?text=HTML+Basics',
    600, -- 10 minutes
    2,
    true,
    true,
    'YouTube',
    'HD',
    'HTML stands for HyperText Markup Language. It is the standard markup language...',
    'Focus on semantic HTML and proper structure.',
    (SELECT "Id" FROM "Courses" ORDER BY "Id" LIMIT 1)
),
(
    'CSS Styling Techniques',
    'Learn how to style your web pages with CSS',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://via.placeholder.com/320x180?text=CSS+Styling',
    900, -- 15 minutes
    3,
    false,
    true,
    'YouTube',
    'HD',
    'CSS allows you to control the appearance of your web pages. We will cover...',
    'Show practical examples and best practices.',
    (SELECT "Id" FROM "Courses" ORDER BY "Id" LIMIT 1)
);

-- ===========================================
-- STEP 5: VERIFY CREATION
-- ===========================================

-- Check if table was created successfully
SELECT 
    'Videos Table' as Table_Name,
    COUNT(*) as Record_Count
FROM "Videos";

-- Show table structure
\d "Videos";

-- Show sample data
SELECT 
    "Id", 
    "Title", 
    "Duration", 
    "IsFree", 
    "VideoType", 
    "CourseId"
FROM "Videos" 
ORDER BY "Order";

-- ===========================================
-- SUCCESS MESSAGE
-- ===========================================
SELECT 
    '✅ Videos Table Created Successfully!' as Status,
    'Videos table is ready for learning video content' as Message,
    'You can now create videos through the ManageCourseMaterials page' as Next_Step;
