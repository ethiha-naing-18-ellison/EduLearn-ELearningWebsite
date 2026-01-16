using System.ComponentModel.DataAnnotations;

namespace ELearning.API.DTOs
{
    public class MultipleChoiceDto
    {
        public int Id { get; set; }
        public int CourseId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Instructions { get; set; }
        public int TotalPoints { get; set; } = 0;
        public int? TimeLimit { get; set; }
        public int OrderIndex { get; set; } = 1;
        public bool IsPublished { get; set; } = true;
        public bool IsFree { get; set; } = false;
        public bool AllowRetake { get; set; } = true;
        public int MaxAttempts { get; set; } = 3;
        public int PassingScore { get; set; } = 70;
        public bool ShowCorrectAnswers { get; set; } = true;
        public bool ShowResultsImmediately { get; set; } = true;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<MultipleChoiceQuestionDto> Questions { get; set; } = new List<MultipleChoiceQuestionDto>();
    }

    public class CreateMultipleChoiceDto
    {
        [Required]
        public int CourseId { get; set; }
        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Instructions { get; set; }
        public int? TimeLimit { get; set; }
        public int OrderIndex { get; set; } = 1;
        public bool IsPublished { get; set; } = true;
        public bool IsFree { get; set; } = false;
        public bool AllowRetake { get; set; } = true;
        public int MaxAttempts { get; set; } = 3;
        public int PassingScore { get; set; } = 70;
        public bool ShowCorrectAnswers { get; set; } = true;
        public bool ShowResultsImmediately { get; set; } = true;
        public List<CreateMultipleChoiceQuestionDto> Questions { get; set; } = new List<CreateMultipleChoiceQuestionDto>();
    }

    public class UpdateMultipleChoiceDto
    {
        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Instructions { get; set; }
        public int? TimeLimit { get; set; }
        public int OrderIndex { get; set; } = 1;
        public bool IsPublished { get; set; } = true;
        public bool IsFree { get; set; } = false;
        public bool AllowRetake { get; set; } = true;
        public int MaxAttempts { get; set; } = 3;
        public int PassingScore { get; set; } = 70;
        public bool ShowCorrectAnswers { get; set; } = true;
        public bool ShowResultsImmediately { get; set; } = true;
        public int CourseId { get; set; }
        public List<UpdateMultipleChoiceQuestionDto> Questions { get; set; } = new List<UpdateMultipleChoiceQuestionDto>();
    }

    // Quiz Attempt DTOs
    public class MultipleChoiceAttemptDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int MultipleChoiceId { get; set; }
        public decimal Score { get; set; }
        public decimal TotalPoints { get; set; }
        public decimal Percentage { get; set; }
        public bool IsPassed { get; set; }
        public string Answers { get; set; } = string.Empty;
        public int SubmissionCount { get; set; } = 1;
        public DateTime StartedAt { get; set; }
        public DateTime CompletedAt { get; set; }
        public int? TimeSpent { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class SubmitQuizDto
    {
        [Required]
        public Dictionary<int, string> Answers { get; set; } = new Dictionary<int, string>(); // QuestionId -> Answer (A, B, C, D)
        public int? TimeSpent { get; set; } // Time spent in seconds
    }

    public class QuizSubmissionResultDto
    {
        public int AttemptId { get; set; }
        public decimal Score { get; set; }
        public decimal TotalPoints { get; set; }
        public decimal Percentage { get; set; }
        public bool IsPassed { get; set; }
        public int AttemptNumber { get; set; }
        public int MaxAttempts { get; set; }
        public bool CanRetake { get; set; }
        public Dictionary<int, QuestionResultDto> QuestionResults { get; set; } = new Dictionary<int, QuestionResultDto>();
    }

    public class QuestionResultDto
    {
        public bool IsCorrect { get; set; }
        public string? SelectedAnswer { get; set; }
        public string CorrectAnswer { get; set; } = string.Empty;
        public int PointsEarned { get; set; }
        public int PointsAvailable { get; set; }
    }
}