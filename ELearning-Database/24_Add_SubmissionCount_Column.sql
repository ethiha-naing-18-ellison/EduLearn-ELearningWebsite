-- ===========================================
-- ADD SUBMISSIONCOUNT COLUMN
-- This script adds the SubmissionCount column to existing MultipleChoiceAttempts table
-- ===========================================

-- Connect to ELearning database
-- Set timezone
SET timezone = 'UTC';

-- ===========================================
-- STEP 1: ADD SUBMISSIONCOUNT COLUMN IF NOT EXISTS
-- ===========================================
ALTER TABLE "MultipleChoiceAttempts" 
ADD COLUMN IF NOT EXISTS "SubmissionCount" INTEGER NOT NULL DEFAULT 1;

-- Update existing records to have SubmissionCount = 1 (they were the first submission)
UPDATE "MultipleChoiceAttempts" 
SET "SubmissionCount" = 1 
WHERE "SubmissionCount" IS NULL OR "SubmissionCount" = 0;

-- ===========================================
-- STEP 2: ADD UNIQUE CONSTRAINT IF NOT EXISTS
-- ===========================================
-- Ensure one attempt per user per quiz (if constraint doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'MultipleChoiceAttempts_UserId_MultipleChoiceId_key'
    ) THEN
        ALTER TABLE "MultipleChoiceAttempts"
        ADD CONSTRAINT "MultipleChoiceAttempts_UserId_MultipleChoiceId_key" 
        UNIQUE ("UserId", "MultipleChoiceId");
    END IF;
END $$;

-- ===========================================
-- STEP 3: HANDLE DUPLICATES (IF ANY)
-- ===========================================
-- If there are duplicate records, keep only the latest one per user/quiz
DELETE FROM "MultipleChoiceAttempts" a1
WHERE EXISTS (
    SELECT 1 FROM "MultipleChoiceAttempts" a2
    WHERE a2."UserId" = a1."UserId"
    AND a2."MultipleChoiceId" = a1."MultipleChoiceId"
    AND a2."CompletedAt" > a1."CompletedAt"
);

-- Alternative: Keep the one with highest score if same completion time
DELETE FROM "MultipleChoiceAttempts" a1
WHERE EXISTS (
    SELECT 1 FROM "MultipleChoiceAttempts" a2
    WHERE a2."UserId" = a1."UserId"
    AND a2."MultipleChoiceId" = a1."MultipleChoiceId"
    AND a2."CompletedAt" = a1."CompletedAt"
    AND a2."Score" > a1."Score"
    AND a2."Id" > a1."Id"
);

-- ===========================================
-- STEP 4: VERIFY CHANGES
-- ===========================================

-- Check if column was added successfully
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'MultipleChoiceAttempts' 
AND column_name = 'SubmissionCount';

-- Check unique constraint
SELECT 
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint 
WHERE conrelid = 'MultipleChoiceAttempts'::regclass
AND conname LIKE '%UserId%MultipleChoiceId%';

-- Show sample data
SELECT 
    "Id",
    "UserId",
    "MultipleChoiceId",
    "Score",
    "SubmissionCount",
    "CompletedAt"
FROM "MultipleChoiceAttempts"
ORDER BY "CompletedAt" DESC
LIMIT 10;

-- ===========================================
-- SUCCESS MESSAGE
-- ===========================================
SELECT 
    '✅ SubmissionCount column added successfully!' as Status,
    'Unique constraint ensures one record per user per quiz' as Message,
    'Final mark will always be the latest submission' as Next_Step;

