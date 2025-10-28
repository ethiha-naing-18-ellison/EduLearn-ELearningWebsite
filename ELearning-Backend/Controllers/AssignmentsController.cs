using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ELearning.API.DTOs;
using ELearning.API.Services;

namespace ELearning.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AssignmentsController : ControllerBase
    {
        private readonly IAssignmentService _assignmentService;

        public AssignmentsController(IAssignmentService assignmentService)
        {
            _assignmentService = assignmentService;
        }

        [HttpGet("course/{courseId}")]
        public async Task<ActionResult<IEnumerable<AssignmentDto>>> GetAssignmentsByCourse(int courseId)
        {
            try
            {
                var assignments = await _assignmentService.GetCourseAssignmentsAsync(courseId);
                return Ok(assignments);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AssignmentDto>> GetAssignment(int id)
        {
            try
            {
                var assignment = await _assignmentService.GetAssignmentByIdAsync(id);
                return Ok(assignment);
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
        public async Task<ActionResult<AssignmentDto>> CreateAssignment([FromBody] CreateAssignmentDto createAssignmentDto)
        {
            try
            {
                var assignment = await _assignmentService.CreateAssignmentAsync(createAssignmentDto, createAssignmentDto.CourseId);
                return CreatedAtAction(nameof(GetAssignment), new { id = assignment.Id }, assignment);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<AssignmentDto>> UpdateAssignment(int id, [FromBody] UpdateAssignmentDto updateAssignmentDto)
        {
            try
            {
                var assignment = await _assignmentService.UpdateAssignmentAsync(id, updateAssignmentDto);
                return Ok(assignment);
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
        public async Task<ActionResult> DeleteAssignment(int id)
        {
            try
            {
                var result = await _assignmentService.DeleteAssignmentAsync(id);
                if (result)
                    return NoContent();
                return NotFound();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}/submissions")]
        public async Task<ActionResult<IEnumerable<SubmissionDto>>> GetAssignmentSubmissions(int id)
        {
            try
            {
                var submissions = await _assignmentService.GetAssignmentSubmissionsAsync(id);
                return Ok(submissions);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
