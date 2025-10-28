using Microsoft.EntityFrameworkCore;
using AutoMapper;
using ELearning.API.Data;
using ELearning.API.DTOs;
using ELearning.API.Models;

namespace ELearning.API.Services
{
    public class DocumentService : IDocumentService
    {
        private readonly ELearningDbContext _context;
        private readonly IMapper _mapper;

        public DocumentService(ELearningDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<DocumentDto>> GetCourseDocumentsAsync(int courseId)
        {
            var documents = await _context.Documents
                .Where(d => d.CourseId == courseId)
                .OrderBy(d => d.Order)
                .ToListAsync();

            return _mapper.Map<IEnumerable<DocumentDto>>(documents);
        }

        public async Task<DocumentDto> GetDocumentByIdAsync(int id)
        {
            var document = await _context.Documents
                .Include(d => d.Course)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (document == null)
            {
                throw new KeyNotFoundException("Document not found");
            }

            return _mapper.Map<DocumentDto>(document);
        }

        public async Task<DocumentDto> CreateDocumentAsync(CreateDocumentDto createDocumentDto, int courseId)
        {
            try
            {
                // Debug logging
                Console.WriteLine($"Creating document: Title={createDocumentDto.Title}, CourseId={courseId}");
                Console.WriteLine($"Document data: {System.Text.Json.JsonSerializer.Serialize(createDocumentDto)}");

                // Parse the DocumentType enum safely
                DocumentType documentType = DocumentType.PDF; // Default value
                if (!string.IsNullOrEmpty(createDocumentDto.DocumentType) && Enum.TryParse<DocumentType>(createDocumentDto.DocumentType, out var parsedDocumentType))
                {
                    documentType = parsedDocumentType;
                }

                var document = new Document
                {
                    Title = createDocumentDto.Title,
                    Description = createDocumentDto.Description,
                    DocumentUrl = createDocumentDto.DocumentUrl,
                    DocumentFile = createDocumentDto.DocumentFile,
                    Thumbnail = createDocumentDto.Thumbnail,
                    FileSize = createDocumentDto.FileSize,
                    PageCount = createDocumentDto.PageCount,
                    Order = createDocumentDto.Order,
                    IsFree = createDocumentDto.IsFree,
                    IsPublished = createDocumentDto.IsPublished,
                    DocumentType = documentType,
                    FileFormat = createDocumentDto.FileFormat,
                    Version = createDocumentDto.Version,
                    Language = createDocumentDto.Language,
                    Keywords = createDocumentDto.Keywords,
                    Summary = createDocumentDto.Summary,
                    Notes = createDocumentDto.Notes,
                    CourseId = courseId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Documents.Add(document);
                await _context.SaveChangesAsync();

                Console.WriteLine($"Document created successfully with ID: {document.Id}");
                return await GetDocumentByIdAsync(document.Id);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating document: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw;
            }
        }

        public async Task<DocumentDto> UpdateDocumentAsync(int id, UpdateDocumentDto updateDocumentDto)
        {
            var document = await _context.Documents
                .FirstOrDefaultAsync(d => d.Id == id);

            if (document == null)
            {
                throw new KeyNotFoundException("Document not found");
            }

            if (!string.IsNullOrEmpty(updateDocumentDto.Title))
                document.Title = updateDocumentDto.Title;

            if (!string.IsNullOrEmpty(updateDocumentDto.Description))
                document.Description = updateDocumentDto.Description;

            if (!string.IsNullOrEmpty(updateDocumentDto.DocumentUrl))
                document.DocumentUrl = updateDocumentDto.DocumentUrl;

            if (!string.IsNullOrEmpty(updateDocumentDto.DocumentFile))
                document.DocumentFile = updateDocumentDto.DocumentFile;

            if (!string.IsNullOrEmpty(updateDocumentDto.Thumbnail))
                document.Thumbnail = updateDocumentDto.Thumbnail;

            if (updateDocumentDto.FileSize.HasValue)
                document.FileSize = updateDocumentDto.FileSize.Value;

            if (updateDocumentDto.PageCount.HasValue)
                document.PageCount = updateDocumentDto.PageCount.Value;

            if (updateDocumentDto.Order.HasValue)
                document.Order = updateDocumentDto.Order.Value;

            if (updateDocumentDto.IsFree.HasValue)
                document.IsFree = updateDocumentDto.IsFree.Value;

            if (updateDocumentDto.IsPublished.HasValue)
                document.IsPublished = updateDocumentDto.IsPublished.Value;

            if (!string.IsNullOrEmpty(updateDocumentDto.DocumentType) && Enum.TryParse<DocumentType>(updateDocumentDto.DocumentType, out var parsedDocumentType))
                document.DocumentType = parsedDocumentType;

            if (!string.IsNullOrEmpty(updateDocumentDto.FileFormat))
                document.FileFormat = updateDocumentDto.FileFormat;

            if (!string.IsNullOrEmpty(updateDocumentDto.Version))
                document.Version = updateDocumentDto.Version;

            if (!string.IsNullOrEmpty(updateDocumentDto.Language))
                document.Language = updateDocumentDto.Language;

            if (!string.IsNullOrEmpty(updateDocumentDto.Keywords))
                document.Keywords = updateDocumentDto.Keywords;

            if (!string.IsNullOrEmpty(updateDocumentDto.Summary))
                document.Summary = updateDocumentDto.Summary;

            if (!string.IsNullOrEmpty(updateDocumentDto.Notes))
                document.Notes = updateDocumentDto.Notes;

            document.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetDocumentByIdAsync(document.Id);
        }

        public async Task<bool> DeleteDocumentAsync(int id)
        {
            var document = await _context.Documents
                .FirstOrDefaultAsync(d => d.Id == id);

            if (document == null)
            {
                return false;
            }

            _context.Documents.Remove(document);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
