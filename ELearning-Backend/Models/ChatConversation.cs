using System.ComponentModel.DataAnnotations;

namespace ELearning.API.Models
{
    public class ChatConversation
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(255)]
        public string SessionId { get; set; } = string.Empty;
        
        public int? UserId { get; set; }
        
        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime LastActivityAt { get; set; } = DateTime.UtcNow;
        
        public bool IsActive { get; set; } = true;

        // Navigation properties
        public virtual User? User { get; set; }
        public virtual ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
    }
}
