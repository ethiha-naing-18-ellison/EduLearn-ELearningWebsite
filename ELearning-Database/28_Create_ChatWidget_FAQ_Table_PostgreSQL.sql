-- Create Chat Widget FAQ/Q&A Tables for ELearning Database (PostgreSQL)
-- This script creates tables for storing FAQ questions and answers for the chat widget

-- Connect to the ELearning database
\c ELearning;

-- Create FAQCategories table for organizing FAQs
CREATE TABLE IF NOT EXISTS "FAQCategories" (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(500),
    "Icon" VARCHAR(255),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create FAQs table for storing questions and answers
CREATE TABLE IF NOT EXISTS "FAQs" (
    "Id" SERIAL PRIMARY KEY,
    "Question" VARCHAR(500) NOT NULL,
    "Answer" TEXT NOT NULL,
    "CategoryId" INTEGER,
    "Keywords" VARCHAR(500), -- Comma-separated keywords for better search matching
    "ViewCount" INTEGER NOT NULL DEFAULT 0,
    "HelpfulCount" INTEGER NOT NULL DEFAULT 0,
    "NotHelpfulCount" INTEGER NOT NULL DEFAULT 0,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "Priority" INTEGER NOT NULL DEFAULT 0, -- Higher priority FAQs shown first
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY ("CategoryId") REFERENCES "FAQCategories"("Id") ON DELETE SET NULL
);

-- Create ChatConversations table for tracking user chat sessions
CREATE TABLE IF NOT EXISTS "ChatConversations" (
    "Id" SERIAL PRIMARY KEY,
    "SessionId" VARCHAR(255) NOT NULL, -- Unique session identifier (can be user ID or session token)
    "UserId" INTEGER, -- Optional: link to Users table if user is logged in
    "StartedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "LastActivityAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    
    FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE SET NULL
);

-- Create ChatMessages table for storing individual chat messages
CREATE TABLE IF NOT EXISTS "ChatMessages" (
    "Id" SERIAL PRIMARY KEY,
    "ConversationId" INTEGER NOT NULL,
    "Message" TEXT NOT NULL,
    "IsFromUser" BOOLEAN NOT NULL DEFAULT true, -- true for user messages, false for bot responses
    "FAQId" INTEGER, -- Link to FAQ if the response came from an FAQ
    "IsHelpful" BOOLEAN, -- User feedback: true/false/null
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY ("ConversationId") REFERENCES "ChatConversations"("Id") ON DELETE CASCADE,
    FOREIGN KEY ("FAQId") REFERENCES "FAQs"("Id") ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_faqs_category ON "FAQs"("CategoryId");
CREATE INDEX IF NOT EXISTS idx_faqs_active ON "FAQs"("IsActive");
CREATE INDEX IF NOT EXISTS idx_faqs_priority ON "FAQs"("Priority" DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_session ON "ChatConversations"("SessionId");
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user ON "ChatConversations"("UserId");
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON "ChatMessages"("ConversationId");
CREATE INDEX IF NOT EXISTS idx_chat_messages_faq ON "ChatMessages"("FAQId");

-- Insert default FAQ categories
INSERT INTO "FAQCategories" ("Name", "Description", "Icon", "IsActive") VALUES
('Platform', 'Information about AUNG platform and what we offer', 'school', true),
('Instructors', 'Questions about course instructors and teaching', 'people', true),
('Courses', 'Information about courses, pricing, and enrollment', 'menu_book', true),
('Learning', 'How to start learning and navigate the platform', 'play_circle', true),
('Payment', 'Payment methods, pricing, and billing questions', 'payment', true)
ON CONFLICT DO NOTHING;

-- Insert comprehensive FAQs covering all required topics
INSERT INTO "FAQs" ("Question", "Answer", "CategoryId", "Keywords", "Priority", "IsActive") VALUES

-- 1. LEARNING PLATFORM INFORMATION (CategoryId = 1)
('What is AUNG?', 'AUNG (Advanced Upskilling & New Growth) is an online learning platform that provides high-quality courses across various fields including Programming, Web Development, Data Science, Design, and Business. We offer self-paced courses with expert instructors, interactive content, progress tracking, and certificates upon completion. Our mission is to make quality education accessible to everyone and help learners achieve advanced upskilling and new growth in their careers.', 1, 'what is aung, platform, learning platform, about us, who are you, what do you do, advanced upskilling, new growth', 10, true),
('What does AUNG offer?', 'AUNG (Advanced Upskilling & New Growth) offers comprehensive online courses with video lessons, assignments, quizzes, and downloadable materials. You can learn at your own pace, track your progress, earn certificates, and access course materials anytime. We also provide expert instructors, interactive content, and a supportive learning community to help you achieve your learning goals.', 1, 'what do you offer, services, features, what can I learn, aung offers', 10, true),
('Who can use AUNG?', 'AUNG (Advanced Upskilling & New Growth) is designed for anyone who wants to learn new skills or advance their career. Whether you are a beginner looking to start learning, a professional seeking to upgrade your skills, or someone exploring new interests, our platform welcomes learners of all levels who are committed to advanced upskilling and new growth.', 1, 'who can use, target audience, learners, students, who can learn', 9, true),

-- 2. ABOUT INSTRUCTORS (CategoryId = 2)
('Who are the instructors?', 'Our instructors are experienced professionals and experts in their respective fields. They include industry professionals, certified educators, and subject matter experts who bring real-world experience to their teaching. Each instructor is carefully selected based on their expertise, teaching ability, and commitment to student success.', 2, 'instructors, teachers, who teaches, who are instructors, about instructors', 10, true),
('What qualifications do instructors have?', 'Our instructors have extensive experience in their fields, including professional certifications, industry experience, and proven teaching abilities. Many hold advanced degrees and have years of practical experience. We ensure all instructors meet our high standards for quality education.', 2, 'instructor qualifications, teacher credentials, instructor experience', 9, true),
('How do I become an instructor?', 'If you are an expert in your field and passionate about teaching, you can apply to become an instructor. Contact us through our support channels or visit the instructor application page. We review applications based on expertise, teaching experience, and course proposals.', 2, 'become instructor, teach courses, instructor application, how to teach', 8, true),
('Can I contact instructors directly?', 'Yes! You can interact with instructors through course discussions, Q&A sections, and messaging features within enrolled courses. Instructors are committed to helping students succeed and regularly respond to questions and provide feedback.', 2, 'contact instructor, message instructor, instructor communication', 7, true),

-- 3. ABOUT COURSES - FREE OR PAID (CategoryId = 3)
('Are courses free or paid?', 'AUNG (Advanced Upskilling & New Growth) offers both free and paid courses. Free courses provide full access to course materials, lessons, and basic features. Paid courses may include additional content, premium features, certificates, and direct instructor support. Course pricing is clearly displayed on each course page.', 3, 'free courses, paid courses, course pricing, cost, price, free or paid', 10, true),
('What is the difference between free and paid courses?', 'Free courses give you access to all course materials and lessons. Paid courses may include additional benefits such as premium content, downloadable resources, certificates of completion, priority instructor support, and exclusive assignments. Both types allow you to learn at your own pace.', 3, 'difference free paid, free vs paid, what included', 10, true),
('What types of courses are available?', 'We offer courses in multiple categories including Programming (Python, JavaScript, Java, etc.), Web Development (Frontend, Backend, Full Stack), Data Science, UI/UX Design, Business, Marketing, and more. Courses range from beginner to advanced levels to suit all learners.', 3, 'course types, categories, what courses, available courses, course topics', 9, true),
('How long are the courses?', 'Course duration varies depending on the content and complexity. Most courses range from a few hours to several weeks of content. Since courses are self-paced, you can complete them at your own speed. The estimated duration is shown on each course page.', 3, 'course duration, how long, course length, time to complete', 8, true),
('Can I preview courses before enrolling?', 'Yes! Most courses offer free previews including course introduction, sample lessons, and course outline. You can browse course content, read instructor profiles, and check reviews before deciding to enroll.', 3, 'preview course, course preview, try before buy, sample', 8, true),

-- 4. HOW TO START LEARNING (CategoryId = 4)
('How do I start learning?', 'To start learning: 1) Create a free account by clicking "Register" in the top navigation, 2) Browse courses on the "Courses" page, 3) Select a course that interests you, 4) Click "Enroll" or "Start Learning", 5) Begin with the first lesson. It''s that simple!', 4, 'how to start, start learning, begin, get started, how to begin', 10, true),
('How do I create an account?', 'Click the "Register" button in the top navigation bar. Fill in your details including email address, first name, last name, and password. After registration, verify your email if required, then log in to start exploring and enrolling in courses.', 4, 'create account, register, sign up, account registration', 10, true),
('How do I enroll in a course?', 'Browse courses on the "Courses" page, click on a course to view details, and click the "Enroll" or "Start Learning" button. For paid courses, you''ll complete payment first. Once enrolled, the course appears in your "My Courses" section and you can start learning immediately.', 4, 'enroll, enrollment, join course, how to enroll, start course', 10, true),
('How do I navigate the website?', 'Use the top navigation bar to access: "Courses" to browse all courses, "Dashboard" for your learning hub, "My Courses" to see enrolled courses, and your profile menu for account settings. The homepage shows featured courses and learning resources.', 4, 'navigate, navigation, how to use, website navigation, menu', 9, true),
('What is the Dashboard?', 'The Dashboard is your personal learning hub showing enrolled courses, progress tracking, recent activity, upcoming assignments, achievements, and quick access to continue learning. It helps you stay organized and track your learning journey.', 4, 'dashboard, what is dashboard, learning hub, my dashboard', 9, true),
('Can I learn at my own pace?', 'Absolutely! All courses are self-paced, meaning you can learn whenever and wherever you want. There are no deadlines or fixed schedules. You can pause, rewind, and review lessons as many times as needed to fully understand the material.', 4, 'self-paced, own pace, flexible learning, schedule, timing', 9, true),
('How do I track my progress?', 'Your progress is automatically tracked as you complete lessons, assignments, and quizzes. Visit your Dashboard to see completion percentages, course progress, and achievements. Each course shows your progress bar and completed sections.', 4, 'track progress, progress tracking, completion, how far', 8, true),

-- 5. HOW TO DO PAYMENT (CategoryId = 5)
('How do I pay for courses?', 'To pay for a course: 1) Select a paid course and click "Enroll", 2) You''ll be redirected to the payment page, 3) Choose your payment method (credit card, debit card, or other available options), 4) Enter payment details securely, 5) Complete the transaction. Once payment is confirmed, you''ll have immediate access to the course.', 5, 'how to pay, payment, pay for course, payment method, how to purchase', 10, true),
('What payment methods are accepted?', 'We accept major credit cards (Visa, MasterCard, American Express), debit cards, and other secure payment methods. All payments are processed through secure payment gateways to ensure your financial information is protected. Payment options are displayed during checkout.', 5, 'payment methods, credit card, debit card, payment options, how to pay', 10, true),
('Is payment secure?', 'Yes, all payments are processed through secure, encrypted payment gateways. We use industry-standard security measures to protect your financial information. We never store your full credit card details on our servers.', 5, 'secure payment, payment security, safe, secure, protection', 9, true),
('What is the refund policy?', 'We offer a refund policy for paid courses. If you are not satisfied with a course within the specified refund period (usually 30 days), you can request a refund through your account settings or by contacting support. Refunds are processed to your original payment method.', 5, 'refund, refund policy, money back, return, cancel', 9, true),
('Are there any discounts or promotions?', 'Yes! We regularly offer discounts, promotions, and special deals on courses. Check our homepage, newsletter, or follow us on social media to stay updated on current offers. Some courses may also have early-bird pricing or bundle discounts.', 5, 'discount, promotion, sale, special offer, coupon, deal', 8, true),
('Can I get a certificate?', 'Yes! Upon successful completion of a course, you will receive a certificate of completion. Certificates are automatically generated and can be downloaded from your Dashboard. Some free courses also offer certificates, while paid courses typically include verified certificates.', 5, 'certificate, certification, completion certificate, certificate of completion', 8, true)
ON CONFLICT DO NOTHING;
