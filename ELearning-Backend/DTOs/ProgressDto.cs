namespace ELearning.API.DTOs
{
    public class ProgressDto
    {
        public int Id { get; set; }
        public decimal CompletionPercentage { get; set; }
        public int LessonsCompleted { get; set; }
        public int TotalLessons { get; set; }
        public int AssignmentsCompleted { get; set; }
        public int TotalAssignments { get; set; }
        public int QuizzesCompleted { get; set; }
        public int TotalQuizzes { get; set; }
        public DateTime LastAccessedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int UserId { get; set; }
        public int CourseId { get; set; }
    }
}
