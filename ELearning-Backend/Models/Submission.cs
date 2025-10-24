using System.ComponentModel.DataAnnotations;

namespace ELearning.API.Models
{
    public class Submission
    {
        public int Id { get; set; }
        
        [Required]
        public string Content { get; set; } = string.Empty;
        
        public string? FileUrl { get; set; }
        
        public decimal? Score { get; set; }
        
        public string? Feedback { get; set; }
        
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? GradedAt { get; set; }
        
        public bool IsLate { get; set; } = false;
        
        public SubmissionStatus Status { get; set; } = SubmissionStatus.Submitted;
        
        public int UserId { get; set; }
        
        public int AssignmentId { get; set; }

        // Navigation properties
        public virtual User User { get; set; } = null!;
        public virtual Assignment Assignment { get; set; } = null!;
    }

    public enum SubmissionStatus
    {
        Submitted,
        Graded,
        Returned,
        Resubmitted
    }
}
