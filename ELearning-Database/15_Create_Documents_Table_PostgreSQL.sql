-- ===========================================
-- CREATE DOCUMENTS TABLE SCRIPT
-- This script creates the Documents table for learning document content
-- ===========================================

-- Connect to ELearning database
\c ELearning;

-- Create extension for UUID generation (if not exists)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';

-- ===========================================
-- STEP 1: DROP DOCUMENTS TABLE IF EXISTS
-- ===========================================
DROP TABLE IF EXISTS "Documents" CASCADE;

-- ===========================================
-- STEP 2: CREATE DOCUMENTS TABLE
-- ===========================================
-- Create Documents table for learning document content
CREATE TABLE "Documents" (
    "Id" SERIAL PRIMARY KEY,
    "Title" VARCHAR(200) NOT NULL,
    "Description" TEXT NOT NULL,
    "DocumentUrl" VARCHAR(500), -- For external document URLs
    "DocumentFile" VARCHAR(500), -- For uploaded document files
    "Thumbnail" VARCHAR(500), -- Document thumbnail/preview image
    "FileSize" BIGINT DEFAULT 0, -- File size in bytes
    "PageCount" INTEGER DEFAULT 0, -- Number of pages (for PDFs)
    "Order" INTEGER NOT NULL DEFAULT 0, -- Display order within course
    "IsFree" BOOLEAN NOT NULL DEFAULT false, -- Free or premium content
    "IsPublished" BOOLEAN NOT NULL DEFAULT true, -- Published or draft
    "DocumentType" VARCHAR(20) NOT NULL DEFAULT 'PDF', -- PDF, DOC, DOCX, PPTX, etc.
    "FileFormat" VARCHAR(10) NOT NULL DEFAULT 'PDF', -- File extension
    "Version" VARCHAR(20) DEFAULT '1.0', -- Document version
    "Language" VARCHAR(10) DEFAULT 'en', -- Document language
    "Keywords" TEXT, -- Search keywords/tags
    "Summary" TEXT, -- Document summary
    "Notes" TEXT, -- Instructor notes
    "CourseId" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY ("CourseId") REFERENCES "Courses"("Id") ON DELETE CASCADE
);

-- ===========================================
-- STEP 3: CREATE PERFORMANCE INDEXES
-- ===========================================

-- Indexes for Documents table
CREATE INDEX "IX_Documents_CourseId" ON "Documents"("CourseId");
CREATE INDEX "IX_Documents_Order" ON "Documents"("CourseId", "Order");
CREATE INDEX "IX_Documents_IsPublished" ON "Documents"("IsPublished");
CREATE INDEX "IX_Documents_IsFree" ON "Documents"("IsFree");
CREATE INDEX "IX_Documents_DocumentType" ON "Documents"("DocumentType");
CREATE INDEX "IX_Documents_FileFormat" ON "Documents"("FileFormat");
CREATE INDEX "IX_Documents_CreatedAt" ON "Documents"("CreatedAt");
CREATE INDEX "IX_Documents_Keywords" ON "Documents" USING gin(to_tsvector('english', "Keywords"));

-- ===========================================
-- STEP 4: INSERT SAMPLE DOCUMENT DATA
-- ===========================================

-- Insert sample documents for existing courses
INSERT INTO "Documents" (
    "Title", 
    "Description", 
    "DocumentUrl", 
    "Thumbnail", 
    "FileSize", 
    "PageCount", 
    "Order", 
    "IsFree", 
    "IsPublished", 
    "DocumentType", 
    "FileFormat", 
    "Version", 
    "Language", 
    "Keywords", 
    "Summary", 
    "Notes", 
    "CourseId"
) VALUES
(
    'Web Development Fundamentals Guide',
    'A comprehensive guide covering HTML, CSS, and JavaScript basics',
    'https://example.com/documents/web-dev-fundamentals.pdf',
    'https://via.placeholder.com/200x280?text=Web+Dev+Guide',
    2048576, -- 2MB
    45,
    1,
    true,
    true,
    'PDF',
    'PDF',
    '1.0',
    'en',
    'web development, html, css, javascript, fundamentals',
    'Complete guide to web development basics with examples and exercises',
    'This is the main reference document for the course. Students should read this first.',
    (SELECT "Id" FROM "Courses" ORDER BY "Id" LIMIT 1)
),
(
    'React Component Library',
    'Collection of reusable React components with examples',
    'https://example.com/documents/react-components.docx',
    'https://via.placeholder.com/200x280?text=React+Components',
    1536000, -- 1.5MB
    25,
    2,
    false,
    true,
    'DOCX',
    'DOCX',
    '2.1',
    'en',
    'react, components, library, javascript, frontend',
    'Reusable React components with documentation and examples',
    'Advanced material for students who want to dive deeper into React.',
    (SELECT "Id" FROM "Courses" ORDER BY "Id" LIMIT 1)
),
(
    'Database Design Presentation',
    'PowerPoint presentation on database design principles',
    'https://example.com/documents/db-design.pptx',
    'https://via.placeholder.com/200x280?text=DB+Design+PPT',
    5120000, -- 5MB
    30,
    3,
    true,
    true,
    'PPTX',
    'PPTX',
    '1.5',
    'en',
    'database, design, sql, presentation, architecture',
    'Comprehensive presentation on database design and normalization',
    'Use this presentation for the database design lecture.',
    (SELECT "Id" FROM "Courses" ORDER BY "Id" LIMIT 1)
),
(
    'Python Cheat Sheet',
    'Quick reference guide for Python programming',
    'https://example.com/documents/python-cheatsheet.pdf',
    'https://via.placeholder.com/200x280?text=Python+Cheat+Sheet',
    512000, -- 512KB
    8,
    4,
    true,
    true,
    'PDF',
    'PDF',
    '3.0',
    'en',
    'python, cheat sheet, reference, programming, syntax',
    'Quick reference for Python syntax and common operations',
    'Handy reference for students during coding exercises.',
    (SELECT "Id" FROM "Courses" ORDER BY "Id" LIMIT 1)
);

-- ===========================================
-- STEP 5: VERIFY CREATION
-- ===========================================

-- Check if table was created successfully
SELECT 
    'Documents Table' as Table_Name,
    COUNT(*) as Record_Count
FROM "Documents";

-- Show table structure
\d "Documents";

-- Show sample data
SELECT 
    "Id", 
    "Title", 
    "DocumentType", 
    "FileFormat", 
    "FileSize", 
    "PageCount", 
    "IsFree", 
    "CourseId"
FROM "Documents" 
ORDER BY "Order";

-- ===========================================
-- SUCCESS MESSAGE
-- ===========================================
SELECT 
    '✅ Documents Table Created Successfully!' as Status,
    'Documents table is ready for learning document content' as Message,
    'You can now create documents through the ManageCourseMaterials page' as Next_Step;
