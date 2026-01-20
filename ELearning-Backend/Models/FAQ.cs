using System.ComponentModel.DataAnnotations;

namespace ELearning.API.Models
{
    public class FAQ
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(500)]
        public string Question { get; set; } = string.Empty;
        
        [Required]
        public string Answer { get; set; } = string.Empty;
        
        public int? CategoryId { get; set; }
        
        [MaxLength(500)]
        public string? Keywords { get; set; }
        
        public int ViewCount { get; set; } = 0;
        
        public int HelpfulCount { get; set; } = 0;
        
        public int NotHelpfulCount { get; set; } = 0;
        
        public bool IsActive { get; set; } = true;
        
        public int Priority { get; set; } = 0;
        
        public string? ActionButton { get; set; } // JSON string for action button: {"text": "Button Text", "path": "/route", "type": "navigation"}
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual FAQCategory? Category { get; set; }
        public virtual ICollection<ChatMessage> ChatMessages { get; set; } = new List<ChatMessage>();
    }
}
