namespace ELearning.API.DTOs
{
    public class QuizDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int TimeLimit { get; set; }
        public int MaxAttempts { get; set; }
        public bool IsRandomized { get; set; }
        public bool ShowCorrectAnswers { get; set; }
        public bool ShowResultsImmediately { get; set; }
        public decimal PassingScore { get; set; }
        public DateTime? AvailableFrom { get; set; }
        public DateTime? AvailableUntil { get; set; }
        public int TotalQuestions { get; set; }
        public int CourseId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateQuizDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int TimeLimit { get; set; } = 30;
        public int MaxAttempts { get; set; } = 1;
        public bool IsRandomized { get; set; } = false;
        public bool ShowCorrectAnswers { get; set; } = true;
        public bool ShowResultsImmediately { get; set; } = true;
        public decimal PassingScore { get; set; } = 60;
        public DateTime? AvailableFrom { get; set; }
        public DateTime? AvailableUntil { get; set; }
        public int CourseId { get; set; }
    }

    public class UpdateQuizDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public int? TimeLimit { get; set; }
        public int? MaxAttempts { get; set; }
        public bool? IsRandomized { get; set; }
        public bool? ShowCorrectAnswers { get; set; }
        public bool? ShowResultsImmediately { get; set; }
        public decimal? PassingScore { get; set; }
        public DateTime? AvailableFrom { get; set; }
        public DateTime? AvailableUntil { get; set; }
    }
}
