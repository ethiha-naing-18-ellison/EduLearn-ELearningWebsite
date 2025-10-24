namespace ELearning.API.DTOs
{
    public class CourseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Thumbnail { get; set; }
        public decimal Price { get; set; }
        public bool IsFree { get; set; }
        public string Level { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int Duration { get; set; }
        public string? Prerequisites { get; set; }
        public string? LearningOutcomes { get; set; }
        public int InstructorId { get; set; }
        public UserDto Instructor { get; set; } = null!;
        public CategoryDto? Category { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? PublishedAt { get; set; }
        public int EnrollmentsCount { get; set; }
        public double Rating { get; set; }
    }

    public class CreateCourseDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Thumbnail { get; set; }
        public decimal Price { get; set; }
        public bool IsFree { get; set; }
        public string Level { get; set; } = string.Empty;
        public int Duration { get; set; }
        public string? Prerequisites { get; set; }
        public string? LearningOutcomes { get; set; }
        public int InstructorId { get; set; }
        public int? CategoryId { get; set; }
    }

    public class UpdateCourseDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Thumbnail { get; set; }
        public decimal? Price { get; set; }
        public bool? IsFree { get; set; }
        public string? Level { get; set; }
        public string? Status { get; set; }
        public int? Duration { get; set; }
        public string? Prerequisites { get; set; }
        public string? LearningOutcomes { get; set; }
        public int? InstructorId { get; set; }
        public int? CategoryId { get; set; }
    }
}
