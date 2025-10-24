using System.ComponentModel.DataAnnotations;

namespace ELearning.API.Models
{
    public class Certificate
    {
        public int Id { get; set; }
        
        [Required]
        public string CertificateNumber { get; set; } = string.Empty;
        
        public string? CertificateUrl { get; set; }
        
        public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? ExpiresAt { get; set; }
        
        public bool IsValid { get; set; } = true;
        
        public string? VerificationCode { get; set; }
        
        public int UserId { get; set; }
        
        public int CourseId { get; set; }

        // Navigation properties
        public virtual User User { get; set; } = null!;
        public virtual Course Course { get; set; } = null!;
    }
}
