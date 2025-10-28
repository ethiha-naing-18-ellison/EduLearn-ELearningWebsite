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

}
