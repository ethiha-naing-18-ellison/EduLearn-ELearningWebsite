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
                return StatusCode(500, new { message = "An error occurred while deleting the quiz.", error = ex.Message });
            }
        }
    }
}
