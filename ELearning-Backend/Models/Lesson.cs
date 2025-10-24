using System.ComponentModel.DataAnnotations;

namespace ELearning.API.Models
{
    public class Lesson
    {
        public int Id { get; set; }
        
        [Required]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public string Content { get; set; } = string.Empty;
        
        public string? VideoUrl { get; set; }
        
        public string? AudioUrl { get; set; }
        
        public string? DocumentUrl { get; set; }
        
        public int Duration { get; set; } // in minutes
        
        public int Order { get; set; }
        
        public bool IsFree { get; set; } = false;
        
        public LessonType Type { get; set; } = LessonType.Video;
        
        public int CourseId { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Course Course { get; set; } = null!;
    }

    public enum LessonType
    {
        Video,
        Audio,
        Text,
        Document,
        Quiz,
        Assignment
    }
}
