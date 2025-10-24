-- Insert Sample Data for ELearning Database (PostgreSQL)
-- This script inserts sample data for testing and development

-- Connect to the ELearning database
\c ELearning;

-- Insert sample categories
INSERT INTO Categories (Name, Description, Icon, Color, IsActive) VALUES
('Programming', 'Learn various programming languages and frameworks', 'code', '#3498db', true),
('Web Development', 'Frontend and backend web development courses', 'globe', '#e74c3c', true),
('Data Science', 'Data analysis, machine learning, and AI courses', 'chart', '#2ecc71', true),
('Design', 'UI/UX design, graphic design, and creative courses', 'palette', '#f39c12', true),
('Business', 'Business skills, entrepreneurship, and management', 'briefcase', '#9b59b6', true),
('Marketing', 'Digital marketing, SEO, and advertising courses', 'megaphone', '#e67e22', true);

-- Insert sample users (passwords are hashed versions of 'password123')
INSERT INTO Users (Email, FirstName, LastName, PasswordHash, DateOfBirth, PhoneNumber, Address, Role, IsActive) VALUES
('admin@elearning.com', 'Admin', 'User', '$2a$11$K8Y1OjvJ8Y1OjvJ8Y1OjvO', '1990-01-01', '+1234567890', '123 Admin St, City, State', 'Admin', true),
('instructor1@elearning.com', 'John', 'Smith', '$2a$11$K8Y1OjvJ8Y1OjvJ8Y1OjvO', '1985-05-15', '+1234567891', '456 Instructor Ave, City, State', 'Instructor', true),
('instructor2@elearning.com', 'Sarah', 'Johnson', '$2a$11$K8Y1OjvJ8Y1OjvJ8Y1OjvO', '1988-03-22', '+1234567892', '789 Teacher Blvd, City, State', 'Instructor', true),
('student1@elearning.com', 'Mike', 'Wilson', '$2a$11$K8Y1OjvJ8Y1OjvJ8Y1OjvO', '1995-07-10', '+1234567893', '321 Student Rd, City, State', 'Student', true),
('student2@elearning.com', 'Emily', 'Davis', '$2a$11$K8Y1OjvJ8Y1OjvJ8Y1OjvO', '1998-11-25', '+1234567894', '654 Learner Ln, City, State', 'Student', true),
('student3@elearning.com', 'David', 'Brown', '$2a$11$K8Y1OjvJ8Y1OjvJ8Y1OjvO', '1993-09-18', '+1234567895', '987 Education St, City, State', 'Student', true);

-- Insert sample courses
INSERT INTO Courses (Title, Description, Thumbnail, Price, IsFree, Level, Status, Duration, Prerequisites, LearningOutcomes, InstructorId, CategoryId, PublishedAt) VALUES
('Complete Web Development Bootcamp', 'Learn HTML, CSS, JavaScript, React, Node.js, and more to become a full-stack developer', 'web-dev-thumb.jpg', 299.99, false, 'Beginner', 'Published', 120, 'Basic computer skills', 'Build responsive websites, Create web applications, Understand databases', 2, 2, NOW()),
('Python for Data Science', 'Master Python programming for data analysis, machine learning, and visualization', 'python-ds-thumb.jpg', 199.99, false, 'Intermediate', 'Published', 80, 'Basic programming knowledge', 'Analyze data with Python, Build machine learning models, Create data visualizations', 3, 3, NOW()),
('UI/UX Design Fundamentals', 'Learn design principles, user research, wireframing, and prototyping', 'ui-ux-thumb.jpg', 149.99, false, 'Beginner', 'Published', 60, 'No prerequisites', 'Design user interfaces, Conduct user research, Create prototypes', 2, 4, NOW()),
('JavaScript Fundamentals', 'Master JavaScript from basics to advanced concepts', 'js-thumb.jpg', 0.00, true, 'Beginner', 'Published', 40, 'Basic HTML/CSS knowledge', 'Write JavaScript code, Understand DOM manipulation, Build interactive websites', 3, 1, NOW()),
('Digital Marketing Mastery', 'Complete guide to digital marketing strategies and tools', 'digital-marketing-thumb.jpg', 249.99, false, 'Intermediate', 'Published', 100, 'Basic business knowledge', 'Create marketing campaigns, Use analytics tools, Optimize for conversions', 2, 6, NOW());

-- Insert sample lessons
INSERT INTO Lessons (Title, Content, VideoUrl, Duration, "Order", IsFree, Type, CourseId) VALUES
('Introduction to HTML', 'Learn the basics of HTML structure and elements', 'https://example.com/video1.mp4', 30, 1, true, 'Video', 1),
('CSS Styling', 'Master CSS for beautiful web design', 'https://example.com/video2.mp4', 45, 2, false, 'Video', 1),
('JavaScript Basics', 'Introduction to JavaScript programming', 'https://example.com/video3.mp4', 60, 3, false, 'Video', 1),
('Python Variables and Data Types', 'Learn about Python variables, strings, numbers, and data structures', 'https://example.com/video4.mp4', 25, 1, false, 'Video', 2),
('Data Analysis with Pandas', 'Use Pandas library for data manipulation and analysis', 'https://example.com/video5.mp4', 40, 2, false, 'Video', 2),
('Design Principles', 'Understanding color theory, typography, and layout', 'https://example.com/video6.mp4', 35, 1, false, 'Video', 3),
('User Research Methods', 'Learn how to conduct effective user research', 'https://example.com/video7.mp4', 50, 2, false, 'Video', 3),
('JavaScript Variables', 'Understanding variables, data types, and operators', 'https://example.com/video8.mp4', 20, 1, true, 'Video', 4),
('Functions and Scope', 'Learn about JavaScript functions and variable scope', 'https://example.com/video9.mp4', 30, 2, true, 'Video', 4),
('Marketing Strategy Overview', 'Introduction to digital marketing strategies', 'https://example.com/video10.mp4', 45, 1, false, 'Video', 5);

-- Insert sample enrollments
INSERT INTO Enrollments (UserId, CourseId, EnrolledAt, Status) VALUES
(4, 1, NOW(), 'Active'),
(4, 4, NOW(), 'Active'),
(5, 1, NOW(), 'Active'),
(5, 2, NOW(), 'Active'),
(5, 3, NOW(), 'Active'),
(6, 1, NOW(), 'Active'),
(6, 2, NOW(), 'Active'),
(6, 4, NOW(), 'Active');

-- Insert sample assignments
INSERT INTO Assignments (Title, Description, Instructions, MaxPoints, DueDate, AllowLateSubmission, Type, CourseId) VALUES
('Build a Personal Website', 'Create a personal portfolio website using HTML, CSS, and JavaScript', 'Use the skills learned in the course to build a responsive website with at least 3 pages', 100.00, NOW() + INTERVAL '14 days', true, 'FileUpload', 1),
('Data Analysis Project', 'Analyze a dataset and create visualizations', 'Choose a dataset from Kaggle and perform exploratory data analysis', 100.00, NOW() + INTERVAL '21 days', true, 'FileUpload', 2),
('Design a Mobile App Interface', 'Create wireframes and mockups for a mobile app', 'Design a complete user interface for a mobile application', 100.00, NOW() + INTERVAL '10 days', false, 'FileUpload', 3),
('JavaScript Calculator', 'Build a calculator using JavaScript', 'Create a functional calculator with basic arithmetic operations', 50.00, NOW() + INTERVAL '7 days', true, 'CodeSubmission', 4),
('Marketing Campaign Plan', 'Develop a comprehensive digital marketing campaign', 'Create a detailed marketing strategy for a fictional product', 100.00, NOW() + INTERVAL '28 days', true, 'Essay', 5);

-- Insert sample quizzes
INSERT INTO Quizzes (Title, Description, TimeLimit, MaxAttempts, PassingScore, CourseId) VALUES
('HTML and CSS Quiz', 'Test your knowledge of HTML and CSS fundamentals', 30, 3, 70.00, 1),
('Python Data Types Quiz', 'Quiz on Python variables, strings, and data structures', 20, 2, 80.00, 2),
('Design Principles Quiz', 'Test your understanding of design fundamentals', 25, 2, 75.00, 3),
('JavaScript Basics Quiz', 'Quiz on JavaScript fundamentals', 15, 3, 70.00, 4),
('Digital Marketing Quiz', 'Test your knowledge of digital marketing concepts', 35, 2, 75.00, 5);

-- Insert sample quiz questions
INSERT INTO QuizQuestions (Question, CorrectAnswer, OptionA, OptionB, OptionC, OptionD, Points, "Order", Type, QuizId) VALUES
('What does HTML stand for?', 'HyperText Markup Language', 'HyperText Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink and Text Markup Language', 10.00, 1, 'MultipleChoice', 1),
('Which CSS property is used to change text color?', 'color', 'text-color', 'color', 'font-color', 'text-style', 10.00, 2, 'MultipleChoice', 1),
('What is the correct way to create a list in HTML?', '<ul><li>Item</li></ul>', '<list><item>Item</item></list>', '<ul><li>Item</li></ul>', '<ol><li>Item</li></ol>', '<dl><dt>Item</dt></dl>', 10.00, 3, 'MultipleChoice', 1),
('Which Python data type is mutable?', 'list', 'string', 'tuple', 'list', 'int', 10.00, 1, 'MultipleChoice', 2),
('What is the primary purpose of user research in UX design?', 'To understand user needs and behaviors', 'To make designs look pretty', 'To understand user needs and behaviors', 'To reduce development costs', 'To increase website speed', 10.00, 1, 'MultipleChoice', 3);

-- Insert sample progress
INSERT INTO Progress (CompletionPercentage, LessonsCompleted, TotalLessons, LastAccessedAt, UserId, CourseId) VALUES
(25.00, 1, 4, NOW(), 4, 1),
(50.00, 2, 4, NOW(), 4, 4),
(33.33, 1, 3, NOW(), 5, 1),
(50.00, 1, 2, NOW(), 5, 2),
(33.33, 1, 3, NOW(), 5, 3),
(25.00, 1, 4, NOW(), 6, 1),
(50.00, 1, 2, NOW(), 6, 2),
(50.00, 2, 4, NOW(), 6, 4);
