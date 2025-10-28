using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ELearning.API.DTOs;
using ELearning.API.Services;

namespace ELearning.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuizzesController : ControllerBase
    {
        private readonly IQuizService _quizService;

        public QuizzesController(IQuizService quizService)
        {
            _quizService = quizService;
        }

        [HttpGet("course/{courseId}")]
        public async Task<ActionResult<IEnumerable<QuizDto>>> GetQuizzesByCourse(int courseId)
        {
            try
            {
                var quizzes = await _quizService.GetCourseQuizzesAsync(courseId);
                return Ok(quizzes);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<QuizDto>> GetQuiz(int id)
        {
            try
            {
                var quiz = await _quizService.GetQuizByIdAsync(id);
                return Ok(quiz);
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
        public async Task<ActionResult<QuizDto>> CreateQuiz([FromBody] CreateQuizDto createQuizDto)
        {
            try
            {
                var quiz = await _quizService.CreateQuizAsync(createQuizDto, createQuizDto.CourseId);
                return CreatedAtAction(nameof(GetQuiz), new { id = quiz.Id }, quiz);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<QuizDto>> UpdateQuiz(int id, [FromBody] UpdateQuizDto updateQuizDto)
        {
            try
            {
                var quiz = await _quizService.UpdateQuizAsync(id, updateQuizDto);
                return Ok(quiz);
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
        public async Task<ActionResult> DeleteQuiz(int id)
        {
            try
            {
                var result = await _quizService.DeleteQuizAsync(id);
                if (result)
                    return NoContent();
                return NotFound();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
