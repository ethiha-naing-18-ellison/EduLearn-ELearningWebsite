using System.ComponentModel.DataAnnotations;

namespace ELearning.API.Models
{
    public class Enrollment
    {
        public int Id { get; set; }
        
        public int UserId { get; set; }
        
        public int CourseId { get; set; }
        
        public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
        
        public EnrollmentStatus Status { get; set; } = EnrollmentStatus.Active;
        
        public DateTime? CompletedAt { get; set; }
        
        public decimal? Grade { get; set; }
        
        public string? Notes { get; set; }

        // Navigation properties
        public virtual User User { get; set; } = null!;
        public virtual Course Course { get; set; } = null!;
    }

    public enum EnrollmentStatus
    {
        Active,
        Completed,
        Dropped,
        Suspended
    }
}
