-- Add Action Buttons to Relevant FAQs
-- This script adds quick action buttons to FAQs that should have navigation options

-- Connect to the ELearning database
\c ELearning;

-- Update FAQs with action buttons
-- ActionButton format: {"text": "Button Text", "path": "/route", "type": "navigation"}

-- 1. Instructor-related FAQs -> Navigate to Register page (with instructor role)
UPDATE "FAQs"
SET "ActionButton" = '{"text": "Sign Up as Instructor", "path": "/register", "type": "navigation"}'::jsonb
WHERE LOWER("Question") LIKE '%become instructor%' 
   OR LOWER("Question") LIKE '%how can i become instructor%'
   OR LOWER("Question") LIKE '%instructor application%'
   OR LOWER("Question") LIKE '%teach courses%';

-- 2. Course-related FAQs -> Navigate to Courses page
UPDATE "FAQs"
SET "ActionButton" = '{"text": "Browse Courses", "path": "/courses", "type": "navigation"}'::jsonb
WHERE ("CategoryId" = 3 OR "CategoryId" = 4) -- About Courses or Getting Started categories
   AND (LOWER("Question") LIKE '%course%' 
        OR LOWER("Question") LIKE '%learn%'
        OR LOWER("Question") LIKE '%enroll%'
        OR LOWER("Question") LIKE '%start learning%'
        OR LOWER("Question") LIKE '%find courses%'
        OR LOWER("Question") LIKE '%browse courses%')
   AND LOWER("Question") NOT LIKE '%become instructor%'
   AND LOWER("Question") NOT LIKE '%instructor%'
   AND LOWER("Question") NOT LIKE '%signup%'
   AND LOWER("Question") NOT LIKE '%sign up%'
   AND LOWER("Question") NOT LIKE '%register%';

-- 3. Registration/Account FAQs -> Navigate to Register page
UPDATE "FAQs"
SET "ActionButton" = '{"text": "Sign Up", "path": "/register", "type": "navigation"}'::jsonb
WHERE ("CategoryId" = 6 -- Account category
   OR LOWER("Question") LIKE '%register%'
   OR LOWER("Question") LIKE '%sign up%'
   OR LOWER("Question") LIKE '%signup%'
   OR LOWER("Question") LIKE '%create account%'
   OR LOWER("Question") LIKE '%new account%'
   OR LOWER("Question") LIKE '%how can i signup%'
   OR LOWER("Question") LIKE '%how can i sign up%'
   OR LOWER("Question") LIKE '%how do i signup%'
   OR LOWER("Question") LIKE '%how do i sign up%'
   OR LOWER("Question") LIKE '%how to signup%'
   OR LOWER("Question") LIKE '%how to sign up%')
   AND LOWER("Question") NOT LIKE '%become instructor%';

-- 4. Login FAQs -> Navigate to Login page
UPDATE "FAQs"
SET "ActionButton" = '{"text": "Go to Login", "path": "/login", "type": "navigation"}'::jsonb
WHERE ("CategoryId" = 6 OR LOWER("Question") LIKE '%login%' OR LOWER("Question") LIKE '%sign in%')
   AND (LOWER("Question") LIKE '%login%'
        OR LOWER("Question") LIKE '%sign in%'
        OR LOWER("Question") LIKE '%cannot login%'
        OR LOWER("Question") LIKE '%log in%');

-- 5. Dashboard/My Courses FAQs -> Navigate to Dashboard (for enrolled users) or My Courses
UPDATE "FAQs"
SET "ActionButton" = '{"text": "Go to Dashboard", "path": "/dashboard", "type": "navigation"}'::jsonb
WHERE LOWER("Question") LIKE '%dashboard%'
   OR LOWER("Question") LIKE '%my courses%'
   OR LOWER("Question") LIKE '%enrolled courses%';

-- 6. Profile FAQs -> Navigate to Profile page
UPDATE "FAQs"
SET "ActionButton" = '{"text": "Go to Profile", "path": "/profile", "type": "navigation"}'::jsonb
WHERE LOWER("Question") LIKE '%profile%'
   OR LOWER("Question") LIKE '%update profile%'
   OR LOWER("Question") LIKE '%edit profile%'
   OR LOWER("Question") LIKE '%account settings%';

-- 7. Payment FAQs -> Navigate to Courses page (where they can see pricing and enroll)
UPDATE "FAQs"
SET "ActionButton" = '{"text": "View Courses", "path": "/courses", "type": "navigation"}'::jsonb
WHERE "CategoryId" = 5 -- Payment category
   AND (LOWER("Question") LIKE '%pay%'
        OR LOWER("Question") LIKE '%payment%'
        OR LOWER("Question") LIKE '%purchase%'
        OR LOWER("Question") LIKE '%buy%'
        OR LOWER("Question") LIKE '%cost%'
        OR LOWER("Question") LIKE '%price%');

-- 8. Getting Started FAQs -> Navigate to Courses page or Register
UPDATE "FAQs"
SET "ActionButton" = '{"text": "Browse Courses", "path": "/courses", "type": "navigation"}'::jsonb
WHERE "CategoryId" = 4 -- Getting Started category
   AND (LOWER("Question") LIKE '%start%'
        OR LOWER("Question") LIKE '%begin%'
        OR LOWER("Question") LIKE '%getting started%'
        OR LOWER("Question") LIKE '%how to start%'
        OR LOWER("Question") LIKE '%how do i start%')
   AND LOWER("Question") NOT LIKE '%become instructor%'
   AND LOWER("Question") NOT LIKE '%signup%'
   AND LOWER("Question") NOT LIKE '%sign up%'
   AND LOWER("Question") NOT LIKE '%register%'
   AND LOWER("Question") NOT LIKE '%create account%';
