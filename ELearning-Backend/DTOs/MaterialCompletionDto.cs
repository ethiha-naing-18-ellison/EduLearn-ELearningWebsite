namespace ELearning.API.DTOs
{
    public class MaterialCompletionDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int CourseId { get; set; }
        public string MaterialType { get; set; } = string.Empty;
        public int MaterialId { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? CompletedAt { get; set; }
    }

    public class MarkMaterialCompleteDto
    {
        public int CourseId { get; set; }
        public string MaterialType { get; set; } = string.Empty;
        public int MaterialId { get; set; }
    }

    public class MaterialCompletionStatusDto
    {
        public string MaterialType { get; set; } = string.Empty;
        public int MaterialId { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? CompletedAt { get; set; }
    }
}

