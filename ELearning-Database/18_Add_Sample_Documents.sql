-- Add Sample Documents for Testing Download Functionality
-- This script adds sample documents to test the PDF download feature

-- Connect to the ELearning database


-- Insert sample documents
INSERT INTO Documents (Title, Description, DocumentFile, FileSize, PageCount, "Order", IsFree, IsPublished, DocumentType, FileFormat, Version, Language, Keywords, Summary, Notes, CourseId, CreatedAt, UpdatedAt) VALUES
('HTML Basics Guide', 'Complete guide to HTML fundamentals and best practices', 'uploads/documents/sample-document.txt', 2048, 5, 1, true, true, 'PDF', 'PDF', '1.0', 'en', 'html, web development, basics', 'A comprehensive guide covering HTML fundamentals', 'This document covers the essential HTML concepts students need to master', 1, NOW(), NOW()),
('CSS Styling Reference', 'Quick reference guide for CSS properties and selectors', 'uploads/documents/sample-document.txt', 1536, 3, 2, false, true, 'PDF', 'PDF', '1.0', 'en', 'css, styling, reference', 'CSS properties and selectors reference', 'Use this as a quick reference while working on CSS projects', 1, NOW(), NOW()),
('JavaScript Cheat Sheet', 'Essential JavaScript concepts and syntax reference', 'uploads/documents/sample-document.txt', 2560, 4, 3, true, true, 'PDF', 'PDF', '1.0', 'en', 'javascript, programming, cheat sheet', 'JavaScript syntax and concepts cheat sheet', 'Keep this handy while learning JavaScript', 1, NOW(), NOW()),
('Python Data Types', 'Comprehensive guide to Python data types and structures', 'uploads/documents/sample-document.txt', 3072, 6, 1, false, true, 'PDF', 'PDF', '1.0', 'en', 'python, data types, programming', 'Python data types and data structures guide', 'Essential reading for Python beginners', 2, NOW(), NOW()),
('Pandas Library Guide', 'Complete guide to using Pandas for data analysis', 'uploads/documents/sample-document.txt', 4096, 8, 2, false, true, 'PDF', 'PDF', '1.0', 'en', 'pandas, data analysis, python', 'Pandas library comprehensive guide', 'Master data manipulation with Pandas', 2, NOW(), NOW()),
('Design Principles Handbook', 'Core design principles for UI/UX designers', 'uploads/documents/sample-document.txt', 1792, 4, 1, false, true, 'PDF', 'PDF', '1.0', 'en', 'design, ui, ux, principles', 'Design principles and best practices', 'Fundamental design principles every designer should know', 3, NOW(), NOW()),
('User Research Methods', 'Complete guide to conducting effective user research', 'uploads/documents/sample-document.txt', 2304, 5, 2, false, true, 'PDF', 'PDF', '1.0', 'en', 'user research, ux, methods', 'User research methodologies and techniques', 'Learn how to conduct meaningful user research', 3, NOW(), NOW()),
('JavaScript Fundamentals', 'Complete JavaScript programming guide', 'uploads/documents/sample-document.txt', 2816, 7, 1, true, true, 'PDF', 'PDF', '1.0', 'en', 'javascript, programming, fundamentals', 'JavaScript programming fundamentals', 'Start your JavaScript journey with this comprehensive guide', 4, NOW(), NOW()),
('Marketing Strategy Template', 'Template for creating effective digital marketing strategies', 'uploads/documents/sample-document.txt', 1280, 3, 1, false, true, 'PDF', 'PDF', '1.0', 'en', 'marketing, strategy, template', 'Digital marketing strategy template', 'Use this template to plan your marketing campaigns', 5, NOW(), NOW());

-- Verify the documents were inserted
SELECT COUNT(*) as DocumentCount FROM Documents;
SELECT Id, Title, DocumentFile, IsFree, CourseId FROM Documents ORDER BY CourseId, "Order";
