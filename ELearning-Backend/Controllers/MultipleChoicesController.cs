using Microsoft.AspNetCore.Mvc;
using ELearning.API.DTOs;
using ELearning.API.Services;
using Microsoft.AspNetCore.Authorization;

namespace ELearning.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MultipleChoicesController : ControllerBase
    {
        private readonly IMultipleChoiceService _multipleChoiceService;

        public MultipleChoicesController(IMultipleChoiceService multipleChoiceService)
        {
            _multipleChoiceService = multipleChoiceService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MultipleChoiceDto>>> GetAll()
        {
            try
            {
                var multipleChoices = await _multipleChoiceService.GetAllAsync();
                return Ok(multipleChoices);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving multiple choice questions.", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MultipleChoiceDto>> GetById(int id)
        {
            try
            {
                var multipleChoice = await _multipleChoiceService.GetByIdAsync(id);
                if (multipleChoice == null)
                {
                    return NotFound(new { message = "Multiple choice question not found." });
                }

                return Ok(multipleChoice);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the multiple choice question.", error = ex.Message });
            }
        }

        [HttpGet("course/{courseId}")]
        public async Task<ActionResult<IEnumerable<MultipleChoiceDto>>> GetByCourseId(int courseId)
        {
            try
            {
                var multipleChoices = await _multipleChoiceService.GetByCourseIdAsync(courseId);
                return Ok(multipleChoices);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving multiple choice questions for the course.", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<MultipleChoiceDto>> Create(CreateMultipleChoiceDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var multipleChoice = await _multipleChoiceService.CreateAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { id = multipleChoice.Id }, multipleChoice);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the quiz.", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<MultipleChoiceDto>> Update(int id, UpdateMultipleChoiceDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var multipleChoice = await _multipleChoiceService.UpdateAsync(id, updateDto);
                if (multipleChoice == null)
                {
                    return NotFound(new { message = "Quiz not found." });
                }

                return Ok(multipleChoice);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the quiz.", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var deleted = await _multipleChoiceService.DeleteAsync(id);
                if (!deleted)
                {
                    return NotFound(new { message = "Quiz not found." });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"MultipleChoicesController Delete error: {ex.Message}");
                Console.WriteLine($"Inner exception: {ex.InnerException?.Message}");
                
                // Return 400 for client errors (like constraint violations), 500 for server errors
                if (ex.Message.Contains("constraint") || ex.Message.Contains("foreign key") || ex.Message.Contains("reference"))
                {
                    return BadRequest(new { message = ex.Message, error = "Cannot delete quiz because it has related records that prevent deletion." });
                }
                
                return StatusCode(500, new { message = "An error occurred while deleting the quiz.", error = ex.Message });
            }
        }

        [HttpPost("{id}/submit")]
        public async Task<ActionResult<QuizSubmissionResultDto>> SubmitQuiz(int id, SubmitQuizDto submitDto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                if (userId == 0)
                {
                    return Unauthorized(new { message = "User not authenticated." });
                }

                var result = await _multipleChoiceService.SubmitQuizAsync(id, userId, submitDto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while submitting the quiz.", error = ex.Message });
            }
        }

        [HttpGet("{id}/attempts")]
        public async Task<ActionResult<int>> GetAttemptCount(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                if (userId == 0)
                {
                    return Unauthorized(new { message = "User not authenticated." });
                }

                var count = await _multipleChoiceService.GetUserAttemptCountAsync(id, userId);
                return Ok(new { attemptCount = count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving attempt count.", error = ex.Message });
            }
        }

        [HttpGet("{id}/attempts/all")]
        public async Task<ActionResult<IEnumerable<MultipleChoiceAttemptDto>>> GetAllAttempts(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                if (userId == 0)
                {
                    return Unauthorized(new { message = "User not authenticated." });
                }

                var attempts = await _multipleChoiceService.GetUserAttemptsAsync(id, userId);
                return Ok(attempts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving attempts.", error = ex.Message });
            }
        }

        [HttpGet("{id}/can-retake")]
        public async Task<ActionResult<bool>> CanRetake(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
                if (userId == 0)
                {
                    return Unauthorized(new { message = "User not authenticated." });
                }

                var canRetake = await _multipleChoiceService.CanUserRetakeQuizAsync(id, userId);
                return Ok(new { canRetake });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while checking retake eligibility.", error = ex.Message });
            }
        }
    }
}
