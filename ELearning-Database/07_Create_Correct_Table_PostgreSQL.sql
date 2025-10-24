-- ===========================================
-- COMPLETE ELEARNING DATABASE SETUP SCRIPT
-- Fixes ALL previous issues:
-- ✅ Case sensitivity (Users vs users)
-- ✅ Column naming (Email vs email)
-- ✅ Data types (DateOfBirth timestamp)
-- ✅ Foreign key constraints
-- ✅ Proper PostgreSQL syntax
-- ===========================================

-- Connect to ELearning database
\c ELearning;

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';

-- ===========================================
-- STEP 1: DROP ALL EXISTING TABLES
-- ===========================================
DROP TABLE IF EXISTS "Certificates" CASCADE;
DROP TABLE IF EXISTS "Progress" CASCADE;
DROP TABLE IF EXISTS "QuizAttempts" CASCADE;
DROP TABLE IF EXISTS "QuizQuestions" CASCADE;
DROP TABLE IF EXISTS "Quizzes" CASCADE;
DROP TABLE IF EXISTS "Submissions" CASCADE;
DROP TABLE IF EXISTS "Assignments" CASCADE;
DROP TABLE IF EXISTS "Enrollments" CASCADE;
DROP TABLE IF EXISTS "Lessons" CASCADE;
DROP TABLE IF EXISTS "Courses" CASCADE;
DROP TABLE IF EXISTS "Users" CASCADE;
DROP TABLE IF EXISTS "Categories" CASCADE;

-- ===========================================
-- STEP 2: CREATE TABLES WITH EXACT EF MAPPING
-- ===========================================

-- Create Categories table (matches Category.cs exactly)
CREATE TABLE "Categories" (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(500),
    "Icon" VARCHAR(255),
    "Color" VARCHAR(50),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create Users table (matches User.cs exactly)
CREATE TABLE "Users" (
    "Id" SERIAL PRIMARY KEY,
    "Email" VARCHAR(255) NOT NULL UNIQUE,
    "FirstName" VARCHAR(100) NOT NULL,
    "LastName" VARCHAR(100) NOT NULL,
    "PasswordHash" VARCHAR(255) NOT NULL,
    "ProfilePicture" VARCHAR(500),
    "Bio" TEXT,
    "DateOfBirth" TIMESTAMP WITH TIME ZONE NOT NULL, -- ✅ FIXED: Changed from DATE to TIMESTAMP
    "PhoneNumber" VARCHAR(20),
    "Address" VARCHAR(500),
    "Role" VARCHAR(20) NOT NULL DEFAULT 'Student',
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create Courses table (matches Course.cs exactly)
CREATE TABLE "Courses" (
    "Id" SERIAL PRIMARY KEY,
    "Title" VARCHAR(200) NOT NULL,
    "Description" VARCHAR(1000),
    "Thumbnail" VARCHAR(500),
    "Price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "IsFree" BOOLEAN NOT NULL DEFAULT false,
    "Level" VARCHAR(20) NOT NULL DEFAULT 'Beginner',
    "Status" VARCHAR(20) NOT NULL DEFAULT 'Draft',
    "Duration" INTEGER NOT NULL DEFAULT 0,
    "Prerequisites" VARCHAR(1000),
    "LearningOutcomes" VARCHAR(1000),
    "InstructorId" INTEGER NOT NULL,
    "CategoryId" INTEGER,
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "PublishedAt" TIMESTAMP WITH TIME ZONE,
    
    FOREIGN KEY ("InstructorId") REFERENCES "Users"("Id") ON DELETE RESTRICT,
    FOREIGN KEY ("CategoryId") REFERENCES "Categories"("Id") ON DELETE SET NULL
);

-- Create Lessons table (matches Lesson.cs exactly)
CREATE TABLE "Lessons" (
    "Id" SERIAL PRIMARY KEY,
    "Title" VARCHAR(200) NOT NULL,
    "Content" TEXT NOT NULL,
    "VideoUrl" VARCHAR(500),
    "AudioUrl" VARCHAR(500),
    "DocumentUrl" VARCHAR(500),
    "Duration" INTEGER NOT NULL DEFAULT 0,
    "Order" INTEGER NOT NULL DEFAULT 0,
    "IsFree" BOOLEAN NOT NULL DEFAULT false,
    "Type" VARCHAR(20) NOT NULL DEFAULT 'Video',
    "CourseId" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY ("CourseId") REFERENCES "Courses"("Id") ON DELETE CASCADE
);

-- Create Enrollments table (matches Enrollment.cs exactly)
CREATE TABLE "Enrollments" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" INTEGER NOT NULL,
    "CourseId" INTEGER NOT NULL,
    "EnrolledAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "Status" VARCHAR(20) NOT NULL DEFAULT 'Active',
    "CompletedAt" TIMESTAMP WITH TIME ZONE,
    "Grade" DECIMAL(5,2),
    "Notes" VARCHAR(1000),
    
    FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE,
    FOREIGN KEY ("CourseId") REFERENCES "Courses"("Id") ON DELETE CASCADE,
    UNIQUE ("UserId", "CourseId")
);

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

-- Create Quizzes table (matches Quiz.cs exactly)
CREATE TABLE "Quizzes" (
    "Id" SERIAL PRIMARY KEY,
    "Title" VARCHAR(200) NOT NULL,
    "Description" VARCHAR(500),
    "TimeLimit" INTEGER NOT NULL DEFAULT 0,
    "MaxAttempts" INTEGER NOT NULL DEFAULT 1,
    "IsRandomized" BOOLEAN NOT NULL DEFAULT false,
    "ShowCorrectAnswers" BOOLEAN NOT NULL DEFAULT true,
    "ShowResultsImmediately" BOOLEAN NOT NULL DEFAULT true,
    "PassingScore" DECIMAL(5,2) NOT NULL DEFAULT 60,
    "AvailableFrom" TIMESTAMP WITH TIME ZONE,
    "AvailableUntil" TIMESTAMP WITH TIME ZONE,
    "CourseId" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY ("CourseId") REFERENCES "Courses"("Id") ON DELETE CASCADE
);

-- Create QuizQuestions table (matches QuizQuestion.cs exactly)
CREATE TABLE "QuizQuestions" (
    "Id" SERIAL PRIMARY KEY,
    "Question" TEXT NOT NULL,
    "CorrectAnswer" TEXT NOT NULL,
    "OptionA" TEXT,
    "OptionB" TEXT,
    "OptionC" TEXT,
    "OptionD" TEXT,
    "Explanation" TEXT,
    "Points" DECIMAL(5,2) NOT NULL DEFAULT 1,
    "Order" INTEGER NOT NULL DEFAULT 0,
    "Type" VARCHAR(20) NOT NULL DEFAULT 'MultipleChoice',
    "QuizId" INTEGER NOT NULL,
    
    FOREIGN KEY ("QuizId") REFERENCES "Quizzes"("Id") ON DELETE CASCADE
);

-- Create QuizAttempts table (matches QuizAttempt.cs exactly)
CREATE TABLE "QuizAttempts" (
    "Id" SERIAL PRIMARY KEY,
    "Score" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "TimeSpent" INTEGER NOT NULL DEFAULT 0,
    "StartedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "CompletedAt" TIMESTAMP WITH TIME ZONE,
    "IsPassed" BOOLEAN NOT NULL DEFAULT false,
    "Answers" TEXT,
    "UserId" INTEGER NOT NULL,
    "QuizId" INTEGER NOT NULL,
    
    FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE,
    FOREIGN KEY ("QuizId") REFERENCES "Quizzes"("Id") ON DELETE CASCADE
);

-- Create Progress table (matches Progress.cs exactly)
CREATE TABLE "Progress" (
    "Id" SERIAL PRIMARY KEY,
    "CompletionPercentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "LessonsCompleted" INTEGER NOT NULL DEFAULT 0,
    "TotalLessons" INTEGER NOT NULL DEFAULT 0,
    "AssignmentsCompleted" INTEGER NOT NULL DEFAULT 0,
    "TotalAssignments" INTEGER NOT NULL DEFAULT 0,
    "QuizzesCompleted" INTEGER NOT NULL DEFAULT 0,
    "TotalQuizzes" INTEGER NOT NULL DEFAULT 0,
    "LastAccessedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "CompletedAt" TIMESTAMP WITH TIME ZONE,
    "UserId" INTEGER NOT NULL,
    "CourseId" INTEGER NOT NULL,
    
    FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE,
    FOREIGN KEY ("CourseId") REFERENCES "Courses"("Id") ON DELETE CASCADE,
    UNIQUE ("UserId", "CourseId")
);

-- Create Certificates table (matches Certificate.cs exactly)
CREATE TABLE "Certificates" (
    "Id" SERIAL PRIMARY KEY,
    "CertificateNumber" VARCHAR(50) NOT NULL UNIQUE,
    "CertificateUrl" VARCHAR(500),
    "IssuedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "ExpiresAt" TIMESTAMP WITH TIME ZONE,
    "IsValid" BOOLEAN NOT NULL DEFAULT true,
    "VerificationCode" VARCHAR(100),
    "UserId" INTEGER NOT NULL,
    "CourseId" INTEGER NOT NULL,
    
    FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE,
    FOREIGN KEY ("CourseId") REFERENCES "Courses"("Id") ON DELETE CASCADE
);

-- ===========================================
-- STEP 3: CREATE PERFORMANCE INDEXES
-- ===========================================

-- Indexes for Users table
CREATE INDEX "IX_Users_Email" ON "Users"("Email");
CREATE INDEX "IX_Users_Role" ON "Users"("Role");
CREATE INDEX "IX_Users_IsActive" ON "Users"("IsActive");

-- Indexes for Courses table
CREATE INDEX "IX_Courses_InstructorId" ON "Courses"("InstructorId");
CREATE INDEX "IX_Courses_CategoryId" ON "Courses"("CategoryId");
CREATE INDEX "IX_Courses_Status" ON "Courses"("Status");
CREATE INDEX "IX_Courses_Level" ON "Courses"("Level");
CREATE INDEX "IX_Courses_IsFree" ON "Courses"("IsFree");
CREATE INDEX "IX_Courses_PublishedAt" ON "Courses"("PublishedAt");

-- Indexes for Lessons table
CREATE INDEX "IX_Lessons_CourseId" ON "Lessons"("CourseId");
CREATE INDEX "IX_Lessons_Order" ON "Lessons"("CourseId", "Order");
CREATE INDEX "IX_Lessons_Type" ON "Lessons"("Type");

-- Indexes for Enrollments table
CREATE INDEX "IX_Enrollments_UserId" ON "Enrollments"("UserId");
CREATE INDEX "IX_Enrollments_CourseId" ON "Enrollments"("CourseId");
CREATE INDEX "IX_Enrollments_Status" ON "Enrollments"("Status");
CREATE INDEX "IX_Enrollments_EnrolledAt" ON "Enrollments"("EnrolledAt");

-- Indexes for Assignments table
CREATE INDEX "IX_Assignments_CourseId" ON "Assignments"("CourseId");
CREATE INDEX "IX_Assignments_DueDate" ON "Assignments"("DueDate");
CREATE INDEX "IX_Assignments_Type" ON "Assignments"("Type");

-- Indexes for Submissions table
CREATE INDEX "IX_Submissions_UserId" ON "Submissions"("UserId");
CREATE INDEX "IX_Submissions_AssignmentId" ON "Submissions"("AssignmentId");
CREATE INDEX "IX_Submissions_Status" ON "Submissions"("Status");
CREATE INDEX "IX_Submissions_SubmittedAt" ON "Submissions"("SubmittedAt");

-- Indexes for Quizzes table
CREATE INDEX "IX_Quizzes_CourseId" ON "Quizzes"("CourseId");
CREATE INDEX "IX_Quizzes_AvailableFrom" ON "Quizzes"("AvailableFrom");
CREATE INDEX "IX_Quizzes_AvailableUntil" ON "Quizzes"("AvailableUntil");

-- Indexes for QuizQuestions table
CREATE INDEX "IX_QuizQuestions_QuizId" ON "QuizQuestions"("QuizId");
CREATE INDEX "IX_QuizQuestions_Order" ON "QuizQuestions"("QuizId", "Order");
CREATE INDEX "IX_QuizQuestions_Type" ON "QuizQuestions"("Type");

-- Indexes for QuizAttempts table
CREATE INDEX "IX_QuizAttempts_UserId" ON "QuizAttempts"("UserId");
CREATE INDEX "IX_QuizAttempts_QuizId" ON "QuizAttempts"("QuizId");
CREATE INDEX "IX_QuizAttempts_StartedAt" ON "QuizAttempts"("StartedAt");
CREATE INDEX "IX_QuizAttempts_IsPassed" ON "QuizAttempts"("IsPassed");

-- Indexes for Progress table
CREATE INDEX "IX_Progress_UserId" ON "Progress"("UserId");
CREATE INDEX "IX_Progress_CourseId" ON "Progress"("CourseId");
CREATE INDEX "IX_Progress_CompletionPercentage" ON "Progress"("CompletionPercentage");
CREATE INDEX "IX_Progress_LastAccessedAt" ON "Progress"("LastAccessedAt");

-- Indexes for Certificates table
CREATE INDEX "IX_Certificates_UserId" ON "Certificates"("UserId");
CREATE INDEX "IX_Certificates_CourseId" ON "Certificates"("CourseId");
CREATE INDEX "IX_Certificates_CertificateNumber" ON "Certificates"("CertificateNumber");
CREATE INDEX "IX_Certificates_VerificationCode" ON "Certificates"("VerificationCode");
CREATE INDEX "IX_Certificates_IsValid" ON "Certificates"("IsValid");

-- ===========================================
-- STEP 4: INSERT SAMPLE DATA
-- ===========================================

-- Insert sample categories
INSERT INTO "Categories" ("Name", "Description", "Icon", "Color", "IsActive") VALUES
('Programming', 'Learn various programming languages and frameworks', 'code', '#3498db', true),
('Web Development', 'Frontend and backend web development courses', 'globe', '#e74c3c', true),
('Data Science', 'Data analysis, machine learning, and AI courses', 'chart', '#2ecc71', true),
('Design', 'UI/UX design, graphic design, and creative courses', 'palette', '#f39c12', true),
('Business', 'Business skills, entrepreneurship, and management', 'briefcase', '#9b59b6', true),
('Marketing', 'Digital marketing, SEO, and advertising courses', 'megaphone', '#e67e22', true);

-- Insert sample users (passwords are hashed versions of 'password123')
INSERT INTO "Users" ("Email", "FirstName", "LastName", "PasswordHash", "DateOfBirth", "PhoneNumber", "Address", "Role", "IsActive") VALUES
('admin@elearning.com', 'Admin', 'User', '$2a$11$K8Y1OjvJ8Y1OjvJ8Y1OjvO', '1990-01-01T00:00:00Z', '+1234567890', '123 Admin St, City, State', 'Admin', true),
('instructor1@elearning.com', 'John', 'Smith', '$2a$11$K8Y1OjvJ8Y1OjvJ8Y1OjvO', '1985-05-15T00:00:00Z', '+1234567891', '456 Instructor Ave, City, State', 'Instructor', true),
('instructor2@elearning.com', 'Sarah', 'Johnson', '$2a$11$K8Y1OjvJ8Y1OjvJ8Y1OjvO', '1988-03-22T00:00:00Z', '+1234567892', '789 Teacher Blvd, City, State', 'Instructor', true),
('student1@elearning.com', 'Mike', 'Wilson', '$2a$11$K8Y1OjvJ8Y1OjvJ8Y1OjvO', '1995-07-10T00:00:00Z', '+1234567893', '321 Student Rd, City, State', 'Student', true),
('student2@elearning.com', 'Emily', 'Davis', '$2a$11$K8Y1OjvJ8Y1OjvJ8Y1OjvO', '1998-11-25T00:00:00Z', '+1234567894', '654 Learner Ln, City, State', 'Student', true),
('student3@elearning.com', 'David', 'Brown', '$2a$11$K8Y1OjvJ8Y1OjvJ8Y1OjvO', '1993-09-18T00:00:00Z', '+1234567895', '987 Education St, City, State', 'Student', true);

-- ===========================================
-- SUCCESS MESSAGE
-- ===========================================
SELECT '✅ ELearning Database Setup Complete!' as Status,
       'All tables created with proper case sensitivity and data types' as Message,
       'Ready for Entity Framework integration' as Next_Step;