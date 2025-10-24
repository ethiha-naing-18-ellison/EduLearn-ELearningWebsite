using System.ComponentModel.DataAnnotations;

namespace ELearning.API.Models
{
    public class Progress
    {
        public int Id { get; set; }
        
        public decimal CompletionPercentage { get; set; }
        
        public int LessonsCompleted { get; set; }
        
        public int TotalLessons { get; set; }
        
        public int AssignmentsCompleted { get; set; }
        
        public int TotalAssignments { get; set; }
        
        public int QuizzesCompleted { get; set; }
        
        public int TotalQuizzes { get; set; }
        
        public DateTime LastAccessedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? CompletedAt { get; set; }
        
        public int UserId { get; set; }
        
        public int CourseId { get; set; }

        // Navigation properties
        public virtual User User { get; set; } = null!;
        public virtual Course Course { get; set; } = null!;
    }
}
