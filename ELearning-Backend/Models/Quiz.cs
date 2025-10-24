using System.ComponentModel.DataAnnotations;

namespace ELearning.API.Models
{
    public class Quiz
    {
        public int Id { get; set; }
        
        [Required]
        public string Title { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        public int TimeLimit { get; set; } // in minutes
        
        public int MaxAttempts { get; set; } = 1;
        
        public bool IsRandomized { get; set; } = false;
        
        public bool ShowCorrectAnswers { get; set; } = true;
        
        public bool ShowResultsImmediately { get; set; } = true;
        
        public decimal PassingScore { get; set; } = 60; // percentage
        
        public DateTime? AvailableFrom { get; set; }
        
        public DateTime? AvailableUntil { get; set; }
        
        public int CourseId { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Course Course { get; set; } = null!;
        public virtual ICollection<QuizQuestion> Questions { get; set; } = new List<QuizQuestion>();
        public virtual ICollection<QuizAttempt> Attempts { get; set; } = new List<QuizAttempt>();
    }
}
