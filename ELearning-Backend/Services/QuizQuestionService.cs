using Microsoft.EntityFrameworkCore;
using ELearning.API.Data;
using ELearning.API.DTOs;
using ELearning.API.Models;

namespace ELearning.API.Services
{
    public class QuizQuestionService : IQuizQuestionService
    {
        private readonly ELearningDbContext _context;

        public QuizQuestionService(ELearningDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<QuizQuestionDto>> GetQuizQuestionsAsync(int quizId)
        {
            var questions = await _context.QuizQuestions
                .Where(q => q.QuizId == quizId)
                .OrderBy(q => q.Order)
                .ToListAsync();

            return questions.Select(q => new QuizQuestionDto
            {
                Id = q.Id,
                Question = q.Question,
                CorrectAnswer = q.CorrectAnswer,
                OptionA = q.OptionA,
                OptionB = q.OptionB,
                OptionC = q.OptionC,
                OptionD = q.OptionD,
                Explanation = q.Explanation,
                Points = q.Points,
                Order = q.Order,
                Type = q.Type.ToString(),
                QuizId = q.QuizId
            });
        }

        public async Task<QuizQuestionDto> GetQuizQuestionByIdAsync(int id)
        {
            var question = await _context.QuizQuestions
                .FirstOrDefaultAsync(q => q.Id == id);

            if (question == null)
            {
                throw new KeyNotFoundException("Quiz question not found");
            }

            return new QuizQuestionDto
            {
                Id = question.Id,
                Question = question.Question,
                CorrectAnswer = question.CorrectAnswer,
                OptionA = question.OptionA,
                OptionB = question.OptionB,
                OptionC = question.OptionC,
                OptionD = question.OptionD,
                Explanation = question.Explanation,
                Points = question.Points,
                Order = question.Order,
                Type = question.Type.ToString(),
                QuizId = question.QuizId
            };
        }

        public async Task<QuizQuestionDto> CreateQuizQuestionAsync(CreateQuizQuestionDto createQuizQuestionDto, int quizId)
        {
            // Get the next order number for this quiz
            var maxOrder = await _context.QuizQuestions
                .Where(q => q.QuizId == quizId)
                .MaxAsync(q => (int?)q.Order) ?? 0;

            var question = new QuizQuestion
            {
                Question = createQuizQuestionDto.Question,
                CorrectAnswer = createQuizQuestionDto.CorrectAnswer,
                OptionA = createQuizQuestionDto.OptionA,
                OptionB = createQuizQuestionDto.OptionB,
                OptionC = createQuizQuestionDto.OptionC,
                OptionD = createQuizQuestionDto.OptionD,
                Explanation = createQuizQuestionDto.Explanation,
                Points = createQuizQuestionDto.Points,
                Order = createQuizQuestionDto.Order > 0 ? createQuizQuestionDto.Order : maxOrder + 1,
                Type = Enum.TryParse<QuestionType>(createQuizQuestionDto.Type, out var questionType) 
                    ? questionType 
                    : QuestionType.MultipleChoice,
                QuizId = quizId
            };

            _context.QuizQuestions.Add(question);
            await _context.SaveChangesAsync();

            return new QuizQuestionDto
            {
                Id = question.Id,
                Question = question.Question,
                CorrectAnswer = question.CorrectAnswer,
                OptionA = question.OptionA,
                OptionB = question.OptionB,
                OptionC = question.OptionC,
                OptionD = question.OptionD,
                Explanation = question.Explanation,
                Points = question.Points,
                Order = question.Order,
                Type = question.Type.ToString(),
                QuizId = question.QuizId
            };
        }

        public async Task<QuizQuestionDto> UpdateQuizQuestionAsync(int id, UpdateQuizQuestionDto updateQuizQuestionDto)
        {
            var question = await _context.QuizQuestions.FindAsync(id);
            if (question == null)
            {
                throw new KeyNotFoundException("Quiz question not found");
            }

            if (!string.IsNullOrEmpty(updateQuizQuestionDto.Question))
                question.Question = updateQuizQuestionDto.Question;
            if (!string.IsNullOrEmpty(updateQuizQuestionDto.CorrectAnswer))
                question.CorrectAnswer = updateQuizQuestionDto.CorrectAnswer;
            if (updateQuizQuestionDto.OptionA != null)
                question.OptionA = updateQuizQuestionDto.OptionA;
            if (updateQuizQuestionDto.OptionB != null)
                question.OptionB = updateQuizQuestionDto.OptionB;
            if (updateQuizQuestionDto.OptionC != null)
                question.OptionC = updateQuizQuestionDto.OptionC;
            if (updateQuizQuestionDto.OptionD != null)
                question.OptionD = updateQuizQuestionDto.OptionD;
            if (updateQuizQuestionDto.Explanation != null)
                question.Explanation = updateQuizQuestionDto.Explanation;
            if (updateQuizQuestionDto.Points.HasValue)
                question.Points = updateQuizQuestionDto.Points.Value;
            if (updateQuizQuestionDto.Order.HasValue)
                question.Order = updateQuizQuestionDto.Order.Value;
            if (!string.IsNullOrEmpty(updateQuizQuestionDto.Type) && 
                Enum.TryParse<QuestionType>(updateQuizQuestionDto.Type, out var questionType))
                question.Type = questionType;

            await _context.SaveChangesAsync();

            return new QuizQuestionDto
            {
                Id = question.Id,
                Question = question.Question,
                CorrectAnswer = question.CorrectAnswer,
                OptionA = question.OptionA,
                OptionB = question.OptionB,
                OptionC = question.OptionC,
                OptionD = question.OptionD,
                Explanation = question.Explanation,
                Points = question.Points,
                Order = question.Order,
                Type = question.Type.ToString(),
                QuizId = question.QuizId
            };
        }

        public async Task<bool> DeleteQuizQuestionAsync(int id)
        {
            var question = await _context.QuizQuestions.FindAsync(id);
            if (question == null)
            {
                return false;
            }

            _context.QuizQuestions.Remove(question);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ReorderQuestionsAsync(int quizId, List<int> questionIds)
        {
            var questions = await _context.QuizQuestions
                .Where(q => q.QuizId == quizId)
                .ToListAsync();

            if (questions.Count != questionIds.Count)
            {
                return false;
            }

            for (int i = 0; i < questionIds.Count; i++)
            {
                var question = questions.FirstOrDefault(q => q.Id == questionIds[i]);
                if (question != null)
                {
                    question.Order = i + 1;
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
