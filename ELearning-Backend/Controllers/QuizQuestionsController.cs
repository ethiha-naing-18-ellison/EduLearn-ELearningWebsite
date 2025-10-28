using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ELearning.API.DTOs;
using ELearning.API.Services;

namespace ELearning.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuizQuestionsController : ControllerBase
    {
        private readonly IQuizQuestionService _quizQuestionService;

        public QuizQuestionsController(IQuizQuestionService quizQuestionService)
        {
            _quizQuestionService = quizQuestionService;
        }

        [HttpGet("quiz/{quizId}")]
        public async Task<ActionResult<IEnumerable<QuizQuestionDto>>> GetQuizQuestions(int quizId)
        {
            try
            {
                var questions = await _quizQuestionService.GetQuizQuestionsAsync(quizId);
                return Ok(questions);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<QuizQuestionDto>> GetQuizQuestion(int id)
        {
            try
            {
                var question = await _quizQuestionService.GetQuizQuestionByIdAsync(id);
                return Ok(question);
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
        public async Task<ActionResult<QuizQuestionDto>> CreateQuizQuestion([FromBody] CreateQuizQuestionDto createQuizQuestionDto)
        {
            try
            {
                var question = await _quizQuestionService.CreateQuizQuestionAsync(createQuizQuestionDto, createQuizQuestionDto.QuizId);
                return CreatedAtAction(nameof(GetQuizQuestion), new { id = question.Id }, question);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<QuizQuestionDto>> UpdateQuizQuestion(int id, [FromBody] UpdateQuizQuestionDto updateQuizQuestionDto)
        {
            try
            {
                var question = await _quizQuestionService.UpdateQuizQuestionAsync(id, updateQuizQuestionDto);
                return Ok(question);
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

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteQuizQuestion(int id)
        {
            try
            {
                var result = await _quizQuestionService.DeleteQuizQuestionAsync(id);
                if (result)
                    return NoContent();
                return NotFound();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("quiz/{quizId}/reorder")]
        public async Task<ActionResult> ReorderQuestions(int quizId, [FromBody] List<int> questionIds)
        {
            try
            {
                var result = await _quizQuestionService.ReorderQuestionsAsync(quizId, questionIds);
                if (result)
                    return Ok(new { message = "Questions reordered successfully" });
                return BadRequest(new { message = "Failed to reorder questions" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
