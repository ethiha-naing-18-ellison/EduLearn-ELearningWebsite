using Microsoft.AspNetCore.Mvc;
using ELearning.API.Services;
using ELearning.API.DTOs;

namespace ELearning.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VideosController : ControllerBase
    {
        private readonly IVideoService _videoService;

        public VideosController(IVideoService videoService)
        {
            _videoService = videoService;
        }

        [HttpGet("course/{courseId}")]
        public async Task<ActionResult<IEnumerable<VideoDto>>> GetCourseVideos(int courseId)
        {
            try
            {
                var videos = await _videoService.GetCourseVideosAsync(courseId);
                return Ok(videos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"VideosController: Error fetching course videos: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<VideoDto>> GetVideo(int id)
        {
            try
            {
                var video = await _videoService.GetVideoByIdAsync(id);
                return Ok(video);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Video not found" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"VideosController: Error fetching video: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<VideoDto>> CreateVideo([FromBody] CreateVideoDto createVideoDto)
        {
            try
            {
                Console.WriteLine($"VideosController: Received video creation request");
                Console.WriteLine($"Video DTO: {System.Text.Json.JsonSerializer.Serialize(createVideoDto)}");
                
                if (createVideoDto == null)
                {
                    return BadRequest(new { message = "Video data is required" });
                }

                if (createVideoDto.CourseId <= 0)
                {
                    return BadRequest(new { message = "Valid CourseId is required" });
                }

                var video = await _videoService.CreateVideoAsync(createVideoDto, createVideoDto.CourseId);
                Console.WriteLine($"VideosController: Video created successfully with ID: {video.Id}");
                return CreatedAtAction(nameof(GetVideo), new { id = video.Id }, video);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"VideosController: Error creating video: {ex.Message}");
                Console.WriteLine($"VideosController: Stack trace: {ex.StackTrace}");
                return BadRequest(new { message = ex.Message, details = ex.StackTrace });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<VideoDto>> UpdateVideo(int id, [FromBody] UpdateVideoDto updateVideoDto)
        {
            try
            {
                if (updateVideoDto == null)
                {
                    return BadRequest(new { message = "Video data is required" });
                }

                var video = await _videoService.UpdateVideoAsync(id, updateVideoDto);
                return Ok(video);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Video not found" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"VideosController: Error updating video: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteVideo(int id)
        {
            try
            {
                var result = await _videoService.DeleteVideoAsync(id);
                if (!result)
                {
                    return NotFound(new { message = "Video not found" });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"VideosController: Error deleting video: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
