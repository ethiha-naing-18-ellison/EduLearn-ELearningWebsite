namespace ELearning.API.DTOs
{
    public class AssignmentDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Instructions { get; set; }
        public decimal MaxPoints { get; set; }
        public DateTime DueDate { get; set; }
        public bool AllowLateSubmission { get; set; }
        public int LatePenaltyPercentage { get; set; }
        public string Type { get; set; } = string.Empty;
        public int CourseId { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateAssignmentDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Instructions { get; set; }
        public decimal MaxPoints { get; set; } = 100;
        public DateTime DueDate { get; set; } = DateTime.UtcNow.AddDays(7);
        public bool AllowLateSubmission { get; set; } = false;
        public int LatePenaltyPercentage { get; set; } = 0;
        public string Type { get; set; } = "Essay";
        public int CourseId { get; set; }
    }

    public class UpdateAssignmentDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Instructions { get; set; }
        public decimal? MaxPoints { get; set; }
        public DateTime? DueDate { get; set; }
        public bool? AllowLateSubmission { get; set; }
        public int? LatePenaltyPercentage { get; set; }
        public string? Type { get; set; }
    }
}
