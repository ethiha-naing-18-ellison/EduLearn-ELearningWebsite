using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ELearning.API.Data;
using ELearning.API.Models;
using System.Text.RegularExpressions;

namespace ELearning.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatWidgetController : ControllerBase
    {
        private readonly ELearningDbContext _context;

        public ChatWidgetController(ELearningDbContext context)
        {
            _context = context;
        }

        // GET: api/ChatWidget/faqs
        [HttpGet("faqs")]
        public async Task<ActionResult<IEnumerable<object>>> GetFAQs([FromQuery] int? categoryId = null)
        {
            var query = _context.FAQs
                .Where(f => f.IsActive)
                .Include(f => f.Category)
                .AsQueryable();

            if (categoryId.HasValue)
            {
                query = query.Where(f => f.CategoryId == categoryId);
            }

            var faqs = await query
                .OrderByDescending(f => f.Priority)
                .ThenByDescending(f => f.ViewCount)
                .Select(f => new
                {
                    f.Id,
                    f.Question,
                    f.Answer,
                    CategoryId = f.CategoryId,
                    CategoryName = f.Category != null ? f.Category.Name : null,
                    f.Keywords,
                    f.ViewCount,
                    f.HelpfulCount,
                    f.NotHelpfulCount
                })
                .ToListAsync();

            return Ok(faqs);
        }

        // GET: api/ChatWidget/categories
        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<object>>> GetCategories()
        {
            var categories = await _context.FAQCategories
                .Where(c => c.IsActive)
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.Description,
                    c.Icon,
                    FAQCount = c.FAQs.Count(f => f.IsActive)
                })
                .ToListAsync();

            return Ok(categories);
        }

        // POST: api/ChatWidget/search
        [HttpPost("search")]
        public async Task<ActionResult<object>> SearchFAQ([FromBody] SearchRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Query))
            {
                return BadRequest(new { message = "Query is required" });
            }

            var query = request.Query.ToLower().Trim();
            var keywords = query.Split(' ', StringSplitOptions.RemoveEmptyEntries);

            // Search in FAQs
            var faqs = await _context.FAQs
                .Where(f => f.IsActive)
                .Include(f => f.Category)
                .ToListAsync();

            // Score FAQs based on relevance
            var scoredFAQs = faqs.Select(faq =>
            {
                var score = 0;
                var questionLower = faq.Question.ToLower();
                var answerLower = faq.Answer.ToLower();
                var keywordsLower = faq.Keywords?.ToLower() ?? "";

                // Exact question match (highest priority)
                if (questionLower.Contains(query))
                    score += 100;

                // Keyword matches in question
                foreach (var keyword in keywords)
                {
                    if (questionLower.Contains(keyword))
                        score += 10;
                    if (keywordsLower.Contains(keyword))
                        score += 5;
                    if (answerLower.Contains(keyword))
                        score += 2;
                }

                // Boost by priority and view count
                score += faq.Priority * 2;
                score += (int)(faq.ViewCount * 0.1);

                return new { FAQ = faq, Score = score };
            })
            .Where(x => x.Score > 0)
            .OrderByDescending(x => x.Score)
            .Take(5)
            .Select(x => new
            {
                x.FAQ.Id,
                x.FAQ.Question,
                x.FAQ.Answer,
                CategoryId = x.FAQ.CategoryId,
                CategoryName = x.FAQ.Category != null ? x.FAQ.Category.Name : null,
                x.Score
            })
            .ToList();

            return Ok(new { results = scoredFAQs, query = request.Query });
        }

        // POST: api/ChatWidget/message
        [HttpPost("message")]
        public async Task<ActionResult<object>> SendMessage([FromBody] ChatMessageRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest(new { message = "Message is required" });
            }

            // Get or create conversation
            var conversation = await _context.ChatConversations
                .FirstOrDefaultAsync(c => c.SessionId == request.SessionId && c.IsActive);

            if (conversation == null)
            {
                conversation = new ChatConversation
                {
                    SessionId = request.SessionId,
                    UserId = request.UserId,
                    StartedAt = DateTime.UtcNow,
                    LastActivityAt = DateTime.UtcNow,
                    IsActive = true
                };
                _context.ChatConversations.Add(conversation);
                await _context.SaveChangesAsync();
            }
            else
            {
                conversation.LastActivityAt = DateTime.UtcNow;
            }

            // Save user message
            var userMessage = new ChatMessage
            {
                ConversationId = conversation.Id,
                Message = request.Message,
                IsFromUser = true,
                CreatedAt = DateTime.UtcNow
            };
            _context.ChatMessages.Add(userMessage);

            // Find best matching FAQ
            var query = request.Message.ToLower().Trim();
            var keywords = query.Split(' ', StringSplitOptions.RemoveEmptyEntries)
                .Where(k => k.Length > 2) // Ignore very short words
                .ToList();

            // Common question patterns and synonyms
            var questionPatterns = new Dictionary<string, List<string>>
            {
                { "who are you", new List<string> { "what is aung", "about us", "platform", "advanced upskilling", "new growth" } },
                { "who are", new List<string> { "instructors", "teachers" } },
                { "what is", new List<string> { "aung", "platform", "dashboard", "advanced upskilling", "new growth" } },
                { "how to", new List<string> { "start", "enroll", "pay", "learn" } },
                { "how do", new List<string> { "start", "enroll", "pay", "learn" } },
                { "free", new List<string> { "paid", "cost", "price" } },
                { "payment", new List<string> { "pay", "purchase", "buy", "cost" } },
                { "aung", new List<string> { "platform", "learning platform", "advanced upskilling", "new growth" } },
                { "hello", new List<string> { "introduction", "greeting", "welcome", "hi", "hey", "start" } },
                { "hi", new List<string> { "introduction", "greeting", "welcome", "hello", "hey", "start" } },
                { "hey", new List<string> { "introduction", "greeting", "welcome", "hello", "hi", "start" } },
                { "goodbye", new List<string> { "conclusion", "farewell", "bye", "end", "exit", "thank you" } },
                { "bye", new List<string> { "conclusion", "farewell", "goodbye", "end", "exit", "thank you" } },
                { "thank you", new List<string> { "conclusion", "thanks", "grateful", "appreciate", "farewell" } },
                { "thanks", new List<string> { "conclusion", "thank you", "grateful", "appreciate", "farewell" } }
            };

            var faqs = await _context.FAQs
                .Where(f => f.IsActive)
                .ToListAsync();

            var bestMatch = faqs
                .Select(faq =>
                {
                    var score = 0;
                    var questionLower = faq.Question.ToLower();
                    var answerLower = faq.Answer.ToLower();
                    var keywordsLower = faq.Keywords?.ToLower() ?? "";

                    // Exact question match (highest priority)
                    if (questionLower == query || questionLower.Contains(query))
                        score += 200;

                    // Check for question pattern matches
                    foreach (var pattern in questionPatterns)
                    {
                        if (query.Contains(pattern.Key))
                        {
                            foreach (var synonym in pattern.Value)
                            {
                                if (questionLower.Contains(synonym) || keywordsLower.Contains(synonym))
                                    score += 50;
                            }
                        }
                    }

                    // Keyword matching in question
                    var matchedKeywords = 0;
                    foreach (var keyword in keywords)
                    {
                        if (questionLower.Contains(keyword))
                        {
                            score += 15;
                            matchedKeywords++;
                        }
                        else if (keywordsLower.Contains(keyword))
                        {
                            score += 8;
                            matchedKeywords++;
                        }
                        else if (answerLower.Contains(keyword))
                        {
                            score += 3;
                        }
                    }

                    // Boost score if multiple keywords match
                    if (matchedKeywords == keywords.Count && keywords.Count > 0)
                        score += 30;

                    // Priority boost
                    score += faq.Priority * 3;

                    // View count boost (popular FAQs)
                    score += (int)(faq.ViewCount * 0.1);

                    return new { FAQ = faq, Score = score };
                })
                .Where(x => x.Score > 0)
                .OrderByDescending(x => x.Score)
                .FirstOrDefault();

            // Increment view count for matched FAQ
            if (bestMatch != null)
            {
                bestMatch.FAQ.ViewCount++;
                bestMatch.FAQ.UpdatedAt = DateTime.UtcNow;
            }

            // Generate bot response
            string botResponse;
            int? faqId = null;
            string? actionButtonJson = null;

            if (bestMatch != null && bestMatch.Score >= 10)
            {
                botResponse = bestMatch.FAQ.Answer;
                faqId = bestMatch.FAQ.Id;
                actionButtonJson = bestMatch.FAQ.ActionButton; // Include action button if available
            }
            else
            {
                botResponse = "I'm here to help! I can answer questions about:\n\n" +
                              "📚 **Our Learning Platform** - What AUNG (Advanced Upskilling & New Growth) offers and how it works\n" +
                              "👨‍🏫 **Instructors** - Who teaches our courses\n" +
                              "📖 **Courses** - Free and paid course options\n" +
                              "🚀 **Getting Started** - How to start learning\n" +
                              "💳 **Payment** - How to pay for courses\n\n" +
                              "Try asking:\n" +
                              "• 'What is AUNG?'\n" +
                              "• 'Who are the instructors?'\n" +
                              "• 'Are courses free or paid?'\n" +
                              "• 'How do I start learning?'\n" +
                              "• 'How do I pay for courses?'";
            }

            // Save bot response
            var botMessage = new ChatMessage
            {
                ConversationId = conversation.Id,
                Message = botResponse,
                IsFromUser = false,
                FAQId = faqId,
                CreatedAt = DateTime.UtcNow
            };
            _context.ChatMessages.Add(botMessage);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                response = botResponse,
                faqId = faqId,
                conversationId = conversation.Id,
                actionButton = actionButtonJson, // Include action button JSON if available
                suggestedQuestions = await GetSuggestedQuestions()
            });
        }

        // POST: api/ChatWidget/feedback
        [HttpPost("feedback")]
        public async Task<ActionResult> SubmitFeedback([FromBody] FeedbackRequest request)
        {
            var message = await _context.ChatMessages
                .Include(m => m.FAQ)
                .FirstOrDefaultAsync(m => m.Id == request.MessageId);

            if (message == null)
            {
                return NotFound(new { message = "Message not found" });
            }

            message.IsHelpful = request.IsHelpful;

            if (message.FAQId.HasValue && message.FAQ != null)
            {
                if (request.IsHelpful == true)
                {
                    message.FAQ.HelpfulCount++;
                }
                else if (request.IsHelpful == false)
                {
                    message.FAQ.NotHelpfulCount++;
                }
                message.FAQ.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Feedback submitted successfully" });
        }

        private async Task<List<string>> GetSuggestedQuestions()
        {
            var faqs = await _context.FAQs
                .Where(f => f.IsActive)
                .OrderByDescending(f => f.Priority)
                .ThenByDescending(f => f.ViewCount)
                .Take(5)
                .Select(f => f.Question)
                .ToListAsync();

            return faqs;
        }
    }

    public class SearchRequest
    {
        public string Query { get; set; } = string.Empty;
    }

    public class ChatMessageRequest
    {
        public string Message { get; set; } = string.Empty;
        public string SessionId { get; set; } = string.Empty;
        public int? UserId { get; set; }
    }

    public class FeedbackRequest
    {
        public int MessageId { get; set; }
        public bool? IsHelpful { get; set; }
    }
}
