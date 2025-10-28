namespace ELearning.API.DTOs
{
    public class SubmissionDto
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public string? FileUrl { get; set; }
        public decimal? Score { get; set; }
        public string? Feedback { get; set; }
        public DateTime SubmittedAt { get; set; }
        public DateTime? GradedAt { get; set; }
        public bool IsLate { get; set; }
        public string Status { get; set; } = string.Empty;
        public int UserId { get; set; }
        public int AssignmentId { get; set; }
        public UserDto? User { get; set; }
        public AssignmentDto? Assignment { get; set; }
    }

    public class CreateSubmissionDto
    {
        public string Content { get; set; } = string.Empty;
        public string? FileUrl { get; set; }
    }
}
