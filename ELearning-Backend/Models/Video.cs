using System.ComponentModel.DataAnnotations;

namespace ELearning.API.Models
{
    public class Video
    {
        public int Id { get; set; }
        
        [Required]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public string Description { get; set; } = string.Empty;
        
        public string? VideoUrl { get; set; } // For external video URLs (YouTube, Vimeo, etc.)
        
        public string? VideoFile { get; set; } // For uploaded video files
        
        public string? Thumbnail { get; set; } // Video thumbnail image
        
        public int Duration { get; set; } // Duration in seconds
        
        public int Order { get; set; } // Display order within course
        
        public bool IsFree { get; set; } = false; // Free or premium content
        
        public bool IsPublished { get; set; } = true; // Published or draft
        
        public VideoType VideoType { get; set; } = VideoType.Upload; // Upload, YouTube, Vimeo, etc.
        
        public VideoQuality Quality { get; set; } = VideoQuality.HD; // HD, SD, 4K, etc.
        
        public string? Transcript { get; set; } // Video transcript/subtitles
        
        public string? Notes { get; set; } // Instructor notes
        
        public int CourseId { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Course Course { get; set; } = null!;
    }

    public enum VideoType
    {
        Upload,
        YouTube,
        Vimeo,
        Other
    }

    public enum VideoQuality
    {
        SD,
        HD,
        FHD,
        UHD4K
    }
}
