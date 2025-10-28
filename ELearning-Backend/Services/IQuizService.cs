using ELearning.API.DTOs;

namespace ELearning.API.Services
{
    public interface IQuizService
    {
        Task<IEnumerable<QuizDto>> GetCourseQuizzesAsync(int courseId);
        Task<QuizDto> GetQuizByIdAsync(int id);
        Task<QuizDto> CreateQuizAsync(CreateQuizDto createQuizDto, int courseId);
        Task<QuizDto> UpdateQuizAsync(int id, UpdateQuizDto updateQuizDto);
        Task<bool> DeleteQuizAsync(int id);
    }

    public class QuizDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Duration { get; set; }
        public int TotalQuestions { get; set; }
        public int TotalMarks { get; set; }
        public int CourseId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateQuizDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Duration { get; set; }
        public int TotalMarks { get; set; }
        public int CourseId { get; set; }
    }

    public class UpdateQuizDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public int? Duration { get; set; }
        public int? TotalMarks { get; set; }
    }
}
