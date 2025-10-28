using ELearning.API.DTOs;

namespace ELearning.API.Services
{
    public interface IQuizQuestionService
    {
        Task<IEnumerable<QuizQuestionDto>> GetQuizQuestionsAsync(int quizId);
        Task<QuizQuestionDto> GetQuizQuestionByIdAsync(int id);
        Task<QuizQuestionDto> CreateQuizQuestionAsync(CreateQuizQuestionDto createQuizQuestionDto, int quizId);
        Task<QuizQuestionDto> UpdateQuizQuestionAsync(int id, UpdateQuizQuestionDto updateQuizQuestionDto);
        Task<bool> DeleteQuizQuestionAsync(int id);
        Task<bool> ReorderQuestionsAsync(int quizId, List<int> questionIds);
    }

}
