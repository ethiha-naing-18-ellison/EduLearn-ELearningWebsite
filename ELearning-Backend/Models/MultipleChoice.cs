using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ELearning.API.Models
{
    public class MultipleChoice
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int CourseId { get; set; }

        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string? Instructions { get; set; }

        public int TotalPoints { get; set; } = 0;

        public int? TimeLimit { get; set; } // Time limit in minutes for entire quiz

        public int OrderIndex { get; set; } = 1;

        public bool IsPublished { get; set; } = true;

        public bool IsFree { get; set; } = false;

        public bool AllowRetake { get; set; } = true;

        public int MaxAttempts { get; set; } = 3;

        public int PassingScore { get; set; } = 70; // Percentage

        public bool ShowCorrectAnswers { get; set; } = true;

        public bool ShowResultsImmediately { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("CourseId")]
        public virtual Course? Course { get; set; }

        public virtual ICollection<MultipleChoiceQuestion> Questions { get; set; } = new List<MultipleChoiceQuestion>();
    }
}
