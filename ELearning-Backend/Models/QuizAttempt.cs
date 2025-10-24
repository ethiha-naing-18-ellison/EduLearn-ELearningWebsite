using System.ComponentModel.DataAnnotations;

namespace ELearning.API.Models
{
    public class QuizAttempt
    {
        public int Id { get; set; }
        
        public decimal Score { get; set; }
        
        public int TimeSpent { get; set; } // in minutes
        
        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? CompletedAt { get; set; }
        
        public bool IsPassed { get; set; } = false;
        
        public string? Answers { get; set; } // JSON string of user answers
        
        public int UserId { get; set; }
        
        public int QuizId { get; set; }

        // Navigation properties
        public virtual User User { get; set; } = null!;
        public virtual Quiz Quiz { get; set; } = null!;
    }
}
