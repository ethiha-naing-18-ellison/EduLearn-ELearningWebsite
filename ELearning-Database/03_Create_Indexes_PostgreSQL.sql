-- Create Indexes for ELearning Database (PostgreSQL)
-- This script creates indexes to improve query performance

-- Connect to the ELearning database
\c ELearning;

-- Indexes for Users table
CREATE INDEX IF NOT EXISTS IX_Users_Email ON Users(Email);
CREATE INDEX IF NOT EXISTS IX_Users_Role ON Users(Role);
CREATE INDEX IF NOT EXISTS IX_Users_IsActive ON Users(IsActive);

-- Indexes for Courses table
CREATE INDEX IF NOT EXISTS IX_Courses_InstructorId ON Courses(InstructorId);
CREATE INDEX IF NOT EXISTS IX_Courses_CategoryId ON Courses(CategoryId);
CREATE INDEX IF NOT EXISTS IX_Courses_Status ON Courses(Status);
CREATE INDEX IF NOT EXISTS IX_Courses_Level ON Courses(Level);
CREATE INDEX IF NOT EXISTS IX_Courses_IsFree ON Courses(IsFree);
CREATE INDEX IF NOT EXISTS IX_Courses_PublishedAt ON Courses(PublishedAt);

-- Indexes for Lessons table
CREATE INDEX IF NOT EXISTS IX_Lessons_CourseId ON Lessons(CourseId);
CREATE INDEX IF NOT EXISTS IX_Lessons_Order ON Lessons(CourseId, "Order");
CREATE INDEX IF NOT EXISTS IX_Lessons_Type ON Lessons(Type);

-- Indexes for Enrollments table
CREATE INDEX IF NOT EXISTS IX_Enrollments_UserId ON Enrollments(UserId);
CREATE INDEX IF NOT EXISTS IX_Enrollments_CourseId ON Enrollments(CourseId);
CREATE INDEX IF NOT EXISTS IX_Enrollments_Status ON Enrollments(Status);
CREATE INDEX IF NOT EXISTS IX_Enrollments_EnrolledAt ON Enrollments(EnrolledAt);

-- Indexes for Assignments table
CREATE INDEX IF NOT EXISTS IX_Assignments_CourseId ON Assignments(CourseId);
CREATE INDEX IF NOT EXISTS IX_Assignments_DueDate ON Assignments(DueDate);
CREATE INDEX IF NOT EXISTS IX_Assignments_Type ON Assignments(Type);

-- Indexes for Submissions table
CREATE INDEX IF NOT EXISTS IX_Submissions_UserId ON Submissions(UserId);
CREATE INDEX IF NOT EXISTS IX_Submissions_AssignmentId ON Submissions(AssignmentId);
CREATE INDEX IF NOT EXISTS IX_Submissions_Status ON Submissions(Status);
CREATE INDEX IF NOT EXISTS IX_Submissions_SubmittedAt ON Submissions(SubmittedAt);

-- Indexes for Quizzes table
CREATE INDEX IF NOT EXISTS IX_Quizzes_CourseId ON Quizzes(CourseId);
CREATE INDEX IF NOT EXISTS IX_Quizzes_AvailableFrom ON Quizzes(AvailableFrom);
CREATE INDEX IF NOT EXISTS IX_Quizzes_AvailableUntil ON Quizzes(AvailableUntil);

-- Indexes for QuizQuestions table
CREATE INDEX IF NOT EXISTS IX_QuizQuestions_QuizId ON QuizQuestions(QuizId);
CREATE INDEX IF NOT EXISTS IX_QuizQuestions_Order ON QuizQuestions(QuizId, "Order");
CREATE INDEX IF NOT EXISTS IX_QuizQuestions_Type ON QuizQuestions(Type);

-- Indexes for QuizAttempts table
CREATE INDEX IF NOT EXISTS IX_QuizAttempts_UserId ON QuizAttempts(UserId);
CREATE INDEX IF NOT EXISTS IX_QuizAttempts_QuizId ON QuizAttempts(QuizId);
CREATE INDEX IF NOT EXISTS IX_QuizAttempts_StartedAt ON QuizAttempts(StartedAt);
CREATE INDEX IF NOT EXISTS IX_QuizAttempts_IsPassed ON QuizAttempts(IsPassed);

-- Indexes for Progress table
CREATE INDEX IF NOT EXISTS IX_Progress_UserId ON Progress(UserId);
CREATE INDEX IF NOT EXISTS IX_Progress_CourseId ON Progress(CourseId);
CREATE INDEX IF NOT EXISTS IX_Progress_CompletionPercentage ON Progress(CompletionPercentage);
CREATE INDEX IF NOT EXISTS IX_Progress_LastAccessedAt ON Progress(LastAccessedAt);

-- Indexes for Certificates table
CREATE INDEX IF NOT EXISTS IX_Certificates_UserId ON Certificates(UserId);
CREATE INDEX IF NOT EXISTS IX_Certificates_CourseId ON Certificates(CourseId);
CREATE INDEX IF NOT EXISTS IX_Certificates_CertificateNumber ON Certificates(CertificateNumber);
CREATE INDEX IF NOT EXISTS IX_Certificates_VerificationCode ON Certificates(VerificationCode);
CREATE INDEX IF NOT EXISTS IX_Certificates_IsValid ON Certificates(IsValid);
