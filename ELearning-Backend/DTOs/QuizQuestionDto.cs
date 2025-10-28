namespace ELearning.API.DTOs
{
    public class QuizQuestionDto
    {
        public int Id { get; set; }
        public string Question { get; set; } = string.Empty;
        public string CorrectAnswer { get; set; } = string.Empty;
        public string? OptionA { get; set; }
        public string? OptionB { get; set; }
        public string? OptionC { get; set; }
        public string? OptionD { get; set; }
        public string? Explanation { get; set; }
        public decimal Points { get; set; }
        public int Order { get; set; }
        public string Type { get; set; } = string.Empty;
        public int QuizId { get; set; }
    }

    public class CreateQuizQuestionDto
    {
        public string Question { get; set; } = string.Empty;
        public string CorrectAnswer { get; set; } = string.Empty;
        public string? OptionA { get; set; }
        public string? OptionB { get; set; }
        public string? OptionC { get; set; }
        public string? OptionD { get; set; }
        public string? Explanation { get; set; }
        public decimal Points { get; set; } = 1;
        public int Order { get; set; } = 0;
        public string Type { get; set; } = "MultipleChoice";
        public int QuizId { get; set; }
    }

    public class UpdateQuizQuestionDto
    {
        public string? Question { get; set; }
        public string? CorrectAnswer { get; set; }
        public string? OptionA { get; set; }
        public string? OptionB { get; set; }
        public string? OptionC { get; set; }
        public string? OptionD { get; set; }
        public string? Explanation { get; set; }
        public decimal? Points { get; set; }
        public int? Order { get; set; }
        public string? Type { get; set; }
    }
}
