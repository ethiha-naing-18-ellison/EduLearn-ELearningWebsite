using System.ComponentModel.DataAnnotations;

namespace ELearning.API.Models
{
    public class QuizQuestion
    {
        public int Id { get; set; }
        
        [Required]
        public string Question { get; set; } = string.Empty;
        
        [Required]
        public string CorrectAnswer { get; set; } = string.Empty;
        
        public string? OptionA { get; set; }
        
        public string? OptionB { get; set; }
        
        public string? OptionC { get; set; }
        
        public string? OptionD { get; set; }
        
        public string? Explanation { get; set; }
        
        public decimal Points { get; set; } = 1;
        
        public int Order { get; set; }
        
        public QuestionType Type { get; set; } = QuestionType.MultipleChoice;
        
        public int QuizId { get; set; }

        // Navigation properties
        public virtual Quiz Quiz { get; set; } = null!;
    }

    public enum QuestionType
    {
        MultipleChoice,
        TrueFalse,
        ShortAnswer,
        Essay
    }
}
