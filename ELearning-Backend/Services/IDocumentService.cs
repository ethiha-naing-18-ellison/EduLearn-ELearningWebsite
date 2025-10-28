using ELearning.API.DTOs;

namespace ELearning.API.Services
{
    public interface IDocumentService
    {
        Task<IEnumerable<DocumentDto>> GetCourseDocumentsAsync(int courseId);
        Task<DocumentDto> GetDocumentByIdAsync(int id);
        Task<DocumentDto> CreateDocumentAsync(CreateDocumentDto createDocumentDto, int courseId);
        Task<DocumentDto> UpdateDocumentAsync(int id, UpdateDocumentDto updateDocumentDto);
        Task<bool> DeleteDocumentAsync(int id);
    }

    public class DocumentDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? DocumentUrl { get; set; }
        public string? DocumentFile { get; set; }
        public string? Thumbnail { get; set; }
        public long FileSize { get; set; }
        public int PageCount { get; set; }
        public int Order { get; set; }
        public bool IsFree { get; set; }
        public bool IsPublished { get; set; }
        public string DocumentType { get; set; } = string.Empty;
        public string FileFormat { get; set; } = string.Empty;
        public string Version { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;
        public string? Keywords { get; set; }
        public string? Summary { get; set; }
        public string? Notes { get; set; }
        public int CourseId { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateDocumentDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? DocumentUrl { get; set; }
        public string? DocumentFile { get; set; }
        public string? Thumbnail { get; set; }
        public long FileSize { get; set; } = 0;
        public int PageCount { get; set; } = 0;
        public int Order { get; set; } = 1;
        public bool IsFree { get; set; } = false;
        public bool IsPublished { get; set; } = true;
        public string DocumentType { get; set; } = "PDF";
        public string FileFormat { get; set; } = "PDF";
        public string Version { get; set; } = "1.0";
        public string Language { get; set; } = "en";
        public string? Keywords { get; set; }
        public string? Summary { get; set; }
        public string? Notes { get; set; }
        public int CourseId { get; set; }
    }

    public class UpdateDocumentDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? DocumentUrl { get; set; }
        public string? DocumentFile { get; set; }
        public string? Thumbnail { get; set; }
        public long? FileSize { get; set; }
        public int? PageCount { get; set; }
        public int? Order { get; set; }
        public bool? IsFree { get; set; }
        public bool? IsPublished { get; set; }
        public string? DocumentType { get; set; }
        public string? FileFormat { get; set; }
        public string? Version { get; set; }
        public string? Language { get; set; }
        public string? Keywords { get; set; }
        public string? Summary { get; set; }
        public string? Notes { get; set; }
    }
}
