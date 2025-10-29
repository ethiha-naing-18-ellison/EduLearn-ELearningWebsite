-- ===========================================
-- ADD MISSING COLUMNS SCRIPT
-- This script adds the missing QuestionType column to MultipleChoiceQuestions table
-- ===========================================

-- Connect to ELearning database
\c ELearning;

-- Add missing QuestionType column
ALTER TABLE "MultipleChoiceQuestions" 
ADD COLUMN IF NOT EXISTS "QuestionType" VARCHAR(20) NOT NULL DEFAULT 'MultipleChoice';

-- Update existing records to have the default value
UPDATE "MultipleChoiceQuestions" 
SET "QuestionType" = 'MultipleChoice' 
WHERE "QuestionType" IS NULL;

-- ===========================================
-- VERIFY CHANGES
-- ===========================================

-- Check if column was added successfully
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'MultipleChoiceQuestions' 
AND column_name = 'QuestionType';

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'MultipleChoiceQuestions'
ORDER BY ordinal_position;

-- ===========================================
-- SUCCESS MESSAGE
-- ===========================================
SELECT 
    '✅ Missing columns added successfully!' as Status,
    'QuestionType column added to MultipleChoiceQuestions table' as Message,
    'Backend should now work properly' as Next_Step;
