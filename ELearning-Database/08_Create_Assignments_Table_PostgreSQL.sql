-- ===========================================
-- CREATE ASSIGNMENTS TABLE SCRIPT
-- This script specifically creates the Assignments table
-- and ensures it's properly set up for the E-Learning platform
-- ===========================================

-- Connect to ELearning database
\c ELearning;

-- Create extension for UUID generation (if not exists)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';

-- ===========================================
-- STEP 1: DROP ASSIGNMENTS TABLE IF EXISTS
-- ===========================================
-- Drop in correct order to handle foreign key constraints
DROP TABLE IF EXISTS "Submissions" CASCADE;
DROP TABLE IF EXISTS "Assignments" CASCADE;

-- ===========================================
-- STEP 2: CREATE ASSIGNMENTS TABLE
-- ===========================================
-- Create Assignments table (matches Assignment.cs exactly)
CREATE TABLE "Assignments" (
    "Id" SERIAL PRIMARY KEY,
    "Title" VARCHAR(200) NOT NULL,
    "Description" TEXT NOT NULL,
    "Instructions" TEXT,
    "MaxPoints" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "DueDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "AllowLateSubmission" BOOLEAN NOT NULL DEFAULT false,
    "LatePenaltyPercentage" INTEGER NOT NULL DEFAULT 0,
    "Type" VARCHAR(20) NOT NULL DEFAULT 'Essay',
    "CourseId" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY ("CourseId") REFERENCES "Courses"("Id") ON DELETE CASCADE
);

-- ===========================================
-- STEP 3: CREATE SUBMISSIONS TABLE
-- ===========================================
-- Create Submissions table (matches Submission.cs exactly)
CREATE TABLE "Submissions" (
    "Id" SERIAL PRIMARY KEY,
    "Content" TEXT NOT NULL,
    "FileUrl" VARCHAR(500),
    "Score" DECIMAL(5,2),
    "Feedback" TEXT,
    "SubmittedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "GradedAt" TIMESTAMP WITH TIME ZONE,
    "IsLate" BOOLEAN NOT NULL DEFAULT false,
    "Status" VARCHAR(20) NOT NULL DEFAULT 'Submitted',
    "UserId" INTEGER NOT NULL,
    "AssignmentId" INTEGER NOT NULL,
    
    FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE,
    FOREIGN KEY ("AssignmentId") REFERENCES "Assignments"("Id") ON DELETE CASCADE
);

-- ===========================================
-- STEP 4: CREATE PERFORMANCE INDEXES
-- ===========================================

-- Indexes for Assignments table
CREATE INDEX "IX_Assignments_CourseId" ON "Assignments"("CourseId");
CREATE INDEX "IX_Assignments_DueDate" ON "Assignments"("DueDate");
CREATE INDEX "IX_Assignments_Type" ON "Assignments"("Type");
CREATE INDEX "IX_Assignments_CreatedAt" ON "Assignments"("CreatedAt");

-- Indexes for Submissions table
CREATE INDEX "IX_Submissions_UserId" ON "Submissions"("UserId");
CREATE INDEX "IX_Submissions_AssignmentId" ON "Submissions"("AssignmentId");
CREATE INDEX "IX_Submissions_Status" ON "Submissions"("Status");
CREATE INDEX "IX_Submissions_SubmittedAt" ON "Submissions"("SubmittedAt");
CREATE INDEX "IX_Submissions_IsLate" ON "Submissions"("IsLate");

-- ===========================================
-- STEP 5: INSERT SAMPLE ASSIGNMENT DATA
-- ===========================================

-- Insert sample assignments for existing courses
-- First, let's check if we have courses to assign assignments to
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
) VALUES
(
    'HTML Portfolio Project',
    'Create a personal portfolio website using HTML and CSS',
    'Build a responsive portfolio website with at least 3 pages: Home, About, and Contact. Include proper HTML structure, CSS styling, and make it mobile-friendly.',
    100.00,
    NOW() + INTERVAL '14 days',
    true,
    10,
    'FileUpload',
    (SELECT "Id" FROM "Courses" WHERE "Title" LIKE '%Web Development%' LIMIT 1)
),
(
    'JavaScript Calculator',
    'Build a functional calculator using JavaScript',
    'Create a calculator that can perform basic arithmetic operations (add, subtract, multiply, divide). Include proper error handling and a clean user interface.',
    85.00,
    NOW() + INTERVAL '10 days',
    false,
    0,
    'CodeSubmission',
    (SELECT "Id" FROM "Courses" WHERE "Title" LIKE '%JavaScript%' LIMIT 1)
),
(
    'Python Data Analysis Report',
    'Analyze a dataset and write a comprehensive report',
    'Choose a dataset from Kaggle or another source, perform exploratory data analysis, create visualizations, and write a detailed report of your findings.',
    120.00,
    NOW() + INTERVAL '21 days',
    true,
    15,
    'FileUpload',
    (SELECT "Id" FROM "Courses" WHERE "Title" LIKE '%Python%' OR "Title" LIKE '%Data Science%' LIMIT 1)
),
(
    'UI/UX Design Critique',
    'Critique and redesign an existing website',
    'Choose a website with poor UX design, analyze its problems, and create a redesigned version with improved user experience. Include wireframes and mockups.',
    90.00,
    NOW() + INTERVAL '12 days',
    true,
    5,
    'Presentation',
    (SELECT "Id" FROM "Courses" WHERE "Title" LIKE '%Design%' LIMIT 1)
);

-- ===========================================
-- STEP 6: VERIFY CREATION
-- ===========================================

-- Check if tables were created successfully
SELECT 
    'Assignments Table' as Table_Name,
    COUNT(*) as Record_Count
FROM "Assignments"
UNION ALL
SELECT 
    'Submissions Table' as Table_Name,
    COUNT(*) as Record_Count
FROM "Submissions";

-- Show table structure
\d "Assignments";
\d "Submissions";

-- ===========================================
-- SUCCESS MESSAGE
-- ===========================================
SELECT 
    '✅ Assignments Table Created Successfully!' as Status,
    'Assignments and Submissions tables are ready for use' as Message,
    'You can now create assignments through the ManageCourseMaterials page' as Next_Step;
