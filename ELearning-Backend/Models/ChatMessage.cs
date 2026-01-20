using System.ComponentModel.DataAnnotations;

namespace ELearning.API.Models
{
    public class ChatMessage
    {
        public int Id { get; set; }
        
        public int ConversationId { get; set; }
        
        [Required]
        public string Message { get; set; } = string.Empty;
        
        public bool IsFromUser { get; set; } = true;
        
        public int? FAQId { get; set; }
        
        public bool? IsHelpful { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ChatConversation Conversation { get; set; } = null!;
        public virtual FAQ? FAQ { get; set; }
    }
}
