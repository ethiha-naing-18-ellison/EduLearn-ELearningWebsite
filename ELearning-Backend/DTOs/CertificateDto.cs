namespace ELearning.API.DTOs
{
    public class CertificateDto
    {
        public int Id { get; set; }
        public string CertificateNumber { get; set; } = string.Empty;
        public string? CertificateUrl { get; set; }
        public DateTime IssuedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public bool IsValid { get; set; }
        public string? VerificationCode { get; set; }
        public int UserId { get; set; }
        public int CourseId { get; set; }
    }
}
