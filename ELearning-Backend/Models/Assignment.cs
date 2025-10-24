using System.ComponentModel.DataAnnotations;

namespace ELearning.API.Models
{
    public class Assignment
    {
        public int Id { get; set; }
        
        [Required]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public string Description { get; set; } = string.Empty;
        
        public string? Instructions { get; set; }
        
        public decimal MaxPoints { get; set; }
        
        public DateTime DueDate { get; set; }
        
        public bool AllowLateSubmission { get; set; } = false;
        
        public int LatePenaltyPercentage { get; set; } = 0;
        
        public AssignmentType Type { get; set; } = AssignmentType.Essay;
        
        public int CourseId { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Course Course { get; set; } = null!;
        public virtual ICollection<Submission> Submissions { get; set; } = new List<Submission>();
    }

    public enum AssignmentType
    {
        Essay,
        MultipleChoice,
        FileUpload,
        CodeSubmission,
        Presentation
    }
}
