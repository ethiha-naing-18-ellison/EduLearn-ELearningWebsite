-- ===========================================
-- QUICK ASSIGNMENTS TABLE SETUP
-- Run this if you just need the Assignments table quickly
-- ===========================================

-- Connect to ELearning database


-- Drop existing tables if they exist
DROP TABLE IF EXISTS "Submissions" CASCADE;
DROP TABLE IF EXISTS "Assignments" CASCADE;

-- Create Assignments table
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

-- Create Submissions table
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

-- Create indexes
CREATE INDEX "IX_Assignments_CourseId" ON "Assignments"("CourseId");
CREATE INDEX "IX_Assignments_DueDate" ON "Assignments"("DueDate");
CREATE INDEX "IX_Assignments_Type" ON "Assignments"("Type");
CREATE INDEX "IX_Submissions_UserId" ON "Submissions"("UserId");
CREATE INDEX "IX_Submissions_AssignmentId" ON "Submissions"("AssignmentId");

-- Success message
SELECT 'Assignments table created successfully!' as Status;
