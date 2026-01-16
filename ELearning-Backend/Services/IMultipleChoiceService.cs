using ELearning.API.DTOs;

namespace ELearning.API.Services
{
    public interface IMultipleChoiceService
    {
        Task<IEnumerable<MultipleChoiceDto>> GetAllAsync();
        Task<MultipleChoiceDto?> GetByIdAsync(int id);
        Task<IEnumerable<MultipleChoiceDto>> GetByCourseIdAsync(int courseId);
        Task<MultipleChoiceDto> CreateAsync(CreateMultipleChoiceDto createDto);
        Task<MultipleChoiceDto?> UpdateAsync(int id, UpdateMultipleChoiceDto updateDto);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<QuizSubmissionResultDto> SubmitQuizAsync(int quizId, int userId, SubmitQuizDto submitDto);
        Task<int> GetUserAttemptCountAsync(int quizId, int userId);
        Task<IEnumerable<MultipleChoiceAttemptDto>> GetUserAttemptsAsync(int quizId, int userId);
        Task<bool> CanUserRetakeQuizAsync(int quizId, int userId);
    }
}
