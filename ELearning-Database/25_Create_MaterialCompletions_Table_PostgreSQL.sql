-- ===========================================
-- CREATE MATERIAL COMPLETIONS TABLE
-- This script creates MaterialCompletions table to track individual material completion
-- ===========================================

-- Connect to ELearning database
-- Set timezone
SET timezone = 'UTC';

-- ===========================================
-- STEP 1: DROP EXISTING TABLE IF EXISTS
-- ===========================================
DROP TABLE IF EXISTS "MaterialCompletions" CASCADE;

-- ===========================================
-- STEP 2: CREATE MATERIAL COMPLETIONS TABLE
-- ===========================================
CREATE TABLE "MaterialCompletions" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" INTEGER NOT NULL,
    "CourseId" INTEGER NOT NULL,
    "MaterialType" VARCHAR(50) NOT NULL, -- 'lesson', 'video', 'document', 'quiz', 'assignment'
    "MaterialId" INTEGER NOT NULL, -- ID of the specific material
    "IsCompleted" BOOLEAN NOT NULL DEFAULT false,
    "CompletedAt" TIMESTAMP WITH TIME ZONE,
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE,
    FOREIGN KEY ("CourseId") REFERENCES "Courses"("Id") ON DELETE CASCADE,
    UNIQUE ("UserId", "CourseId", "MaterialType", "MaterialId")
);

-- ===========================================
-- STEP 3: CREATE PERFORMANCE INDEXES
-- ===========================================
CREATE INDEX "IX_MaterialCompletions_UserId" ON "MaterialCompletions"("UserId");
CREATE INDEX "IX_MaterialCompletions_CourseId" ON "MaterialCompletions"("CourseId");
CREATE INDEX "IX_MaterialCompletions_UserAndCourse" ON "MaterialCompletions"("UserId", "CourseId");
CREATE INDEX "IX_MaterialCompletions_Material" ON "MaterialCompletions"("MaterialType", "MaterialId");
CREATE INDEX "IX_MaterialCompletions_IsCompleted" ON "MaterialCompletions"("IsCompleted");

-- ===========================================
-- STEP 4: CREATE UPDATE TRIGGER
-- ===========================================
CREATE OR REPLACE FUNCTION update_materialcompletions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."UpdatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_materialcompletions_updated_at
    BEFORE UPDATE ON "MaterialCompletions"
    FOR EACH ROW
    EXECUTE FUNCTION update_materialcompletions_updated_at();

-- ===========================================
-- STEP 5: VERIFY CREATION
-- ===========================================
SELECT 
    'MaterialCompletions Table' as Table_Name,
    COUNT(*) as Record_Count
FROM "MaterialCompletions";

-- Show table information
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'MaterialCompletions'
ORDER BY ordinal_position;

-- ===========================================
-- SUCCESS MESSAGE
-- ===========================================
SELECT 
    '✅ MaterialCompletions Table Created Successfully!' as Status,
    'Material completion tracking is now available' as Message,
    'Backend API can now track and retrieve material completion status' as Next_Step;

