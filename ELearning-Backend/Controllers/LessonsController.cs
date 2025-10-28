using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ELearning.API.DTOs;
using ELearning.API.Services;

namespace ELearning.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LessonsController : ControllerBase
    {
        private readonly ILessonService _lessonService;

        public LessonsController(ILessonService lessonService)
        {
            _lessonService = lessonService;
        }

        [HttpGet("course/{courseId}")]
        public async Task<ActionResult<IEnumerable<LessonDto>>> GetLessonsByCourse(int courseId)
        {
            try
            {
                var lessons = await _lessonService.GetCourseLessonsAsync(courseId);
                return Ok(lessons);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<LessonDto>> GetLesson(int id)
        {
            try
            {
                var lesson = await _lessonService.GetLessonByIdAsync(id);
                return Ok(lesson);
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
        public async Task<ActionResult<LessonDto>> CreateLesson([FromBody] CreateLessonDto createLessonDto)
        {
            try
            {
                var lesson = await _lessonService.CreateLessonAsync(createLessonDto, createLessonDto.CourseId);
                return CreatedAtAction(nameof(GetLesson), new { id = lesson.Id }, lesson);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<LessonDto>> UpdateLesson(int id, [FromBody] UpdateLessonDto updateLessonDto)
        {
            try
            {
                var lesson = await _lessonService.UpdateLessonAsync(id, updateLessonDto);
                return Ok(lesson);
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
        public async Task<ActionResult> DeleteLesson(int id)
        {
            try
            {
                var result = await _lessonService.DeleteLessonAsync(id);
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
