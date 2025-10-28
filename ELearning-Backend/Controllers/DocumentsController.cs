using Microsoft.AspNetCore.Mvc;
using ELearning.API.Services;
using ELearning.API.DTOs;

namespace ELearning.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentsController : ControllerBase
    {
        private readonly IDocumentService _documentService;

        public DocumentsController(IDocumentService documentService)
        {
            _documentService = documentService;
        }

        [HttpGet("course/{courseId}")]
        public async Task<ActionResult<IEnumerable<DocumentDto>>> GetCourseDocuments(int courseId)
        {
            try
            {
                var documents = await _documentService.GetCourseDocumentsAsync(courseId);
                return Ok(documents);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DocumentsController: Error fetching course documents: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DocumentDto>> GetDocument(int id)
        {
            try
            {
                var document = await _documentService.GetDocumentByIdAsync(id);
                return Ok(document);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Document not found" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DocumentsController: Error fetching document: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<DocumentDto>> CreateDocument([FromBody] CreateDocumentDto createDocumentDto)
        {
            try
            {
                Console.WriteLine($"DocumentsController: Received document creation request");
                Console.WriteLine($"Document DTO: {System.Text.Json.JsonSerializer.Serialize(createDocumentDto)}");
                
                if (createDocumentDto == null)
                {
                    return BadRequest(new { message = "Document data is required" });
                }

                if (createDocumentDto.CourseId <= 0)
                {
                    return BadRequest(new { message = "Valid CourseId is required" });
                }

                var document = await _documentService.CreateDocumentAsync(createDocumentDto, createDocumentDto.CourseId);
                Console.WriteLine($"DocumentsController: Document created successfully with ID: {document.Id}");
                return CreatedAtAction(nameof(GetDocument), new { id = document.Id }, document);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DocumentsController: Error creating document: {ex.Message}");
                Console.WriteLine($"DocumentsController: Stack trace: {ex.StackTrace}");
                return BadRequest(new { message = ex.Message, details = ex.StackTrace });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<DocumentDto>> UpdateDocument(int id, [FromBody] UpdateDocumentDto updateDocumentDto)
        {
            try
            {
                if (updateDocumentDto == null)
                {
                    return BadRequest(new { message = "Document data is required" });
                }

                var document = await _documentService.UpdateDocumentAsync(id, updateDocumentDto);
                return Ok(document);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Document not found" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DocumentsController: Error updating document: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteDocument(int id)
        {
            try
            {
                var result = await _documentService.DeleteDocumentAsync(id);
                if (!result)
                {
                    return NotFound(new { message = "Document not found" });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DocumentsController: Error deleting document: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
