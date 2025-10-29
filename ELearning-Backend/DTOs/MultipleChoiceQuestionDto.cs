using System.ComponentModel.DataAnnotations;

namespace ELearning.API.DTOs
{
    public class MultipleChoiceQuestionDto
    {
        public int Id { get; set; }
        public int MultipleChoiceId { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public string QuestionType { get; set; } = "MultipleChoice";
        public string? OptionA { get; set; }
        public string? OptionB { get; set; }
        public string? OptionC { get; set; }
        public string? OptionD { get; set; }
        public string? CorrectAnswer { get; set; }
        public string? Explanation { get; set; }
        public int Points { get; set; } = 1;
        public int OrderIndex { get; set; } = 1;
        public bool IsRequired { get; set; } = true;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateMultipleChoiceQuestionDto
    {
        [Required]
        public string QuestionText { get; set; } = string.Empty;
        [Required]
        [MaxLength(20)]
        public string QuestionType { get; set; } = "MultipleChoice";
        [MaxLength(500)]
        public string? OptionA { get; set; }
        [MaxLength(500)]
        public string? OptionB { get; set; }
        [MaxLength(500)]
        public string? OptionC { get; set; }
        [MaxLength(500)]
        public string? OptionD { get; set; }
        [MaxLength(10)]
        public string? CorrectAnswer { get; set; }
        public string? Explanation { get; set; }
        public int Points { get; set; } = 1;
        public int OrderIndex { get; set; } = 1;
        public bool IsRequired { get; set; } = true;
    }

    public class UpdateMultipleChoiceQuestionDto
    {
        [Required]
        public string QuestionText { get; set; } = string.Empty;
        [Required]
        [MaxLength(20)]
        public string QuestionType { get; set; } = "MultipleChoice";
        [MaxLength(500)]
        public string? OptionA { get; set; }
        [MaxLength(500)]
        public string? OptionB { get; set; }
        [MaxLength(500)]
        public string? OptionC { get; set; }
        [MaxLength(500)]
        public string? OptionD { get; set; }
        [MaxLength(10)]
        public string? CorrectAnswer { get; set; }
        public string? Explanation { get; set; }
        public int Points { get; set; } = 1;
        public int OrderIndex { get; set; } = 1;
        public bool IsRequired { get; set; } = true;
    }
}
