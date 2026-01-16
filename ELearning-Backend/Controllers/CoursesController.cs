using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ELearning.API.DTOs;
using ELearning.API.Services;
using System.IO;

namespace ELearning.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CoursesController : ControllerBase
    {
        private readonly ICourseService _courseService;

        public CoursesController(ICourseService courseService)
        {
            _courseService = courseService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CourseDto>>> GetCourses(
            [FromQuery] string? search = null,
            [FromQuery] string? level = null,
            [FromQuery] string? category = null,
            [FromQuery] int page = 1,
            [FromQuery] int limit = 12)
        {
            try
            {
                var courses = await _courseService.GetPublishedCoursesAsync(search, level, category, page, limit);
                return Ok(courses);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CourseDto>> GetCourse(int id)
        {
            try
            {
                var course = await _courseService.GetCourseByIdAsync(id);
                return Ok(course);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<CourseDto>> CreateCourse([FromBody] CreateCourseDto createCourseDto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var course = await _courseService.CreateCourseAsync(createCourseDto, userId);
                return CreatedAtAction(nameof(GetCourse), new { id = course.Id }, course);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<CourseDto>> UpdateCourse(int id, [FromBody] UpdateCourseDto updateCourseDto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var course = await _courseService.UpdateCourseAsync(id, updateCourseDto, userId);
                return Ok(course);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult> DeleteCourse(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var result = await _courseService.DeleteCourseAsync(id, userId);
                if (result)
                    return NoContent();
                return NotFound();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("category/{categoryId}")]
        public async Task<ActionResult<IEnumerable<CourseDto>>> GetCoursesByCategory(int categoryId)
        {
            try
            {
                var courses = await _courseService.GetCoursesByCategoryAsync(categoryId);
                return Ok(courses);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<CourseDto>>> SearchCourses([FromQuery] string q)
        {
            try
            {
                var courses = await _courseService.SearchCoursesAsync(q);
                return Ok(courses);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}/certificate-settings")]
        [Authorize]
        [RequestSizeLimit(10 * 1024 * 1024)] // 10MB limit for signature
        [RequestFormLimits(MultipartBodyLengthLimit = 10 * 1024 * 1024)]
        public async Task<ActionResult<CourseDto>> UpdateCertificateSettings(int id, [FromForm] string? certificateInstructorName, [FromForm] IFormFile? certificateSignature)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                string? signaturePath = null;

                // Handle signature file upload
                if (certificateSignature != null && certificateSignature.Length > 0)
                {
                    // Validate file type (only images)
                    var allowedExtensions = new[] { ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp" };
                    var fileExtension = Path.GetExtension(certificateSignature.FileName).ToLower();
                    if (!allowedExtensions.Contains(fileExtension))
                    {
                        return BadRequest(new { message = "Invalid file type. Only image files are allowed." });
                    }

                    // Check file size (limit to 10MB)
                    const long maxFileSize = 10 * 1024 * 1024; // 10MB
                    if (certificateSignature.Length > maxFileSize)
                    {
                        return BadRequest(new { message = "Signature file is too large. Maximum size is 10MB." });
                    }

                    // Create uploads directory if it doesn't exist
                    var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "certificates");
                    if (!Directory.Exists(uploadsPath))
                    {
                        Directory.CreateDirectory(uploadsPath);
                    }

                    // Generate unique filename
                    var fileName = $"signature_{id}_{DateTime.Now.Ticks}{fileExtension}";
                    var filePath = Path.Combine(uploadsPath, fileName);

                    // Save file
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await certificateSignature.CopyToAsync(stream);
                    }

                    // Set signature path (relative to wwwroot)
                    signaturePath = $"/uploads/certificates/{fileName}";
                }

                var course = await _courseService.UpdateCertificateSettingsAsync(id, certificateInstructorName, signaturePath, userId);
                return Ok(course);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}/certificate-instructors")]
        [Authorize]
        public async Task<ActionResult<CourseDto>> UpdateCertificateInstructors(int id, [FromBody] UpdateCertificateInstructorsDto dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var course = await _courseService.UpdateCertificateInstructorsAsync(
                    id, 
                    dto.CertificateInstructorName1, 
                    dto.CertificateInstructorName2, 
                    dto.CertificateInstructorName3, 
                    userId
                );
                return Ok(course);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    public class UpdateCertificateInstructorsDto
    {
        public string? CertificateInstructorName1 { get; set; }
        public string? CertificateInstructorName2 { get; set; }
        public string? CertificateInstructorName3 { get; set; }
    }
}
