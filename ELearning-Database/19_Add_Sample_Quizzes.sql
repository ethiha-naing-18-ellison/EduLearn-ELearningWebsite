-- ===========================================
-- ADD SAMPLE QUIZZES AND QUIZ QUESTIONS
-- ===========================================

-- Connect to ELearning database
\c ELearning;

-- First, let's add some sample courses if they don't exist
INSERT INTO "Courses" ("Title", "Description", "Thumbnail", "Price", "IsFree", "Level", "Status", "Duration", "InstructorId", "CategoryId", "PublishedAt") VALUES
('Web Development Fundamentals', 'Learn the basics of web development including HTML, CSS, and JavaScript', 'https://via.placeholder.com/300x200', 99.99, false, 'Beginner', 'Published', 120, 2, 1, NOW()),
('Advanced React Development', 'Master React with hooks, context, and advanced patterns', 'https://via.placeholder.com/300x200', 149.99, false, 'Intermediate', 'Published', 180, 2, 1, NOW()),
('Data Science with Python', 'Complete data science course using Python and machine learning', 'https://via.placeholder.com/300x200', 199.99, false, 'Advanced', 'Published', 240, 3, 3, NOW())
ON CONFLICT DO NOTHING;

-- Add sample quizzes
INSERT INTO "Quizzes" ("Title", "Description", "TimeLimit", "MaxAttempts", "IsRandomized", "ShowCorrectAnswers", "ShowResultsImmediately", "PassingScore", "AvailableFrom", "AvailableUntil", "CourseId") VALUES
('HTML Basics Quiz', 'Test your knowledge of HTML fundamentals', 30, 3, false, true, true, 70.0, NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days', 1),
('CSS Fundamentals Quiz', 'Quiz on CSS properties and selectors', 25, 2, false, true, true, 75.0, NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days', 1),
('JavaScript Basics Quiz', 'Test JavaScript syntax and concepts', 35, 3, false, true, true, 80.0, NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days', 1),
('React Hooks Quiz', 'Advanced quiz on React hooks and patterns', 45, 2, false, true, true, 85.0, NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days', 2),
('Python Data Types Quiz', 'Quiz on Python data types and structures', 20, 3, false, true, true, 70.0, NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days', 3)
ON CONFLICT DO NOTHING;

-- Add sample quiz questions for HTML Basics Quiz (Quiz ID 1)
INSERT INTO "QuizQuestions" ("Question", "CorrectAnswer", "OptionA", "OptionB", "OptionC", "OptionD", "Explanation", "Points", "Order", "Type", "QuizId") VALUES
('What does HTML stand for?', 'HyperText Markup Language', 'HyperText Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink and Text Markup Language', 'HTML stands for HyperText Markup Language, which is the standard markup language for creating web pages.', 1.0, 1, 'MultipleChoice', 1),
('Which HTML tag is used to create a hyperlink?', '<a>', '<link>', '<a>', '<href>', '<url>', 'The <a> tag is used to create hyperlinks in HTML. The href attribute specifies the URL.', 1.0, 2, 'MultipleChoice', 1),
('What is the correct HTML element for the largest heading?', '<h1>', '<head>', '<h1>', '<heading>', '<h6>', '<h1> is the largest heading element in HTML, while <h6> is the smallest.', 1.0, 3, 'MultipleChoice', 1),
('Which attribute is used to specify the URL in a link?', 'href', 'src', 'href', 'link', 'url', 'The href attribute specifies the URL of the page the link goes to.', 1.0, 4, 'MultipleChoice', 1),
('What is the correct HTML for inserting an image?', '<img src="image.jpg" alt="My Image">', '<img src="image.jpg" alt="My Image">', '<image src="image.jpg" alt="My Image">', '<img href="image.jpg" alt="My Image">', '<picture src="image.jpg" alt="My Image">', 'The <img> tag is used to insert images. The src attribute specifies the image URL and alt provides alternative text.', 1.0, 5, 'MultipleChoice', 1);

-- Add sample quiz questions for CSS Fundamentals Quiz (Quiz ID 2)
INSERT INTO "QuizQuestions" ("Question", "CorrectAnswer", "OptionA", "OptionB", "OptionC", "OptionD", "Explanation", "Points", "Order", "Type", "QuizId") VALUES
('What does CSS stand for?', 'Cascading Style Sheets', 'Computer Style Sheets', 'Creative Style Sheets', 'Cascading Style Sheets', 'Colorful Style Sheets', 'CSS stands for Cascading Style Sheets, used to style HTML elements.', 1.0, 1, 'MultipleChoice', 2),
('Which property is used to change the text color?', 'color', 'text-color', 'color', 'font-color', 'text-style', 'The color property is used to set the color of text in CSS.', 1.0, 2, 'MultipleChoice', 2),
('How do you add a background color to an element?', 'background-color: red;', 'bg-color: red;', 'background-color: red;', 'color: red;', 'background: red;', 'The background-color property is used to set the background color of an element.', 1.0, 3, 'MultipleChoice', 2),
('Which property is used to change the font size?', 'font-size', 'text-size', 'font-size', 'size', 'text-font', 'The font-size property is used to set the size of the font.', 1.0, 4, 'MultipleChoice', 2),
('How do you make text bold in CSS?', 'font-weight: bold;', 'text: bold;', 'font-weight: bold;', 'bold: true;', 'style: bold;', 'The font-weight property with value bold is used to make text bold.', 1.0, 5, 'MultipleChoice', 2);

-- Add sample quiz questions for JavaScript Basics Quiz (Quiz ID 3)
INSERT INTO "QuizQuestions" ("Question", "CorrectAnswer", "OptionA", "OptionB", "OptionC", "OptionD", "Explanation", "Points", "Order", "Type", "QuizId") VALUES
('Which keyword is used to declare a variable in JavaScript?', 'var, let, or const', 'variable', 'var, let, or const', 'int', 'string', 'JavaScript uses var, let, or const to declare variables. let and const are preferred in modern JavaScript.', 1.0, 1, 'MultipleChoice', 3),
('What is the correct way to write a comment in JavaScript?', '// This is a comment', '<!-- This is a comment -->', '// This is a comment', '/* This is a comment */', 'Both B and C', 'JavaScript uses // for single-line comments and /* */ for multi-line comments.', 1.0, 2, 'MultipleChoice', 3),
('Which operator is used to assign a value to a variable?', '=', '==', '=', '===', '->', 'The = operator is used for assignment in JavaScript.', 1.0, 3, 'MultipleChoice', 3),
('What will this code return: typeof "Hello"?', 'string', 'number', 'string', 'boolean', 'object', 'The typeof operator returns "string" for string values.', 1.0, 4, 'MultipleChoice', 3),
('How do you create a function in JavaScript?', 'function myFunction() {}', 'function myFunction() {}', 'def myFunction():', 'function: myFunction()', 'create function myFunction()', 'Functions in JavaScript are created using the function keyword followed by the function name and parentheses.', 1.0, 5, 'MultipleChoice', 3);

-- Add sample quiz questions for React Hooks Quiz (Quiz ID 4)
INSERT INTO "QuizQuestions" ("Question", "CorrectAnswer", "OptionA", "OptionB", "OptionC", "OptionD", "Explanation", "Points", "Order", "Type", "QuizId") VALUES
('Which hook is used to manage state in functional components?', 'useState', 'useEffect', 'useState', 'useContext', 'useReducer', 'useState is the hook used to manage state in functional components.', 1.0, 1, 'MultipleChoice', 4),
('What does useEffect hook do?', 'Performs side effects in functional components', 'Manages state', 'Performs side effects in functional components', 'Handles events', 'Creates components', 'useEffect is used to perform side effects like data fetching, subscriptions, or manually changing the DOM.', 1.0, 2, 'MultipleChoice', 4),
('When does useEffect run by default?', 'After every render', 'Only once', 'After every render', 'Only when state changes', 'Never', 'useEffect runs after every render by default, but you can control this with the dependency array.', 1.0, 3, 'MultipleChoice', 4),
('Which hook is used to share data between components?', 'useContext', 'useState', 'useEffect', 'useContext', 'useReducer', 'useContext is used to share data between components without prop drilling.', 1.0, 4, 'MultipleChoice', 4),
('What is the purpose of the dependency array in useEffect?', 'Controls when the effect runs', 'Defines the effect function', 'Controls when the effect runs', 'Sets the initial state', 'Imports dependencies', 'The dependency array controls when useEffect runs - it runs when any value in the array changes.', 1.0, 5, 'MultipleChoice', 4);

-- Add sample quiz questions for Python Data Types Quiz (Quiz ID 5)
INSERT INTO "QuizQuestions" ("Question", "CorrectAnswer", "OptionA", "OptionB", "OptionC", "OptionD", "Explanation", "Points", "Order", "Type", "QuizId") VALUES
('Which data type is used to store text in Python?', 'str', 'int', 'str', 'float', 'bool', 'str (string) is used to store text data in Python.', 1.0, 1, 'MultipleChoice', 5),
('What is the data type of 3.14 in Python?', 'float', 'int', 'float', 'str', 'bool', '3.14 is a floating-point number, so its data type is float.', 1.0, 2, 'MultipleChoice', 5),
('Which data type is used to store a collection of items in Python?', 'list', 'tuple', 'list', 'set', 'All of the above', 'Python has several collection types: list, tuple, set, and dict. All can store collections of items.', 1.0, 3, 'MultipleChoice', 5),
('What is the data type of True in Python?', 'bool', 'int', 'str', 'bool', 'float', 'True is a boolean value, so its data type is bool.', 1.0, 4, 'MultipleChoice', 5),
('Which data type is immutable in Python?', 'tuple', 'list', 'tuple', 'dict', 'set', 'Tuples are immutable in Python, meaning they cannot be changed after creation.', 1.0, 5, 'MultipleChoice', 5);

-- Verify the data was inserted
SELECT 'Quiz Questions Added Successfully!' as Status,
       (SELECT COUNT(*) FROM "QuizQuestions") as Total_Questions,
       (SELECT COUNT(*) FROM "Quizzes") as Total_Quizzes,
       (SELECT COUNT(*) FROM "Courses") as Total_Courses;
