using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ELearning.API.DTOs;
using ELearning.API.Services;

namespace ELearning.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EnrollmentsController : ControllerBase
    {
        private readonly IEnrollmentService _enrollmentService;

        public EnrollmentsController(IEnrollmentService enrollmentService)
        {
            _enrollmentService = enrollmentService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<EnrollmentDto>>> GetEnrollments()
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var enrollments = await _enrollmentService.GetUserEnrollmentsAsync(userId);
                return Ok(enrollments);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<EnrollmentDto>>> GetUserEnrollments(int userId)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                if (currentUserId != userId)
                {
                    return Unauthorized(new { message = "You can only view your own enrollments" });
                }

                var enrollments = await _enrollmentService.GetUserEnrollmentsAsync(userId);
                return Ok(enrollments);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("enroll")]
        public async Task<ActionResult<EnrollmentDto>> EnrollInCourse([FromBody] EnrollRequestDto enrollRequest)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var enrollment = await _enrollmentService.EnrollInCourseAsync(userId, enrollRequest.CourseId);
                return CreatedAtAction(nameof(GetUserEnrollments), new { userId }, enrollment);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
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

        [HttpDelete("unenroll")]
        public async Task<ActionResult> UnenrollFromCourse([FromBody] UnenrollRequestDto unenrollRequest)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var result = await _enrollmentService.UnenrollFromCourseAsync(userId, unenrollRequest.CourseId);
                if (result)
                    return NoContent();
                return NotFound();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("check")]
        public async Task<ActionResult<bool>> CheckEnrollment([FromQuery] int courseId)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var isEnrolled = await _enrollmentService.IsEnrolledAsync(userId, courseId);
                return Ok(new { isEnrolled });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("status")]
        public async Task<ActionResult<EnrollmentDto>> UpdateEnrollmentStatus([FromBody] UpdateEnrollmentStatusDto updateStatusDto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                var enrollment = await _enrollmentService.UpdateEnrollmentStatusAsync(userId, updateStatusDto.CourseId, updateStatusDto.Status);
                return Ok(enrollment);
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
    }

    public class EnrollRequestDto
    {
        public int CourseId { get; set; }
    }

    public class UnenrollRequestDto
    {
        public int CourseId { get; set; }
    }

    public class UpdateEnrollmentStatusDto
    {
        public int CourseId { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
