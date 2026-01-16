-- ===========================================
-- CREATE MULTIPLE CHOICE ATTEMPTS TABLE
-- This script creates MultipleChoiceAttempts table to track student quiz attempts
-- ===========================================

-- Connect to ELearning database
-- Set timezone
SET timezone = 'UTC';

-- ===========================================
-- STEP 1: DROP EXISTING TABLE IF EXISTS
-- ===========================================
DROP TABLE IF EXISTS "MultipleChoiceAttempts" CASCADE;

-- ===========================================
-- STEP 2: CREATE MULTIPLE CHOICE ATTEMPTS TABLE
-- ===========================================
-- Create MultipleChoiceAttempts table to track student quiz attempts and scores
CREATE TABLE "MultipleChoiceAttempts" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" INTEGER NOT NULL,
    "MultipleChoiceId" INTEGER NOT NULL,
    "Score" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "TotalPoints" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "Percentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "IsPassed" BOOLEAN NOT NULL DEFAULT false,
    "Answers" TEXT NOT NULL, -- JSON string of user answers: {"questionId": "A", "questionId2": "B"}
    "SubmissionCount" INTEGER NOT NULL DEFAULT 1, -- Track how many times user has submitted (for max attempts)
    "StartedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "CompletedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "TimeSpent" INTEGER DEFAULT 0, -- Time spent in seconds
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE,
    FOREIGN KEY ("MultipleChoiceId") REFERENCES "MultipleChoices"("Id") ON DELETE CASCADE,
    UNIQUE ("UserId", "MultipleChoiceId") -- Ensure one attempt per user per quiz
);

-- ===========================================
-- STEP 3: CREATE PERFORMANCE INDEXES
-- ===========================================

-- Indexes for MultipleChoiceAttempts table
CREATE INDEX "IX_MultipleChoiceAttempts_UserId" ON "MultipleChoiceAttempts"("UserId");
CREATE INDEX "IX_MultipleChoiceAttempts_MultipleChoiceId" ON "MultipleChoiceAttempts"("MultipleChoiceId");
CREATE INDEX "IX_MultipleChoiceAttempts_UserAndQuiz" ON "MultipleChoiceAttempts"("UserId", "MultipleChoiceId");
CREATE INDEX "IX_MultipleChoiceAttempts_CompletedAt" ON "MultipleChoiceAttempts"("CompletedAt");
CREATE INDEX "IX_MultipleChoiceAttempts_IsPassed" ON "MultipleChoiceAttempts"("IsPassed");

-- ===========================================
-- STEP 4: CREATE UPDATE TRIGGER
-- ===========================================

-- Update trigger for MultipleChoiceAttempts table
CREATE OR REPLACE FUNCTION update_multiplechoiceattempts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."UpdatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_multiplechoiceattempts_updated_at
    BEFORE UPDATE ON "MultipleChoiceAttempts"
    FOR EACH ROW
    EXECUTE FUNCTION update_multiplechoiceattempts_updated_at();

-- ===========================================
-- STEP 5: CREATE HELPER VIEW
-- ===========================================

-- View to show quiz attempts with user and quiz information
CREATE OR REPLACE VIEW vw_MultipleChoiceAttempts AS
SELECT 
    mca."Id",
    mca."UserId",
    u."FirstName" || ' ' || u."LastName" AS "StudentName",
    u."Email" AS "StudentEmail",
    mca."MultipleChoiceId",
    mc."Title" AS "QuizTitle",
    mc."CourseId",
    c."Title" AS "CourseTitle",
    mca."Score",
    mca."TotalPoints",
    mca."Percentage",
    mca."IsPassed",
    mca."StartedAt",
    mca."CompletedAt",
    mca."TimeSpent",
    mca."CreatedAt",
    mca."UpdatedAt"
FROM "MultipleChoiceAttempts" mca
INNER JOIN "Users" u ON mca."UserId" = u."Id"
INNER JOIN "MultipleChoices" mc ON mca."MultipleChoiceId" = mc."Id"
INNER JOIN "Courses" c ON mc."CourseId" = c."Id";

-- ===========================================
-- STEP 6: VERIFY CREATION
-- ===========================================

-- Check if table was created successfully
SELECT 
    'MultipleChoiceAttempts Table' as Table_Name,
    COUNT(*) as Record_Count
FROM "MultipleChoiceAttempts";

-- Show table information using information_schema
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'MultipleChoiceAttempts'
ORDER BY ordinal_position;

-- ===========================================
-- SUCCESS MESSAGE
-- ===========================================
SELECT 
    '✅ MultipleChoiceAttempts Table Created Successfully!' as Status,
    'Quiz attempts and scores can now be tracked in the database' as Message,
    'Backend API can now save and retrieve quiz attempts' as Next_Step;

