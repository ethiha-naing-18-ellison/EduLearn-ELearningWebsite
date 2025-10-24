# ELearning Database

This directory contains the SQL scripts for creating and setting up the ELearning database.

## Database Information
- **Server Name**: ELearning
- **Database Name**: ELearning
- **Password**: thiha1234

## Scripts Overview

### 1. 01_Create_Database.sql
- Creates the ELearning database
- Sets up database user and permissions
- Configures database security

### 2. 02_Create_Tables.sql
- Creates all necessary tables for the E-Learning platform
- Includes tables for:
  - Users (students, instructors, admins)
  - Courses and Categories
  - Lessons and Enrollments
  - Assignments and Submissions
  - Quizzes and Quiz Attempts
  - Progress tracking
  - Certificates

### 3. 03_Create_Indexes.sql
- Creates indexes for optimal query performance
- Includes indexes on frequently queried columns
- Improves search and filtering operations

### 4. 04_Insert_Sample_Data.sql
- Inserts sample data for testing and development
- Includes sample users, courses, lessons, and enrollments
- Provides realistic test data for development

### 5. 05_Create_Stored_Procedures.sql
- Creates useful stored procedures for common operations
- Includes procedures for:
  - Getting user enrollments
  - Course statistics
  - User progress tracking
  - Course search functionality
  - Dashboard data

### 6. 06_Create_Views.sql
- Creates useful views for common queries
- Includes views for:
  - Course details with instructor information
  - User enrollments with progress
  - Assignment submissions
  - Quiz attempts
  - Certificates
  - Course analytics

## Database Schema

### Core Tables
- **Users**: Stores user information (students, instructors, admins)
- **Categories**: Course categories for organization
- **Courses**: Course information and metadata
- **Lessons**: Individual lessons within courses
- **Enrollments**: Student course enrollments
- **Assignments**: Course assignments
- **Submissions**: Student assignment submissions
- **Quizzes**: Course quizzes and assessments
- **QuizQuestions**: Individual quiz questions
- **QuizAttempts**: Student quiz attempts
- **Progress**: Student progress tracking
- **Certificates**: Course completion certificates

### Key Features
- **User Roles**: Student, Instructor, Admin
- **Course Management**: Full CRUD operations for courses
- **Progress Tracking**: Detailed progress monitoring
- **Assessment System**: Assignments and quizzes
- **Certification**: Automatic certificate generation
- **Analytics**: Comprehensive reporting and analytics

## Installation Instructions

1. **Run the scripts in order**:
   ```sql
   -- Execute scripts in this order:
   -- 01_Create_Database.sql
   -- 02_Create_Tables.sql
   -- 03_Create_Indexes.sql
   -- 04_Insert_Sample_Data.sql
   -- 05_Create_Stored_Procedures.sql
   -- 06_Create_Views.sql
   ```

2. **Verify installation**:
   - Check that all tables are created
   - Verify sample data is inserted
   - Test stored procedures and views

## Connection String
```
Server=ELearning;Database=ELearning;User Id=sa;Password=thiha1234;TrustServerCertificate=true;
```

## Sample Data
The database includes sample data for:
- 6 users (1 admin, 2 instructors, 3 students)
- 5 courses across different categories
- 10 lessons with various content types
- 8 student enrollments
- 5 assignments
- 5 quizzes with questions
- Progress tracking data

## Security Notes
- All passwords are hashed using BCrypt
- JWT tokens are used for authentication
- Role-based access control is implemented
- Database user has appropriate permissions

## Maintenance
- Regular backups recommended
- Monitor performance with indexes
- Update statistics regularly
- Consider partitioning for large tables
