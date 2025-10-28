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

}
