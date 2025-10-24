-- Create Views for ELearning Database (PostgreSQL)
-- This script creates useful views for common queries

-- Connect to the ELearning database
\c ELearning;

-- View for course details with instructor and category information
CREATE OR REPLACE VIEW vw_CourseDetails AS
SELECT 
    c.Id,
    c.Title,
    c.Description,
    c.Thumbnail,
    c.Price,
    c.IsFree,
    c.Level,
    c.Status,
    c.Duration,
    c.Prerequisites,
    c.LearningOutcomes,
    c.CreatedAt,
    c.PublishedAt,
    (u.FirstName || ' ' || u.LastName) AS InstructorName,
    u.Email AS InstructorEmail,
    cat.Name AS CategoryName,
    cat.Description AS CategoryDescription,
    COUNT(DISTINCT e.Id) AS EnrollmentCount,
    COUNT(DISTINCT l.Id) AS LessonCount,
    COUNT(DISTINCT a.Id) AS AssignmentCount,
    COUNT(DISTINCT q.Id) AS QuizCount
FROM Courses c
INNER JOIN Users u ON c.InstructorId = u.Id
LEFT JOIN Categories cat ON c.CategoryId = cat.Id
LEFT JOIN Enrollments e ON c.Id = e.CourseId
LEFT JOIN Lessons l ON c.Id = l.CourseId
LEFT JOIN Assignments a ON c.Id = a.CourseId
LEFT JOIN Quizzes q ON c.Id = q.CourseId
GROUP BY c.Id, c.Title, c.Description, c.Thumbnail, c.Price, c.IsFree, c.Level, c.Status, c.Duration, c.Prerequisites, c.LearningOutcomes, c.CreatedAt, c.PublishedAt, u.FirstName, u.LastName, u.Email, cat.Name, cat.Description;

-- View for user enrollments with course information
CREATE OR REPLACE VIEW vw_UserEnrollments AS
SELECT 
    e.Id,
    e.UserId,
    e.CourseId,
    e.EnrolledAt,
    e.Status,
    e.CompletedAt,
    e.Grade,
    e.Notes,
    c.Title AS CourseTitle,
    c.Description AS CourseDescription,
    c.Thumbnail AS CourseThumbnail,
    c.Price AS CoursePrice,
    c.Level AS CourseLevel,
    c.Duration AS CourseDuration,
    c.Status AS CourseStatus,
    (u.FirstName || ' ' || u.LastName) AS InstructorName,
    cat.Name AS CategoryName,
    p.CompletionPercentage,
    p.LessonsCompleted,
    p.TotalLessons,
    p.AssignmentsCompleted,
    p.TotalAssignments,
    p.QuizzesCompleted,
    p.TotalQuizzes
FROM Enrollments e
INNER JOIN Courses c ON e.CourseId = c.Id
INNER JOIN Users u ON c.InstructorId = u.Id
LEFT JOIN Categories cat ON c.CategoryId = cat.Id
LEFT JOIN Progress p ON e.UserId = p.UserId AND e.CourseId = p.CourseId;

-- View for instructor courses with statistics
CREATE OR REPLACE VIEW vw_InstructorCourses AS
SELECT 
    c.Id,
    c.Title,
    c.Description,
    c.Thumbnail,
    c.Price,
    c.IsFree,
    c.Level,
    c.Status,
    c.Duration,
    c.CreatedAt,
    c.PublishedAt,
    cat.Name AS CategoryName,
    COUNT(DISTINCT e.Id) AS TotalEnrollments,
    COUNT(DISTINCT l.Id) AS TotalLessons,
    COUNT(DISTINCT a.Id) AS TotalAssignments,
    COUNT(DISTINCT q.Id) AS TotalQuizzes,
    AVG(p.CompletionPercentage) AS AverageCompletion,
    COUNT(DISTINCT CASE WHEN e.Status = 'Completed' THEN e.Id END) AS CompletedEnrollments
FROM Courses c
LEFT JOIN Categories cat ON c.CategoryId = cat.Id
LEFT JOIN Enrollments e ON c.Id = e.CourseId
LEFT JOIN Lessons l ON c.Id = l.CourseId
LEFT JOIN Assignments a ON c.Id = a.CourseId
LEFT JOIN Quizzes q ON c.Id = q.CourseId
LEFT JOIN Progress p ON c.Id = p.CourseId
GROUP BY c.Id, c.Title, c.Description, c.Thumbnail, c.Price, c.IsFree, c.Level, c.Status, c.Duration, c.CreatedAt, c.PublishedAt, cat.Name;

-- View for student progress across all courses
CREATE OR REPLACE VIEW vw_StudentProgress AS
SELECT 
    u.Id AS UserId,
    (u.FirstName || ' ' || u.LastName) AS StudentName,
    u.Email AS StudentEmail,
    c.Id AS CourseId,
    c.Title AS CourseTitle,
    c.Level AS CourseLevel,
    e.EnrolledAt,
    e.Status AS EnrollmentStatus,
    e.CompletedAt,
    e.Grade,
    p.CompletionPercentage,
    p.LessonsCompleted,
    p.TotalLessons,
    p.AssignmentsCompleted,
    p.TotalAssignments,
    p.QuizzesCompleted,
    p.TotalQuizzes,
    p.LastAccessedAt,
    p.CompletedAt AS ProgressCompletedAt,
    CASE WHEN p.CompletionPercentage >= 100 THEN 1 ELSE 0 END AS IsCompleted
FROM Users u
INNER JOIN Enrollments e ON u.Id = e.UserId
INNER JOIN Courses c ON e.CourseId = c.Id
LEFT JOIN Progress p ON e.UserId = p.UserId AND e.CourseId = p.CourseId
WHERE u.Role = 'Student';

-- View for assignment submissions with user and course information
CREATE OR REPLACE VIEW vw_AssignmentSubmissions AS
SELECT 
    s.Id,
    s.Content,
    s.FileUrl,
    s.Score,
    s.Feedback,
    s.SubmittedAt,
    s.GradedAt,
    s.IsLate,
    s.Status,
    (u.FirstName || ' ' || u.LastName) AS StudentName,
    u.Email AS StudentEmail,
    a.Title AS AssignmentTitle,
    a.Description AS AssignmentDescription,
    a.MaxPoints,
    a.DueDate,
    c.Title AS CourseTitle,
    c.Id AS CourseId,
    (inst.FirstName || ' ' || inst.LastName) AS InstructorName
FROM Submissions s
INNER JOIN Users u ON s.UserId = u.Id
INNER JOIN Assignments a ON s.AssignmentId = a.Id
INNER JOIN Courses c ON a.CourseId = c.Id
INNER JOIN Users inst ON c.InstructorId = inst.Id;

-- View for quiz attempts with user and quiz information
CREATE OR REPLACE VIEW vw_QuizAttempts AS
SELECT 
    qa.Id,
    qa.Score,
    qa.TimeSpent,
    qa.StartedAt,
    qa.CompletedAt,
    qa.IsPassed,
    (u.FirstName || ' ' || u.LastName) AS StudentName,
    u.Email AS StudentEmail,
    q.Title AS QuizTitle,
    q.Description AS QuizDescription,
    q.TimeLimit,
    q.PassingScore,
    c.Title AS CourseTitle,
    c.Id AS CourseId,
    (inst.FirstName || ' ' || inst.LastName) AS InstructorName
FROM QuizAttempts qa
INNER JOIN Users u ON qa.UserId = u.Id
INNER JOIN Quizzes q ON qa.QuizId = q.Id
INNER JOIN Courses c ON q.CourseId = c.Id
INNER JOIN Users inst ON c.InstructorId = inst.Id;

-- View for certificates with user and course information
CREATE OR REPLACE VIEW vw_Certificates AS
SELECT 
    cert.Id,
    cert.CertificateNumber,
    cert.CertificateUrl,
    cert.IssuedAt,
    cert.ExpiresAt,
    cert.IsValid,
    cert.VerificationCode,
    (u.FirstName || ' ' || u.LastName) AS StudentName,
    u.Email AS StudentEmail,
    c.Title AS CourseTitle,
    c.Description AS CourseDescription,
    c.Level AS CourseLevel,
    (inst.FirstName || ' ' || inst.LastName) AS InstructorName,
    cat.Name AS CategoryName
FROM Certificates cert
INNER JOIN Users u ON cert.UserId = u.Id
INNER JOIN Courses c ON cert.CourseId = c.Id
INNER JOIN Users inst ON c.InstructorId = inst.Id
LEFT JOIN Categories cat ON c.CategoryId = cat.Id;

-- View for course analytics
CREATE OR REPLACE VIEW vw_CourseAnalytics AS
SELECT 
    c.Id AS CourseId,
    c.Title AS CourseTitle,
    c.Level AS CourseLevel,
    c.Price,
    c.IsFree,
    c.Duration,
    c.CreatedAt,
    c.PublishedAt,
    cat.Name AS CategoryName,
    COUNT(DISTINCT e.Id) AS TotalEnrollments,
    COUNT(DISTINCT CASE WHEN e.Status = 'Active' THEN e.Id END) AS ActiveEnrollments,
    COUNT(DISTINCT CASE WHEN e.Status = 'Completed' THEN e.Id END) AS CompletedEnrollments,
    COUNT(DISTINCT l.Id) AS TotalLessons,
    COUNT(DISTINCT a.Id) AS TotalAssignments,
    COUNT(DISTINCT q.Id) AS TotalQuizzes,
    AVG(p.CompletionPercentage) AS AverageCompletion,
    COUNT(DISTINCT cert.Id) AS CertificatesIssued,
    COUNT(DISTINCT s.Id) AS TotalSubmissions,
    AVG(s.Score) AS AverageScore
FROM Courses c
LEFT JOIN Categories cat ON c.CategoryId = cat.Id
LEFT JOIN Enrollments e ON c.Id = e.CourseId
LEFT JOIN Lessons l ON c.Id = l.CourseId
LEFT JOIN Assignments a ON c.Id = a.CourseId
LEFT JOIN Quizzes q ON c.Id = q.CourseId
LEFT JOIN Progress p ON c.Id = p.CourseId
LEFT JOIN Certificates cert ON c.Id = cert.CourseId
LEFT JOIN Submissions s ON a.Id = s.AssignmentId
GROUP BY c.Id, c.Title, c.Level, c.Price, c.IsFree, c.Duration, c.CreatedAt, c.PublishedAt, cat.Name;
