using AutoMapper;
using ELearning.API.Data;
using ELearning.API.DTOs;
using ELearning.API.Models;
using Microsoft.EntityFrameworkCore;

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
            var multipleChoice = await _context.MultipleChoices.FindAsync(id);
            if (multipleChoice == null)
                return false;

            _context.MultipleChoices.Remove(multipleChoice);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.MultipleChoices.AnyAsync(mc => mc.Id == id);
        }
    }
}