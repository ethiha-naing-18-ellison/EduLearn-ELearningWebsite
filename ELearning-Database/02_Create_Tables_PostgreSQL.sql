-- Create Tables for ELearning Database (PostgreSQL)
-- This script creates all necessary tables for the E-Learning platform

-- Connect to the ELearning database
\c ELearning;

-- Create Categories table
CREATE TABLE IF NOT EXISTS Categories (
    Id SERIAL PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Description VARCHAR(500),
    Icon VARCHAR(255),
    Color VARCHAR(50),
    IsActive BOOLEAN NOT NULL DEFAULT true,
    CreatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UpdatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create Users table
CREATE TABLE IF NOT EXISTS Users (
    Id SERIAL PRIMARY KEY,
    Email VARCHAR(255) NOT NULL UNIQUE,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    ProfilePicture VARCHAR(500),
    Bio TEXT,
    DateOfBirth DATE NOT NULL,
    PhoneNumber VARCHAR(20),
    Address VARCHAR(500),
    Role VARCHAR(20) NOT NULL DEFAULT 'Student',
    IsActive BOOLEAN NOT NULL DEFAULT true,
    CreatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UpdatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create Courses table
CREATE TABLE IF NOT EXISTS Courses (
    Id SERIAL PRIMARY KEY,
    Title VARCHAR(200) NOT NULL,
    Description VARCHAR(1000),
    Thumbnail VARCHAR(500),
    Price DECIMAL(10,2) NOT NULL DEFAULT 0,
    IsFree BOOLEAN NOT NULL DEFAULT false,
    Level VARCHAR(20) NOT NULL DEFAULT 'Beginner',
    Status VARCHAR(20) NOT NULL DEFAULT 'Draft',
    Duration INTEGER NOT NULL DEFAULT 0, -- in hours
    Prerequisites VARCHAR(1000),
    LearningOutcomes VARCHAR(1000),
    InstructorId INTEGER NOT NULL,
    CategoryId INTEGER,
    CreatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UpdatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PublishedAt TIMESTAMP WITH TIME ZONE,
    
    FOREIGN KEY (InstructorId) REFERENCES Users(Id) ON DELETE RESTRICT,
    FOREIGN KEY (CategoryId) REFERENCES Categories(Id) ON DELETE SET NULL
);

-- Create Lessons table
CREATE TABLE IF NOT EXISTS Lessons (
    Id SERIAL PRIMARY KEY,
    Title VARCHAR(200) NOT NULL,
    Content TEXT NOT NULL,
    VideoUrl VARCHAR(500),
    AudioUrl VARCHAR(500),
    DocumentUrl VARCHAR(500),
    Duration INTEGER NOT NULL DEFAULT 0, -- in minutes
    "Order" INTEGER NOT NULL DEFAULT 0,
    IsFree BOOLEAN NOT NULL DEFAULT false,
    Type VARCHAR(20) NOT NULL DEFAULT 'Video',
    CourseId INTEGER NOT NULL,
    CreatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UpdatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY (CourseId) REFERENCES Courses(Id) ON DELETE CASCADE
);

-- Create Enrollments table
CREATE TABLE IF NOT EXISTS Enrollments (
    Id SERIAL PRIMARY KEY,
    UserId INTEGER NOT NULL,
    CourseId INTEGER NOT NULL,
    EnrolledAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    Status VARCHAR(20) NOT NULL DEFAULT 'Active',
    CompletedAt TIMESTAMP WITH TIME ZONE,
    Grade DECIMAL(5,2),
    Notes VARCHAR(1000),
    
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (CourseId) REFERENCES Courses(Id) ON DELETE CASCADE,
    UNIQUE (UserId, CourseId)
);

-- Create Assignments table
CREATE TABLE IF NOT EXISTS Assignments (
    Id SERIAL PRIMARY KEY,
    Title VARCHAR(200) NOT NULL,
    Description TEXT NOT NULL,
    Instructions TEXT,
    MaxPoints DECIMAL(5,2) NOT NULL DEFAULT 0,
    DueDate TIMESTAMP WITH TIME ZONE NOT NULL,
    AllowLateSubmission BOOLEAN NOT NULL DEFAULT false,
    LatePenaltyPercentage INTEGER NOT NULL DEFAULT 0,
    Type VARCHAR(20) NOT NULL DEFAULT 'Essay',
    CourseId INTEGER NOT NULL,
    CreatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UpdatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY (CourseId) REFERENCES Courses(Id) ON DELETE CASCADE
);

-- Create Submissions table
CREATE TABLE IF NOT EXISTS Submissions (
    Id SERIAL PRIMARY KEY,
    Content TEXT NOT NULL,
    FileUrl VARCHAR(500),
    Score DECIMAL(5,2),
    Feedback TEXT,
    SubmittedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    GradedAt TIMESTAMP WITH TIME ZONE,
    IsLate BOOLEAN NOT NULL DEFAULT false,
    Status VARCHAR(20) NOT NULL DEFAULT 'Submitted',
    UserId INTEGER NOT NULL,
    AssignmentId INTEGER NOT NULL,
    
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (AssignmentId) REFERENCES Assignments(Id) ON DELETE CASCADE
);

-- Create Quizzes table
CREATE TABLE IF NOT EXISTS Quizzes (
    Id SERIAL PRIMARY KEY,
    Title VARCHAR(200) NOT NULL,
    Description VARCHAR(500),
    TimeLimit INTEGER NOT NULL DEFAULT 0, -- in minutes
    MaxAttempts INTEGER NOT NULL DEFAULT 1,
    IsRandomized BOOLEAN NOT NULL DEFAULT false,
    ShowCorrectAnswers BOOLEAN NOT NULL DEFAULT true,
    ShowResultsImmediately BOOLEAN NOT NULL DEFAULT true,
    PassingScore DECIMAL(5,2) NOT NULL DEFAULT 60,
    AvailableFrom TIMESTAMP WITH TIME ZONE,
    AvailableUntil TIMESTAMP WITH TIME ZONE,
    CourseId INTEGER NOT NULL,
    CreatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UpdatedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY (CourseId) REFERENCES Courses(Id) ON DELETE CASCADE
);

-- Create QuizQuestions table
CREATE TABLE IF NOT EXISTS QuizQuestions (
    Id SERIAL PRIMARY KEY,
    Question TEXT NOT NULL,
    CorrectAnswer TEXT NOT NULL,
    OptionA TEXT,
    OptionB TEXT,
    OptionC TEXT,
    OptionD TEXT,
    Explanation TEXT,
    Points DECIMAL(5,2) NOT NULL DEFAULT 1,
    "Order" INTEGER NOT NULL DEFAULT 0,
    Type VARCHAR(20) NOT NULL DEFAULT 'MultipleChoice',
    QuizId INTEGER NOT NULL,
    
    FOREIGN KEY (QuizId) REFERENCES Quizzes(Id) ON DELETE CASCADE
);

-- Create QuizAttempts table
CREATE TABLE IF NOT EXISTS QuizAttempts (
    Id SERIAL PRIMARY KEY,
    Score DECIMAL(5,2) NOT NULL DEFAULT 0,
    TimeSpent INTEGER NOT NULL DEFAULT 0, -- in minutes
    StartedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CompletedAt TIMESTAMP WITH TIME ZONE,
    IsPassed BOOLEAN NOT NULL DEFAULT false,
    Answers TEXT, -- JSON string of user answers
    UserId INTEGER NOT NULL,
    QuizId INTEGER NOT NULL,
    
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (QuizId) REFERENCES Quizzes(Id) ON DELETE CASCADE
);

-- Create Progress table
CREATE TABLE IF NOT EXISTS Progress (
    Id SERIAL PRIMARY KEY,
    CompletionPercentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    LessonsCompleted INTEGER NOT NULL DEFAULT 0,
    TotalLessons INTEGER NOT NULL DEFAULT 0,
    AssignmentsCompleted INTEGER NOT NULL DEFAULT 0,
    TotalAssignments INTEGER NOT NULL DEFAULT 0,
    QuizzesCompleted INTEGER NOT NULL DEFAULT 0,
    TotalQuizzes INTEGER NOT NULL DEFAULT 0,
    LastAccessedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CompletedAt TIMESTAMP WITH TIME ZONE,
    UserId INTEGER NOT NULL,
    CourseId INTEGER NOT NULL,
    
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (CourseId) REFERENCES Courses(Id) ON DELETE CASCADE,
    UNIQUE (UserId, CourseId)
);

-- Create Certificates table
CREATE TABLE IF NOT EXISTS Certificates (
    Id SERIAL PRIMARY KEY,
    CertificateNumber VARCHAR(50) NOT NULL UNIQUE,
    CertificateUrl VARCHAR(500),
    IssuedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ExpiresAt TIMESTAMP WITH TIME ZONE,
    IsValid BOOLEAN NOT NULL DEFAULT true,
    VerificationCode VARCHAR(100),
    UserId INTEGER NOT NULL,
    CourseId INTEGER NOT NULL,
    
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (CourseId) REFERENCES Courses(Id) ON DELETE CASCADE
);
