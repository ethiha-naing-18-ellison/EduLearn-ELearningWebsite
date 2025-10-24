-- Create Stored Procedures for ELearning Database (PostgreSQL)
-- This script creates useful stored procedures for common operations

-- Connect to the ELearning database
\c ELearning;

-- Stored procedure to get user enrollments with course details
CREATE OR REPLACE FUNCTION sp_GetUserEnrollments(p_UserId INTEGER)
RETURNS TABLE(
    Id INTEGER,
    UserId INTEGER,
    CourseId INTEGER,
    EnrolledAt TIMESTAMP WITH TIME ZONE,
    Status VARCHAR(20),
    CompletedAt TIMESTAMP WITH TIME ZONE,
    Grade DECIMAL(5,2),
    Notes VARCHAR(1000),
    CourseTitle VARCHAR(200),
    CourseDescription VARCHAR(1000),
    CourseThumbnail VARCHAR(500),
    CoursePrice DECIMAL(10,2),
    CourseLevel VARCHAR(20),
    CourseDuration INTEGER,
    InstructorName TEXT,
    CategoryName VARCHAR(100)
) AS $$
BEGIN
    RETURN QUERY
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
        (u.FirstName || ' ' || u.LastName) AS InstructorName,
        cat.Name AS CategoryName
    FROM Enrollments e
    INNER JOIN Courses c ON e.CourseId = c.Id
    INNER JOIN Users u ON c.InstructorId = u.Id
    LEFT JOIN Categories cat ON c.CategoryId = cat.Id
    WHERE e.UserId = p_UserId
    ORDER BY e.EnrolledAt DESC;
END;
$$ LANGUAGE plpgsql;

-- Stored procedure to get course statistics
CREATE OR REPLACE FUNCTION sp_GetCourseStatistics(p_CourseId INTEGER)
RETURNS TABLE(
    Id INTEGER,
    Title VARCHAR(200),
    Description VARCHAR(1000),
    Price DECIMAL(10,2),
    Level VARCHAR(20),
    Duration INTEGER,
    TotalEnrollments BIGINT,
    TotalLessons BIGINT,
    TotalAssignments BIGINT,
    TotalQuizzes BIGINT,
    AverageCompletion DECIMAL(5,2),
    InstructorName TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.Id,
        c.Title,
        c.Description,
        c.Price,
        c.Level,
        c.Duration,
        COUNT(DISTINCT e.Id) AS TotalEnrollments,
        COUNT(DISTINCT l.Id) AS TotalLessons,
        COUNT(DISTINCT a.Id) AS TotalAssignments,
        COUNT(DISTINCT q.Id) AS TotalQuizzes,
        AVG(p.CompletionPercentage) AS AverageCompletion,
        (u.FirstName || ' ' || u.LastName) AS InstructorName
    FROM Courses c
    LEFT JOIN Enrollments e ON c.Id = e.CourseId
    LEFT JOIN Lessons l ON c.Id = l.CourseId
    LEFT JOIN Assignments a ON c.Id = a.CourseId
    LEFT JOIN Quizzes q ON c.Id = q.CourseId
    LEFT JOIN Progress p ON c.Id = p.CourseId
    LEFT JOIN Users u ON c.InstructorId = u.Id
    WHERE c.Id = p_CourseId
    GROUP BY c.Id, c.Title, c.Description, c.Price, c.Level, c.Duration, u.FirstName, u.LastName;
END;
$$ LANGUAGE plpgsql;

-- Stored procedure to get user progress for a course
CREATE OR REPLACE FUNCTION sp_GetUserProgress(p_UserId INTEGER, p_CourseId INTEGER)
RETURNS TABLE(
    Id INTEGER,
    CompletionPercentage DECIMAL(5,2),
    LessonsCompleted INTEGER,
    TotalLessons INTEGER,
    AssignmentsCompleted INTEGER,
    TotalAssignments INTEGER,
    QuizzesCompleted INTEGER,
    TotalQuizzes INTEGER,
    LastAccessedAt TIMESTAMP WITH TIME ZONE,
    CompletedAt TIMESTAMP WITH TIME ZONE,
    CourseTitle VARCHAR(200),
    UserName TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.Id,
        p.CompletionPercentage,
        p.LessonsCompleted,
        p.TotalLessons,
        p.AssignmentsCompleted,
        p.TotalAssignments,
        p.QuizzesCompleted,
        p.TotalQuizzes,
        p.LastAccessedAt,
        p.CompletedAt,
        c.Title AS CourseTitle,
        (u.FirstName || ' ' || u.LastName) AS UserName
    FROM Progress p
    INNER JOIN Courses c ON p.CourseId = c.Id
    INNER JOIN Users u ON p.UserId = u.Id
    WHERE p.UserId = p_UserId AND p.CourseId = p_CourseId;
END;
$$ LANGUAGE plpgsql;

-- Stored procedure to search courses
CREATE OR REPLACE FUNCTION sp_SearchCourses(
    p_SearchTerm VARCHAR(255),
    p_CategoryId INTEGER DEFAULT NULL,
    p_Level VARCHAR(20) DEFAULT NULL,
    p_IsFree BOOLEAN DEFAULT NULL
)
RETURNS TABLE(
    Id INTEGER,
    Title VARCHAR(200),
    Description VARCHAR(1000),
    Thumbnail VARCHAR(500),
    Price DECIMAL(10,2),
    IsFree BOOLEAN,
    Level VARCHAR(20),
    Duration INTEGER,
    CreatedAt TIMESTAMP WITH TIME ZONE,
    InstructorName TEXT,
    CategoryName VARCHAR(100),
    EnrollmentCount BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.Id,
        c.Title,
        c.Description,
        c.Thumbnail,
        c.Price,
        c.IsFree,
        c.Level,
        c.Duration,
        c.CreatedAt,
        (u.FirstName || ' ' || u.LastName) AS InstructorName,
        cat.Name AS CategoryName,
        COUNT(DISTINCT e.Id) AS EnrollmentCount
    FROM Courses c
    INNER JOIN Users u ON c.InstructorId = u.Id
    LEFT JOIN Categories cat ON c.CategoryId = cat.Id
    LEFT JOIN Enrollments e ON c.Id = e.CourseId
    WHERE c.Status = 'Published'
        AND (c.Title ILIKE '%' || p_SearchTerm || '%' OR c.Description ILIKE '%' || p_SearchTerm || '%')
        AND (p_CategoryId IS NULL OR c.CategoryId = p_CategoryId)
        AND (p_Level IS NULL OR c.Level = p_Level)
        AND (p_IsFree IS NULL OR c.IsFree = p_IsFree)
    GROUP BY c.Id, c.Title, c.Description, c.Thumbnail, c.Price, c.IsFree, c.Level, c.Duration, c.CreatedAt, u.FirstName, u.LastName, cat.Name
    ORDER BY c.CreatedAt DESC;
END;
$$ LANGUAGE plpgsql;

-- Stored procedure to get instructor dashboard data
CREATE OR REPLACE FUNCTION sp_GetInstructorDashboard(p_InstructorId INTEGER)
RETURNS TABLE(
    TotalCourses BIGINT,
    TotalEnrollments BIGINT,
    TotalLessons BIGINT,
    TotalAssignments BIGINT,
    AverageCompletionRate DECIMAL(5,2),
    CompletedEnrollments BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT c.Id) AS TotalCourses,
        COUNT(DISTINCT e.Id) AS TotalEnrollments,
        COUNT(DISTINCT l.Id) AS TotalLessons,
        COUNT(DISTINCT a.Id) AS TotalAssignments,
        AVG(p.CompletionPercentage) AS AverageCompletionRate,
        SUM(CASE WHEN e.Status = 'Completed' THEN 1 ELSE 0 END) AS CompletedEnrollments
    FROM Courses c
    LEFT JOIN Enrollments e ON c.Id = e.CourseId
    LEFT JOIN Lessons l ON c.Id = l.CourseId
    LEFT JOIN Assignments a ON c.Id = a.CourseId
    LEFT JOIN Progress p ON c.Id = p.CourseId
    WHERE c.InstructorId = p_InstructorId;
END;
$$ LANGUAGE plpgsql;

-- Stored procedure to get student dashboard data
CREATE OR REPLACE FUNCTION sp_GetStudentDashboard(p_StudentId INTEGER)
RETURNS TABLE(
    TotalEnrollments BIGINT,
    CompletedCourses BIGINT,
    LessonsCompleted BIGINT,
    AssignmentsSubmitted BIGINT,
    AverageProgress DECIMAL(5,2),
    CertificatesEarned BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT e.Id) AS TotalEnrollments,
        COUNT(DISTINCT CASE WHEN e.Status = 'Completed' THEN e.Id END) AS CompletedCourses,
        COUNT(DISTINCT l.Id) AS LessonsCompleted,
        COUNT(DISTINCT a.Id) AS AssignmentsSubmitted,
        AVG(p.CompletionPercentage) AS AverageProgress,
        COUNT(DISTINCT cert.Id) AS CertificatesEarned
    FROM Enrollments e
    LEFT JOIN Courses c ON e.CourseId = c.Id
    LEFT JOIN Lessons l ON c.Id = l.CourseId
    LEFT JOIN Assignments a ON c.Id = a.CourseId
    LEFT JOIN Progress p ON e.UserId = p.UserId AND e.CourseId = p.CourseId
    LEFT JOIN Certificates cert ON e.UserId = cert.UserId AND e.CourseId = cert.CourseId
    WHERE e.UserId = p_StudentId;
END;
$$ LANGUAGE plpgsql;

-- Stored procedure to update course progress
CREATE OR REPLACE FUNCTION sp_UpdateCourseProgress(p_UserId INTEGER, p_CourseId INTEGER)
RETURNS VOID AS $$
DECLARE
    v_TotalLessons INTEGER;
    v_CompletedLessons INTEGER;
    v_TotalAssignments INTEGER;
    v_CompletedAssignments INTEGER;
    v_TotalQuizzes INTEGER;
    v_CompletedQuizzes INTEGER;
    v_CompletionPercentage DECIMAL(5,2);
BEGIN
    -- Get total counts
    SELECT COUNT(*) INTO v_TotalLessons FROM Lessons WHERE CourseId = p_CourseId;
    SELECT COUNT(*) INTO v_TotalAssignments FROM Assignments WHERE CourseId = p_CourseId;
    SELECT COUNT(*) INTO v_TotalQuizzes FROM Quizzes WHERE CourseId = p_CourseId;
    
    -- Get completed counts
    SELECT 0 INTO v_CompletedLessons; -- This would be calculated based on lesson completion tracking
    SELECT COUNT(*) INTO v_CompletedAssignments FROM Submissions s 
        INNER JOIN Assignments a ON s.AssignmentId = a.Id 
        WHERE a.CourseId = p_CourseId AND s.UserId = p_UserId;
    SELECT COUNT(*) INTO v_CompletedQuizzes FROM QuizAttempts qa 
        INNER JOIN Quizzes q ON qa.QuizId = q.Id 
        WHERE q.CourseId = p_CourseId AND qa.UserId = p_UserId;
    
    -- Calculate completion percentage
    v_CompletionPercentage := 0;
    IF v_TotalLessons > 0 OR v_TotalAssignments > 0 OR v_TotalQuizzes > 0 THEN
        v_CompletionPercentage := ((v_CompletedLessons + v_CompletedAssignments + v_CompletedQuizzes) * 100.0) / (v_TotalLessons + v_TotalAssignments + v_TotalQuizzes);
    END IF;
    
    -- Update or insert progress
    IF EXISTS (SELECT 1 FROM Progress WHERE UserId = p_UserId AND CourseId = p_CourseId) THEN
        UPDATE Progress 
        SET CompletionPercentage = v_CompletionPercentage,
            LessonsCompleted = v_CompletedLessons,
            TotalLessons = v_TotalLessons,
            AssignmentsCompleted = v_CompletedAssignments,
            TotalAssignments = v_TotalAssignments,
            QuizzesCompleted = v_CompletedQuizzes,
            TotalQuizzes = v_TotalQuizzes,
            LastAccessedAt = NOW(),
            CompletedAt = CASE WHEN v_CompletionPercentage >= 100 THEN NOW() ELSE CompletedAt END
        WHERE UserId = p_UserId AND CourseId = p_CourseId;
    ELSE
        INSERT INTO Progress (UserId, CourseId, CompletionPercentage, LessonsCompleted, TotalLessons, AssignmentsCompleted, TotalAssignments, QuizzesCompleted, TotalQuizzes, LastAccessedAt)
        VALUES (p_UserId, p_CourseId, v_CompletionPercentage, v_CompletedLessons, v_TotalLessons, v_CompletedAssignments, v_TotalAssignments, v_CompletedQuizzes, v_TotalQuizzes, NOW());
    END IF;
END;
$$ LANGUAGE plpgsql;
