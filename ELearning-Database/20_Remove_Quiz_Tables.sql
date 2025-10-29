-- ===========================================
-- REMOVE QUIZ TABLES FROM DATABASE
-- ===========================================

-- Connect to ELearning database
\c ELearning;

-- Drop quiz-related tables in the correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS "QuizAttempts" CASCADE;
DROP TABLE IF EXISTS "QuizQuestions" CASCADE;
DROP TABLE IF EXISTS "Quizzes" CASCADE;

-- Verify tables were dropped
SELECT 'Quiz tables removed successfully!' as Status,
       'Ready to create new quiz type tables' as Next_Step;
