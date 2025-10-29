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

        [HttpPost("upload")]
        public async Task<ActionResult<DocumentDto>> UploadDocument([FromForm] CreateDocumentDto createDocumentDto, IFormFile? documentFile)
        {
            try
            {
                Console.WriteLine($"DocumentsController: Received document upload request");
                Console.WriteLine($"Document DTO: {System.Text.Json.JsonSerializer.Serialize(createDocumentDto)}");
                Console.WriteLine($"Document File: {documentFile?.FileName}, Size: {documentFile?.Length}");
                
                if (createDocumentDto == null)
                {
                    return BadRequest(new { message = "Document data is required" });
                }

                if (createDocumentDto.CourseId <= 0)
                {
                    return BadRequest(new { message = "Valid CourseId is required" });
                }

                // Handle file upload
                if (documentFile != null && documentFile.Length > 0)
                {
                    // Create uploads directory if it doesn't exist
                    var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "documents");
                    if (!Directory.Exists(uploadsPath))
                    {
                        Directory.CreateDirectory(uploadsPath);
                    }
                    
                    // Generate unique filename
                    var fileName = $"{DateTime.Now.Ticks}_{documentFile.FileName}";
                    var filePath = Path.Combine(uploadsPath, fileName);
                    
                    // Save file
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await documentFile.CopyToAsync(stream);
                    }
                    
                    // Update document file path
                    createDocumentDto.DocumentFile = $"uploads/documents/{fileName}";
                    createDocumentDto.FileSize = documentFile.Length;
                    
                    // Set file format from extension
                    var extension = Path.GetExtension(documentFile.FileName).ToLower().TrimStart('.');
                    createDocumentDto.FileFormat = extension.ToUpper();
                    
                    Console.WriteLine($"Document file saved to: {createDocumentDto.DocumentFile}");
                }

                var document = await _documentService.CreateDocumentAsync(createDocumentDto, createDocumentDto.CourseId);
                Console.WriteLine($"DocumentsController: Document created successfully with ID: {document.Id}");
                return CreatedAtAction(nameof(GetDocument), new { id = document.Id }, document);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DocumentsController: Error uploading document: {ex.Message}");
                Console.WriteLine($"DocumentsController: Stack trace: {ex.StackTrace}");
                return BadRequest(new { message = ex.Message, details = ex.StackTrace });
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

        [HttpGet("{id}/download")]
        public async Task<IActionResult> DownloadDocument(int id)
        {
            try
            {
                var document = await _documentService.GetDocumentByIdAsync(id);
                
                if (document == null)
                {
                    return NotFound(new { message = "Document not found" });
                }

                // Check if document has a file path or URL
                string filePath = null;
                string fileName = $"{document.Title}.{document.FileFormat?.ToLower() ?? "pdf"}";

                if (!string.IsNullOrEmpty(document.DocumentFile))
                {
                    // If DocumentFile contains a relative path, make it absolute
                    if (document.DocumentFile.StartsWith("uploads/") || document.DocumentFile.StartsWith("/uploads/"))
                    {
                        filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", document.DocumentFile.TrimStart('/'));
                    }
                    else if (document.DocumentFile.Contains("/") || document.DocumentFile.Contains("\\"))
                    {
                        // If it's already a full path, use it as is
                        filePath = document.DocumentFile;
                    }
                    else
                    {
                        // If it's just a filename, look in the documents folder
                        filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "documents", document.DocumentFile);
                    }
                }
                else if (!string.IsNullOrEmpty(document.DocumentUrl))
                {
                    // If it's an external URL, redirect to it
                    return Redirect(document.DocumentUrl);
                }
                else
                {
                    // Both DocumentFile and DocumentUrl are null
                    Console.WriteLine($"Document has no file path or URL. DocumentFile: {document.DocumentFile}, DocumentUrl: {document.DocumentUrl}");
                    return NotFound(new { message = "Document file not found. No file path or URL specified for this document." });
                }

                if (string.IsNullOrEmpty(filePath) || !System.IO.File.Exists(filePath))
                {
                    Console.WriteLine($"Document file not found. FilePath: {filePath}");
                    Console.WriteLine($"DocumentFile: {document.DocumentFile}");
                    Console.WriteLine($"Current Directory: {Directory.GetCurrentDirectory()}");
                    if (!string.IsNullOrEmpty(document.DocumentFile))
                    {
                        Console.WriteLine($"Expected path: {Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "documents", document.DocumentFile)}");
                    }
                    return NotFound(new { message = $"Document file not found on server. Path: {filePath}" });
                }

                // Get the file content
                var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
                var contentType = GetContentType(document.FileFormat);

                return File(fileBytes, contentType, fileName);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Document not found" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DocumentsController: Error downloading document: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{id}/upload-file")]
        public async Task<IActionResult> UploadFileForDocument(int id, IFormFile file)
        {
            try
            {
                var document = await _documentService.GetDocumentByIdAsync(id);
                
                if (document == null)
                {
                    return NotFound(new { message = "Document not found" });
                }

                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { message = "No file provided" });
                }

                // Create uploads directory if it doesn't exist
                var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "documents");
                if (!Directory.Exists(uploadsPath))
                {
                    Directory.CreateDirectory(uploadsPath);
                }
                
                // Generate unique filename
                var fileName = $"{DateTime.Now.Ticks}_{file.FileName}";
                var filePath = Path.Combine(uploadsPath, fileName);
                
                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
                
                // Update document file path in database
                var updateDto = new UpdateDocumentDto
                {
                    DocumentFile = $"uploads/documents/{fileName}",
                    FileSize = file.Length
                };
                
                var updatedDocument = await _documentService.UpdateDocumentAsync(id, updateDto);
                
                return Ok(new { message = "File uploaded successfully", document = updatedDocument });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Document not found" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DocumentsController: Error uploading file: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }

        private string GetContentType(string fileFormat)
        {
            return fileFormat.ToLower() switch
            {
                "pdf" => "application/pdf",
                "doc" => "application/msword",
                "docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "ppt" => "application/vnd.ms-powerpoint",
                "pptx" => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                "xls" => "application/vnd.ms-excel",
                "xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "txt" => "text/plain",
                "html" => "text/html",
                _ => "application/octet-stream"
            };
        }
    }
}
