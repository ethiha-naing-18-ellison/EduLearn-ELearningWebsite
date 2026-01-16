using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ELearning.API.Services;
using ELearning.API.DTOs;

namespace ELearning.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MaterialCompletionsController : ControllerBase
    {
        private readonly IMaterialCompletionService _materialCompletionService;

        public MaterialCompletionsController(IMaterialCompletionService materialCompletionService)
        {
            _materialCompletionService = materialCompletionService;
        }

        [HttpPost("mark-complete")]
        public async Task<ActionResult<MaterialCompletionDto>> MarkMaterialComplete([FromBody] MarkMaterialCompleteDto dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                if (userId == 0)
                {
                    return Unauthorized(new { message = "User not authenticated." });
                }

                var completion = await _materialCompletionService.MarkMaterialCompleteAsync(userId, dto);
                return Ok(completion);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error marking material as complete.", error = ex.Message });
            }
        }

        [HttpGet("course/{courseId}/completions")]
        public async Task<ActionResult<Dictionary<string, bool>>> GetCourseCompletions(int courseId)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                if (userId == 0)
                {
                    return Unauthorized(new { message = "User not authenticated." });
                }

                var completions = await _materialCompletionService.GetCourseMaterialCompletionsAsync(userId, courseId);
                return Ok(completions);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error retrieving completions.", error = ex.Message });
            }
        }

        [HttpGet("check")]
        public async Task<ActionResult<bool>> CheckCompletion([FromQuery] int courseId, [FromQuery] string materialType, [FromQuery] int materialId)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                if (userId == 0)
                {
                    return Unauthorized(new { message = "User not authenticated." });
                }

                var isComplete = await _materialCompletionService.IsMaterialCompleteAsync(userId, courseId, materialType, materialId);
                return Ok(new { isCompleted = isComplete });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error checking completion.", error = ex.Message });
            }
        }
    }
}

