using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ELearning.API.Models
{
    public class MultipleChoiceAttempt
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public int MultipleChoiceId { get; set; }

        [Required]
        [Column(TypeName = "decimal(5,2)")]
        public decimal Score { get; set; } = 0;

        [Required]
        [Column(TypeName = "decimal(5,2)")]
        public decimal TotalPoints { get; set; } = 0;

        [Required]
        [Column(TypeName = "decimal(5,2)")]
        public decimal Percentage { get; set; } = 0;

        public bool IsPassed { get; set; } = false;

        [Required]
        public string Answers { get; set; } = string.Empty; // JSON string of user answers

        public int SubmissionCount { get; set; } = 1; // Track how many times user has submitted (for max attempts)

        public DateTime StartedAt { get; set; } = DateTime.UtcNow;

        public DateTime CompletedAt { get; set; } = DateTime.UtcNow;

        public int? TimeSpent { get; set; } = 0; // Time spent in seconds

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        [ForeignKey("MultipleChoiceId")]
        public virtual MultipleChoice MultipleChoice { get; set; } = null!;
    }
}

