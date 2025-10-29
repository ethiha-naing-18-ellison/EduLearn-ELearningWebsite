-- ===========================================
-- CREATE MULTIPLE CHOICE STRUCTURE SCRIPT
-- This script creates MultipleChoices and MultipleChoiceQuestions tables
-- ===========================================

-- Connect to ELearning database
-- Create extension for UUID generation (if not exists)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';

-- ===========================================
-- STEP 1: DROP EXISTING TABLES IF EXISTS
-- ===========================================
DROP TABLE IF EXISTS "MultipleChoiceQuestions" CASCADE;
DROP TABLE IF EXISTS "MultipleChoices" CASCADE;

-- ===========================================
-- STEP 2: CREATE MULTIPLE CHOICE TABLE (MAIN QUIZ)
-- ===========================================
-- Create MultipleChoices table for quiz collections
CREATE TABLE "MultipleChoices" (
    "Id" SERIAL PRIMARY KEY,
    "CourseId" INTEGER NOT NULL,
    "Title" VARCHAR(255) NOT NULL,
    "Description" TEXT,
    "Instructions" TEXT,
    "TotalPoints" INTEGER NOT NULL DEFAULT 0,
    "TimeLimit" INTEGER, -- Time limit in minutes for entire quiz
    "OrderIndex" INTEGER DEFAULT 1,
    "IsPublished" BOOLEAN DEFAULT true,
    "IsFree" BOOLEAN DEFAULT false,
    "AllowRetake" BOOLEAN DEFAULT true,
    "MaxAttempts" INTEGER DEFAULT 3,
    "PassingScore" INTEGER DEFAULT 70, -- Percentage
    "ShowCorrectAnswers" BOOLEAN DEFAULT true,
    "ShowResultsImmediately" BOOLEAN DEFAULT true,
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY ("CourseId") REFERENCES "Courses"("Id") ON DELETE CASCADE
);

-- ===========================================
-- STEP 3: CREATE MULTIPLE CHOICE QUESTIONS TABLE
-- ===========================================
-- Create MultipleChoiceQuestions table for individual questions within a quiz
CREATE TABLE "MultipleChoiceQuestions" (
    "Id" SERIAL PRIMARY KEY,
    "MultipleChoiceId" INTEGER NOT NULL,
    "QuestionText" TEXT NOT NULL,
    "OptionA" VARCHAR(500) NOT NULL,
    "OptionB" VARCHAR(500) NOT NULL,
    "OptionC" VARCHAR(500),
    "OptionD" VARCHAR(500),
    "CorrectAnswer" CHAR(1) NOT NULL CHECK ("CorrectAnswer" IN ('A', 'B', 'C', 'D')),
    "Explanation" TEXT,
    "Points" INTEGER NOT NULL DEFAULT 1,
    "OrderIndex" INTEGER DEFAULT 1,
    "IsRequired" BOOLEAN DEFAULT true,
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY ("MultipleChoiceId") REFERENCES "MultipleChoices"("Id") ON DELETE CASCADE
);

-- ===========================================
-- STEP 4: CREATE PERFORMANCE INDEXES
-- ===========================================

-- Indexes for MultipleChoices table
CREATE INDEX "IX_MultipleChoices_CourseId" ON "MultipleChoices"("CourseId");
CREATE INDEX "IX_MultipleChoices_OrderIndex" ON "MultipleChoices"("CourseId", "OrderIndex");
CREATE INDEX "IX_MultipleChoices_IsPublished" ON "MultipleChoices"("IsPublished");
CREATE INDEX "IX_MultipleChoices_IsFree" ON "MultipleChoices"("IsFree");
CREATE INDEX "IX_MultipleChoices_CreatedAt" ON "MultipleChoices"("CreatedAt");

-- Indexes for MultipleChoiceQuestions table
CREATE INDEX "IX_MultipleChoiceQuestions_MultipleChoiceId" ON "MultipleChoiceQuestions"("MultipleChoiceId");
CREATE INDEX "IX_MultipleChoiceQuestions_OrderIndex" ON "MultipleChoiceQuestions"("MultipleChoiceId", "OrderIndex");

-- ===========================================
-- STEP 5: CREATE UPDATE TRIGGERS
-- ===========================================

-- Update trigger for MultipleChoices table
CREATE OR REPLACE FUNCTION update_multiplechoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."UpdatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_multiplechoices_updated_at
    BEFORE UPDATE ON "MultipleChoices"
    FOR EACH ROW
    EXECUTE FUNCTION update_multiplechoices_updated_at();

-- Update trigger for MultipleChoiceQuestions table
CREATE OR REPLACE FUNCTION update_multiplechoicequestions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."UpdatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_multiplechoicequestions_updated_at
    BEFORE UPDATE ON "MultipleChoiceQuestions"
    FOR EACH ROW
    EXECUTE FUNCTION update_multiplechoicequestions_updated_at();

-- ===========================================
-- STEP 7: VERIFY CREATION
-- ===========================================

-- Check if tables were created successfully
SELECT 
    'MultipleChoices Table' as Table_Name,
    COUNT(*) as Record_Count
FROM "MultipleChoices"
UNION ALL
SELECT 
    'MultipleChoiceQuestions Table' as Table_Name,
    COUNT(*) as Record_Count
FROM "MultipleChoiceQuestions";

-- Show table information using information_schema
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('MultipleChoices', 'MultipleChoiceQuestions')
ORDER BY table_name, ordinal_position;

-- Show sample quiz data (will be empty since no sample data was inserted)
SELECT 
    mc."Id" as Quiz_Id,
    mc."Title" as Quiz_Title,
    COUNT(mcq."Id") as Question_Count,
    mc."TotalPoints",
    mc."TimeLimit"
FROM "MultipleChoices" mc
LEFT JOIN "MultipleChoiceQuestions" mcq ON mc."Id" = mcq."MultipleChoiceId"
GROUP BY mc."Id", mc."Title", mc."TotalPoints", mc."TimeLimit"
ORDER BY mc."OrderIndex";

-- Show sample questions (will be empty since no sample data was inserted)
SELECT 
    mcq."Id",
    mcq."QuestionText",
    mcq."CorrectAnswer",
    mcq."Points",
    mc."Title" as Quiz_Title
FROM "MultipleChoiceQuestions" mcq
JOIN "MultipleChoices" mc ON mcq."MultipleChoiceId" = mc."Id"
ORDER BY mcq."OrderIndex";

-- ===========================================
-- SUCCESS MESSAGE
-- ===========================================
SELECT 
    '✅ MultipleChoice Structure Created Successfully!' as Status,
    'MultipleChoices and MultipleChoiceQuestions tables are ready for quiz management' as Message,
    'You can now create quizzes with multiple questions through the ManageCourseMaterials page' as Next_Step;
