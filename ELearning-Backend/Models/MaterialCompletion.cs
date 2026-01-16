using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ELearning.API.Models
{
    public class MaterialCompletion
    {
        public int Id { get; set; }
        
        public int UserId { get; set; }
        
        public int CourseId { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string MaterialType { get; set; } = string.Empty; // 'lesson', 'video', 'document', 'quiz', 'assignment'
        
        public int MaterialId { get; set; } // ID of the specific material (lesson, video, document, quiz, etc.)
        
        public bool IsCompleted { get; set; } = false;
        
        public DateTime? CompletedAt { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;
        
        [ForeignKey("CourseId")]
        public virtual Course Course { get; set; } = null!;
    }
}

