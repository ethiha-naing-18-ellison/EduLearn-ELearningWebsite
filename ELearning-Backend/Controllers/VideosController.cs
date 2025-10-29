using Microsoft.AspNetCore.Mvc;
using ELearning.API.Services;
using ELearning.API.DTOs;
using Microsoft.AspNetCore.Http.Features;

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

        [HttpPost("upload")]
        [RequestSizeLimit(500 * 1024 * 1024)] // 500MB limit
        [RequestFormLimits(MultipartBodyLengthLimit = 500 * 1024 * 1024)] // 500MB limit
        public async Task<ActionResult<VideoDto>> UploadVideo([FromForm] CreateVideoDto createVideoDto, IFormFile? videoFile)
        {
            try
            {
                Console.WriteLine($"VideosController: Received video upload request");
                Console.WriteLine($"Video DTO: {System.Text.Json.JsonSerializer.Serialize(createVideoDto)}");
                Console.WriteLine($"Video File: {videoFile?.FileName}, Size: {videoFile?.Length}");
                
                if (createVideoDto == null)
                {
                    return BadRequest(new { message = "Video data is required" });
                }

                if (createVideoDto.CourseId <= 0)
                {
                    return BadRequest(new { message = "Valid CourseId is required" });
                }

                // Handle file upload
                if (videoFile != null && videoFile.Length > 0)
                {
                    // Check file size (limit to 500MB)
                    const long maxFileSize = 500 * 1024 * 1024; // 500MB
                    if (videoFile.Length > maxFileSize)
                    {
                        return BadRequest(new { message = "Video file is too large. Maximum size is 500MB." });
                    }

                    // Check file type
                    var allowedExtensions = new[] { ".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm", ".mkv" };
                    var fileExtension = Path.GetExtension(videoFile.FileName).ToLower();
                    if (!allowedExtensions.Contains(fileExtension))
                    {
                        return BadRequest(new { message = "Invalid video file type. Allowed types: mp4, avi, mov, wmv, flv, webm, mkv" });
                    }

                    // Create uploads directory if it doesn't exist
                    var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "videos");
                    if (!Directory.Exists(uploadsPath))
                    {
                        Directory.CreateDirectory(uploadsPath);
                        Console.WriteLine($"Created uploads directory: {uploadsPath}");
                    }
                    
                    // Generate unique filename
                    var fileName = $"{DateTime.Now.Ticks}_{Path.GetFileNameWithoutExtension(videoFile.FileName)}{fileExtension}";
                    var filePath = Path.Combine(uploadsPath, fileName);
                    
                    Console.WriteLine($"Saving video file to: {filePath}");
                    
                    // Save file with progress tracking
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await videoFile.CopyToAsync(stream);
                        Console.WriteLine($"Video file saved successfully. Size: {stream.Length} bytes");
                    }
                    
                    // Update video file path
                    createVideoDto.VideoFile = $"uploads/videos/{fileName}";
                    // Duration is already set from form data, no need to modify it
                    
                    Console.WriteLine($"Video file path set to: {createVideoDto.VideoFile}");
                }
                else
                {
                    Console.WriteLine("No video file provided, creating video with URL only");
                }

                Console.WriteLine("Creating video in database...");
                var video = await _videoService.CreateVideoAsync(createVideoDto, createVideoDto.CourseId);
                Console.WriteLine($"VideosController: Video created successfully with ID: {video.Id}");
                return CreatedAtAction(nameof(GetVideo), new { id = video.Id }, video);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"VideosController: Error uploading video: {ex.Message}");
                Console.WriteLine($"VideosController: Stack trace: {ex.StackTrace}");
                return BadRequest(new { message = ex.Message, details = ex.StackTrace });
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

        [HttpGet("{id}/stream")]
        public async Task<IActionResult> StreamVideo(int id)
        {
            try
            {
                var video = await _videoService.GetVideoByIdAsync(id);
                
                if (video == null)
                {
                    return NotFound(new { message = "Video not found" });
                }

                if (string.IsNullOrEmpty(video.VideoFile))
                {
                    return NotFound(new { message = "Video file not found" });
                }

                string? filePath = null;
                
                // Resolve file path
                if (video.VideoFile.StartsWith("uploads/") || video.VideoFile.StartsWith("/uploads/"))
                {
                    filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", video.VideoFile.TrimStart('/'));
                }
                else if (video.VideoFile.Contains("/") || video.VideoFile.Contains("\\"))
                {
                    filePath = video.VideoFile;
                }
                else
                {
                    filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "videos", video.VideoFile);
                }

                if (string.IsNullOrEmpty(filePath) || !System.IO.File.Exists(filePath))
                {
                    Console.WriteLine($"Video file not found. FilePath: {filePath}");
                    return NotFound(new { message = $"Video file not found on server. Path: {filePath}" });
                }

                var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
                var contentType = "video/mp4"; // Default to mp4, could be enhanced to detect actual type
                
                return File(fileStream, contentType, enableRangeProcessing: true);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Video not found" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"VideosController: Error streaming video: {ex.Message}");
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
