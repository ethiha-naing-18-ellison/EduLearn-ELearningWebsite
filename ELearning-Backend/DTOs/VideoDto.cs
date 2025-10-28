namespace ELearning.API.DTOs
{
    public class VideoDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? VideoUrl { get; set; }
        public string? VideoFile { get; set; }
        public string? Thumbnail { get; set; }
        public int Duration { get; set; }
        public int Order { get; set; }
        public bool IsFree { get; set; }
        public bool IsPublished { get; set; }
        public string VideoType { get; set; } = string.Empty;
        public string Quality { get; set; } = string.Empty;
        public string? Transcript { get; set; }
        public string? Notes { get; set; }
        public int CourseId { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateVideoDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? VideoUrl { get; set; }
        public string? VideoFile { get; set; }
        public string? Thumbnail { get; set; }
        public int Duration { get; set; } = 0;
        public int Order { get; set; } = 1;
        public bool IsFree { get; set; } = false;
        public bool IsPublished { get; set; } = true;
        public string VideoType { get; set; } = "Upload";
        public string Quality { get; set; } = "HD";
        public string? Transcript { get; set; }
        public string? Notes { get; set; }
        public int CourseId { get; set; }
    }

    public class UpdateVideoDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? VideoUrl { get; set; }
        public string? VideoFile { get; set; }
        public string? Thumbnail { get; set; }
        public int? Duration { get; set; }
        public int? Order { get; set; }
        public bool? IsFree { get; set; }
        public bool? IsPublished { get; set; }
        public string? VideoType { get; set; }
        public string? Quality { get; set; }
        public string? Transcript { get; set; }
        public string? Notes { get; set; }
    }
}
