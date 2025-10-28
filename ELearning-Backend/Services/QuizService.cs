using Microsoft.EntityFrameworkCore;
using ELearning.API.Data;
using ELearning.API.DTOs;
using ELearning.API.Models;

namespace ELearning.API.Services
{
    public class QuizService : IQuizService
    {
        private readonly ELearningDbContext _context;

        public QuizService(ELearningDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<QuizDto>> GetCourseQuizzesAsync(int courseId)
        {
            var quizzes = await _context.Quizzes
                .Where(q => q.CourseId == courseId)
                .OrderBy(q => q.CreatedAt)
                .ToListAsync();

            return quizzes.Select(q => new QuizDto
            {
                Id = q.Id,
                Title = q.Title,
                Description = q.Description ?? "",
                Duration = q.TimeLimit,
                TotalQuestions = q.Questions?.Count ?? 0,
                TotalMarks = 100, // Default total marks
                CourseId = q.CourseId,
                CreatedAt = q.CreatedAt,
                UpdatedAt = q.UpdatedAt
            });
        }

        public async Task<QuizDto> GetQuizByIdAsync(int id)
        {
            var quiz = await _context.Quizzes
                .Include(q => q.Questions)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (quiz == null)
            {
                throw new KeyNotFoundException("Quiz not found");
            }

            return new QuizDto
            {
                Id = quiz.Id,
                Title = quiz.Title,
                Description = quiz.Description ?? "",
                Duration = quiz.TimeLimit,
                TotalQuestions = quiz.Questions?.Count ?? 0,
                TotalMarks = 100, // Default total marks
                CourseId = quiz.CourseId,
                CreatedAt = quiz.CreatedAt,
                UpdatedAt = quiz.UpdatedAt
            };
        }

        public async Task<QuizDto> CreateQuizAsync(CreateQuizDto createQuizDto, int courseId)
        {
            var quiz = new Quiz
            {
                Title = createQuizDto.Title,
                Description = createQuizDto.Description,
                TimeLimit = createQuizDto.Duration,
                CourseId = courseId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Quizzes.Add(quiz);
            await _context.SaveChangesAsync();

            return new QuizDto
            {
                Id = quiz.Id,
                Title = quiz.Title,
                Description = quiz.Description ?? "",
                Duration = quiz.TimeLimit,
                TotalQuestions = 0,
                TotalMarks = 100, // Default total marks
                CourseId = quiz.CourseId,
                CreatedAt = quiz.CreatedAt,
                UpdatedAt = quiz.UpdatedAt
            };
        }

        public async Task<QuizDto> UpdateQuizAsync(int id, UpdateQuizDto updateQuizDto)
        {
            var quiz = await _context.Quizzes.FindAsync(id);
            if (quiz == null)
            {
                throw new KeyNotFoundException("Quiz not found");
            }

            if (!string.IsNullOrEmpty(updateQuizDto.Title))
                quiz.Title = updateQuizDto.Title;
            if (!string.IsNullOrEmpty(updateQuizDto.Description))
                quiz.Description = updateQuizDto.Description;
            if (updateQuizDto.Duration.HasValue)
                quiz.TimeLimit = updateQuizDto.Duration.Value;

            quiz.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return new QuizDto
            {
                Id = quiz.Id,
                Title = quiz.Title,
                Description = quiz.Description ?? "",
                Duration = quiz.TimeLimit,
                TotalQuestions = quiz.Questions?.Count ?? 0,
                TotalMarks = 100, // Default total marks
                CourseId = quiz.CourseId,
                CreatedAt = quiz.CreatedAt,
                UpdatedAt = quiz.UpdatedAt
            };
        }

        public async Task<bool> DeleteQuizAsync(int id)
        {
            var quiz = await _context.Quizzes.FindAsync(id);
            if (quiz == null)
            {
                return false;
            }

            _context.Quizzes.Remove(quiz);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
