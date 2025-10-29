using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ELearning.API.Models
{
    public class MultipleChoiceQuestion
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int MultipleChoiceId { get; set; }

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

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("MultipleChoiceId")]
        public virtual MultipleChoice? MultipleChoice { get; set; }
    }
}
