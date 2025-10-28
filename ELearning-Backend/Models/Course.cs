using System.ComponentModel.DataAnnotations;

namespace ELearning.API.Models
{
    public class Course
    {
        public int Id { get; set; }
        
        [Required]
        public string Title { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        public string? Thumbnail { get; set; }
        
        public decimal Price { get; set; }
        
        public bool IsFree { get; set; } = false;
        
        public CourseLevel Level { get; set; } = CourseLevel.Beginner;
        
        public CourseStatus Status { get; set; } = CourseStatus.Draft;
        
        public int Duration { get; set; } // in hours
        
        public string? Prerequisites { get; set; }
        
        public string? LearningOutcomes { get; set; }
        
        public int InstructorId { get; set; }
        
        public int? CategoryId { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? PublishedAt { get; set; }

        // Navigation properties
        public virtual User Instructor { get; set; } = null!;
        public virtual Category? Category { get; set; }
        public virtual ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
        public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
        public virtual ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
        public virtual ICollection<Quiz> Quizzes { get; set; } = new List<Quiz>();
        public virtual ICollection<Video> Videos { get; set; } = new List<Video>();
        public virtual ICollection<Progress> Progress { get; set; } = new List<Progress>();
        public virtual ICollection<Certificate> Certificates { get; set; } = new List<Certificate>();
    }

    public enum CourseLevel
    {
        Beginner,
        Intermediate,
        Advanced
    }

    public enum CourseStatus
    {
        Draft,
        Published,
        Archived
    }
}
