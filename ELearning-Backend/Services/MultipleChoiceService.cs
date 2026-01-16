using AutoMapper;
using ELearning.API.Data;
using ELearning.API.DTOs;
using ELearning.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace ELearning.API.Services
{
    public class MultipleChoiceService : IMultipleChoiceService
    {
        private readonly ELearningDbContext _context;
        private readonly IMapper _mapper;

        public MultipleChoiceService(ELearningDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<MultipleChoiceDto>> GetAllAsync()
        {
            var multipleChoices = await _context.MultipleChoices
                .Include(mc => mc.Course)
                .Include(mc => mc.Questions)
                .OrderBy(mc => mc.CourseId)
                .ThenBy(mc => mc.OrderIndex)
                .ToListAsync();

            return _mapper.Map<IEnumerable<MultipleChoiceDto>>(multipleChoices);
        }

        public async Task<MultipleChoiceDto?> GetByIdAsync(int id)
        {
            var multipleChoice = await _context.MultipleChoices
                .Include(mc => mc.Course)
                .Include(mc => mc.Questions)
                .FirstOrDefaultAsync(mc => mc.Id == id);

            return multipleChoice != null ? _mapper.Map<MultipleChoiceDto>(multipleChoice) : null;
        }

        public async Task<IEnumerable<MultipleChoiceDto>> GetByCourseIdAsync(int courseId)
        {
            var multipleChoices = await _context.MultipleChoices
                .Where(mc => mc.CourseId == courseId)
                .Include(mc => mc.Questions)
                .OrderBy(mc => mc.OrderIndex)
                .ToListAsync();

            return _mapper.Map<IEnumerable<MultipleChoiceDto>>(multipleChoices);
        }

        public async Task<MultipleChoiceDto> CreateAsync(CreateMultipleChoiceDto createDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var multipleChoice = _mapper.Map<MultipleChoice>(createDto);
                multipleChoice.CreatedAt = DateTime.UtcNow;
                multipleChoice.UpdatedAt = DateTime.UtcNow;

                _context.MultipleChoices.Add(multipleChoice);
                await _context.SaveChangesAsync();

                // Add questions if provided
                if (createDto.Questions != null && createDto.Questions.Any())
                {
                    var questions = createDto.Questions.Select(q => new MultipleChoiceQuestion
                    {
                        MultipleChoiceId = multipleChoice.Id,
                        QuestionText = q.QuestionText,
                        QuestionType = q.QuestionType,
                        OptionA = q.OptionA,
                        OptionB = q.OptionB,
                        OptionC = q.OptionC,
                        OptionD = q.OptionD,
                        CorrectAnswer = q.CorrectAnswer,
                        Explanation = q.Explanation,
                        Points = q.Points,
                        OrderIndex = q.OrderIndex,
                        IsRequired = q.IsRequired,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    }).ToList();

                    _context.MultipleChoiceQuestions.AddRange(questions);
                    await _context.SaveChangesAsync();

                    // Update total points
                    multipleChoice.TotalPoints = questions.Sum(q => q.Points);
                    await _context.SaveChangesAsync();
                }

                await transaction.CommitAsync();

                // Return with questions included
                var result = await _context.MultipleChoices
                    .Include(mc => mc.Course)
                    .Include(mc => mc.Questions)
                    .FirstOrDefaultAsync(mc => mc.Id == multipleChoice.Id);

                return _mapper.Map<MultipleChoiceDto>(result);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<MultipleChoiceDto?> UpdateAsync(int id, UpdateMultipleChoiceDto updateDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                Console.WriteLine($"UpdateAsync called with id: {id}");
                Console.WriteLine($"UpdateDto: {System.Text.Json.JsonSerializer.Serialize(updateDto)}");

                var multipleChoice = await _context.MultipleChoices
                    .Include(mc => mc.Questions)
                    .FirstOrDefaultAsync(mc => mc.Id == id);
                
                if (multipleChoice == null)
                {
                    Console.WriteLine("MultipleChoice not found");
                    return null;
                }

                Console.WriteLine($"Found MultipleChoice with {multipleChoice.Questions.Count} questions");

                // Update quiz properties
                _mapper.Map(updateDto, multipleChoice);
                multipleChoice.UpdatedAt = DateTime.UtcNow;

                // Update questions
                if (updateDto.Questions != null)
                {
                    Console.WriteLine($"Updating {updateDto.Questions.Count} questions");
                    
                    // Remove existing questions
                    _context.MultipleChoiceQuestions.RemoveRange(multipleChoice.Questions);

                    // Add new questions (without setting Id to let EF generate it)
                    var questions = updateDto.Questions.Select(q => new MultipleChoiceQuestion
                    {
                        MultipleChoiceId = multipleChoice.Id,
                        QuestionText = q.QuestionText,
                        QuestionType = q.QuestionType,
                        OptionA = q.OptionA,
                        OptionB = q.OptionB,
                        OptionC = q.OptionC,
                        OptionD = q.OptionD,
                        CorrectAnswer = q.CorrectAnswer,
                        Explanation = q.Explanation,
                        Points = q.Points,
                        OrderIndex = q.OrderIndex,
                        IsRequired = q.IsRequired,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    }).ToList();

                    Console.WriteLine($"Created {questions.Count} new questions");
                    _context.MultipleChoiceQuestions.AddRange(questions);

                    // Update total points
                    multipleChoice.TotalPoints = questions.Sum(q => q.Points);
                }

                Console.WriteLine("Saving changes...");
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                Console.WriteLine("Changes saved successfully");

                // Return updated quiz with questions
                var result = await _context.MultipleChoices
                    .Include(mc => mc.Course)
                    .Include(mc => mc.Questions)
                    .FirstOrDefaultAsync(mc => mc.Id == id);

                return _mapper.Map<MultipleChoiceDto>(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UpdateAsync: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> DeleteAsync(int id)
        {
            try
            {
                var multipleChoice = await _context.MultipleChoices
                    .Include(mc => mc.Questions)
                    .FirstOrDefaultAsync(mc => mc.Id == id);
                
                if (multipleChoice == null)
                    return false;

                // Remove related questions first (though cascade should handle this)
                if (multipleChoice.Questions.Any())
                {
                    _context.MultipleChoiceQuestions.RemoveRange(multipleChoice.Questions);
                }

                _context.MultipleChoices.Remove(multipleChoice);
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting MultipleChoice {id}: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw new Exception($"Failed to delete quiz: {ex.Message}", ex);
            }
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.MultipleChoices.AnyAsync(mc => mc.Id == id);
        }

        public async Task<QuizSubmissionResultDto> SubmitQuizAsync(int quizId, int userId, SubmitQuizDto submitDto)
        {
            // Get the quiz with questions
            var quiz = await _context.MultipleChoices
                .Include(mc => mc.Questions)
                .FirstOrDefaultAsync(mc => mc.Id == quizId);

            if (quiz == null)
            {
                throw new KeyNotFoundException("Quiz not found");
            }

            // Check if attempt already exists (for update/upsert pattern)
            var existingAttempt = await _context.MultipleChoiceAttempts
                .FirstOrDefaultAsync(a => a.UserId == userId && a.MultipleChoiceId == quizId);

            // Check max attempts
            int currentSubmissionCount = existingAttempt?.SubmissionCount ?? 0;
            if (currentSubmissionCount >= quiz.MaxAttempts)
            {
                throw new InvalidOperationException($"Maximum attempts ({quiz.MaxAttempts}) reached for this quiz. You cannot submit again.");
            }

            // Calculate score
            decimal score = 0;
            decimal totalPoints = quiz.Questions.Sum(q => q.Points);
            var questionResults = new Dictionary<int, QuestionResultDto>();

            foreach (var question in quiz.Questions)
            {
                var selectedAnswer = submitDto.Answers.ContainsKey(question.Id) 
                    ? submitDto.Answers[question.Id] 
                    : null;

                var isCorrect = !string.IsNullOrEmpty(selectedAnswer) && 
                               selectedAnswer.Equals(question.CorrectAnswer, StringComparison.OrdinalIgnoreCase);

                if (isCorrect)
                {
                    score += question.Points;
                }

                questionResults[question.Id] = new QuestionResultDto
                {
                    IsCorrect = isCorrect,
                    SelectedAnswer = selectedAnswer,
                    CorrectAnswer = question.CorrectAnswer ?? string.Empty,
                    PointsEarned = isCorrect ? question.Points : 0,
                    PointsAvailable = question.Points
                };
            }

            decimal percentage = totalPoints > 0 ? Math.Round((score / totalPoints) * 100, 2) : 0;
            bool isPassed = percentage >= quiz.PassingScore;

            // Serialize answers to JSON
            var answersJson = JsonSerializer.Serialize(submitDto.Answers);

            MultipleChoiceAttempt attempt;
            
            if (existingAttempt != null)
            {
                // Update existing attempt (retake scenario) - final mark is always the latest
                existingAttempt.Score = score;
                existingAttempt.TotalPoints = totalPoints;
                existingAttempt.Percentage = percentage;
                existingAttempt.IsPassed = isPassed;
                existingAttempt.Answers = answersJson;
                existingAttempt.StartedAt = DateTime.UtcNow.AddSeconds(-(submitDto.TimeSpent ?? 0));
                existingAttempt.CompletedAt = DateTime.UtcNow;
                existingAttempt.TimeSpent = submitDto.TimeSpent ?? 0;
                existingAttempt.SubmissionCount += 1; // Increment submission count
                existingAttempt.UpdatedAt = DateTime.UtcNow;
                attempt = existingAttempt;
            }
            else
            {
                // Create new attempt record (first submission)
                attempt = new MultipleChoiceAttempt
                {
                    UserId = userId,
                    MultipleChoiceId = quizId,
                    Score = score,
                    TotalPoints = totalPoints,
                    Percentage = percentage,
                    IsPassed = isPassed,
                    Answers = answersJson,
                    SubmissionCount = 1,
                    StartedAt = DateTime.UtcNow.AddSeconds(-(submitDto.TimeSpent ?? 0)),
                    CompletedAt = DateTime.UtcNow,
                    TimeSpent = submitDto.TimeSpent ?? 0,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.MultipleChoiceAttempts.Add(attempt);
            }

            await _context.SaveChangesAsync();

            // Check if user can retake
            var newSubmissionCount = attempt.SubmissionCount;
            bool canRetake = newSubmissionCount < quiz.MaxAttempts && quiz.AllowRetake;

            return new QuizSubmissionResultDto
            {
                AttemptId = attempt.Id,
                Score = score,
                TotalPoints = totalPoints,
                Percentage = percentage,
                IsPassed = isPassed,
                AttemptNumber = newSubmissionCount,
                MaxAttempts = quiz.MaxAttempts,
                CanRetake = canRetake,
                QuestionResults = questionResults
            };
        }

        public async Task<int> GetUserAttemptCountAsync(int quizId, int userId)
        {
            // Get submission count from the attempt record
            var attempt = await _context.MultipleChoiceAttempts
                .FirstOrDefaultAsync(a => a.MultipleChoiceId == quizId && a.UserId == userId);
            
            return attempt?.SubmissionCount ?? 0;
        }

        public async Task<IEnumerable<MultipleChoiceAttemptDto>> GetUserAttemptsAsync(int quizId, int userId)
        {
            var attempts = await _context.MultipleChoiceAttempts
                .Where(a => a.MultipleChoiceId == quizId && a.UserId == userId)
                .OrderByDescending(a => a.CompletedAt)
                .ToListAsync();

            return _mapper.Map<IEnumerable<MultipleChoiceAttemptDto>>(attempts);
        }

        public async Task<bool> CanUserRetakeQuizAsync(int quizId, int userId)
        {
            var quiz = await _context.MultipleChoices.FindAsync(quizId);
            if (quiz == null)
                return false;

            if (!quiz.AllowRetake)
                return false;

            var submissionCount = await GetUserAttemptCountAsync(quizId, userId);
            return submissionCount < quiz.MaxAttempts;
        }
    }
}