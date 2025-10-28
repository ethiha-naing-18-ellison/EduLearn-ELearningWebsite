namespace ELearning.API.DTOs
{
    public class QuizAttemptDto
    {
        public int Id { get; set; }
        public decimal Score { get; set; }
        public int TimeSpent { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public bool IsPassed { get; set; }
        public string? Answers { get; set; }
        public int UserId { get; set; }
        public int QuizId { get; set; }
    }
}
