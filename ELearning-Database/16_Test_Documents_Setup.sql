-- ===========================================
-- TEST DOCUMENTS SETUP SCRIPT
-- This script tests the Documents table setup and functionality
-- ===========================================

-- Connect to ELearning database
\c ELearning;

-- ===========================================
-- STEP 1: CHECK DOCUMENTS TABLE EXISTS
-- ===========================================
SELECT 
    'Documents Table Check' as Test,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Documents') 
        THEN '✅ Documents table exists' 
        ELSE '❌ Documents table does not exist' 
    END as Result;

-- ===========================================
-- STEP 2: CHECK DOCUMENTS TABLE STRUCTURE
-- ===========================================
SELECT 
    'Documents Table Structure' as Test,
    COUNT(*) as Column_Count
FROM information_schema.columns 
WHERE table_name = 'Documents';

-- Show table structure
\d "Documents";

-- ===========================================
-- STEP 3: CHECK SAMPLE DATA
-- ===========================================
SELECT 
    'Sample Documents Data' as Test,
    COUNT(*) as Document_Count
FROM "Documents";

-- Show sample documents
SELECT 
    "Id", 
    "Title", 
    "DocumentType", 
    "FileFormat", 
    "FileSize", 
    "PageCount", 
    "IsFree", 
    "IsPublished",
    "CourseId"
FROM "Documents" 
ORDER BY "Order";

-- ===========================================
-- STEP 4: CHECK FOREIGN KEY RELATIONSHIPS
-- ===========================================
SELECT 
    'Foreign Key Check' as Test,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM "Documents" d 
            JOIN "Courses" c ON d."CourseId" = c."Id"
        ) 
        THEN '✅ Foreign key relationships working' 
        ELSE '❌ Foreign key relationships broken' 
    END as Result;

-- ===========================================
-- STEP 5: TEST DOCUMENT CREATION
-- ===========================================
-- Insert a test document
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
    "CourseId"
) VALUES (
    'Test Document Creation',
    'This is a test document to verify the setup',
    'https://example.com/documents/test-document.pdf',
    'https://via.placeholder.com/200x280?text=Test+Document',
    1024000, -- 1MB
    10,
    99, -- High order number
    true,
    true,
    'PDF',
    'PDF',
    '1.0',
    'en',
    'test, document, verification',
    'Test document for verification purposes',
    (SELECT "Id" FROM "Courses" ORDER BY "Id" LIMIT 1)
);

-- Check if test document was created
SELECT 
    'Test Document Creation' as Test,
    CASE 
        WHEN EXISTS (SELECT 1 FROM "Documents" WHERE "Title" = 'Test Document Creation') 
        THEN '✅ Test document created successfully' 
        ELSE '❌ Test document creation failed' 
    END as Result;

-- Clean up test document
DELETE FROM "Documents" WHERE "Title" = 'Test Document Creation';

-- ===========================================
-- STEP 6: TEST FILE FORMAT SUPPORT
-- ===========================================
-- Test different document types
INSERT INTO "Documents" (
    "Title", 
    "Description", 
    "DocumentType", 
    "FileFormat", 
    "FileSize", 
    "IsFree", 
    "IsPublished", 
    "CourseId"
) VALUES 
('Word Document', 'Test Word document', 'DOCX', 'DOCX', 512000, true, true, (SELECT "Id" FROM "Courses" ORDER BY "Id" LIMIT 1)),
('PowerPoint Presentation', 'Test PowerPoint presentation', 'PPTX', 'PPTX', 2048000, true, true, (SELECT "Id" FROM "Courses" ORDER BY "Id" LIMIT 1)),
('Excel Spreadsheet', 'Test Excel spreadsheet', 'XLSX', 'XLSX', 256000, true, true, (SELECT "Id" FROM "Courses" ORDER BY "Id" LIMIT 1));

-- Check document types
SELECT 
    'Document Types Test' as Test,
    COUNT(DISTINCT "DocumentType") as Supported_Types,
    STRING_AGG(DISTINCT "DocumentType", ', ') as Types_List
FROM "Documents";

-- Clean up test documents
DELETE FROM "Documents" WHERE "Title" IN ('Word Document', 'PowerPoint Presentation', 'Excel Spreadsheet');

-- ===========================================
-- SUCCESS MESSAGE
-- ===========================================
SELECT 
    '🎉 Documents Setup Complete!' as Status,
    'Documents table is ready for use' as Message,
    'You can now create documents through the ManageCourseMaterials page' as Next_Step;
