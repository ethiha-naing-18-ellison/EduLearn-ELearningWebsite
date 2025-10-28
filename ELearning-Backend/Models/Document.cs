using System.ComponentModel.DataAnnotations;

namespace ELearning.API.Models
{
    public class Document
    {
        public int Id { get; set; }
        
        [Required]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public string Description { get; set; } = string.Empty;
        
        public string? DocumentUrl { get; set; } // For external document URLs
        
        public string? DocumentFile { get; set; } // For uploaded document files
        
        public string? Thumbnail { get; set; } // Document thumbnail/preview image
        
        public long FileSize { get; set; } // File size in bytes
        
        public int PageCount { get; set; } // Number of pages (for PDFs)
        
        public int Order { get; set; } // Display order within course
        
        public bool IsFree { get; set; } = false; // Free or premium content
        
        public bool IsPublished { get; set; } = true; // Published or draft
        
        public DocumentType DocumentType { get; set; } = DocumentType.PDF; // PDF, DOC, DOCX, PPTX, etc.
        
        public string FileFormat { get; set; } = "PDF"; // File extension
        
        public string Version { get; set; } = "1.0"; // Document version
        
        public string Language { get; set; } = "en"; // Document language
        
        public string? Keywords { get; set; } // Search keywords/tags
        
        public string? Summary { get; set; } // Document summary
        
        public string? Notes { get; set; } // Instructor notes
        
        public int CourseId { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Course Course { get; set; } = null!;
    }

    public enum DocumentType
    {
        PDF,
        DOC,
        DOCX,
        PPT,
        PPTX,
        XLS,
        XLSX,
        TXT,
        RTF,
        HTML,
        Other
    }
}
