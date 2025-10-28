using Microsoft.EntityFrameworkCore;
using AutoMapper;
using ELearning.API.Data;
using ELearning.API.DTOs;
using ELearning.API.Models;

namespace ELearning.API.Services
{
    public class VideoService : IVideoService
    {
        private readonly ELearningDbContext _context;
        private readonly IMapper _mapper;

        public VideoService(ELearningDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<VideoDto>> GetCourseVideosAsync(int courseId)
        {
            var videos = await _context.Videos
                .Where(v => v.CourseId == courseId)
                .OrderBy(v => v.Order)
                .ToListAsync();

            return _mapper.Map<IEnumerable<VideoDto>>(videos);
        }

        public async Task<VideoDto> GetVideoByIdAsync(int id)
        {
            var video = await _context.Videos
                .Include(v => v.Course)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (video == null)
            {
                throw new KeyNotFoundException("Video not found");
            }

            return _mapper.Map<VideoDto>(video);
        }

        public async Task<VideoDto> CreateVideoAsync(CreateVideoDto createVideoDto, int courseId)
        {
            try
            {
                // Debug logging
                Console.WriteLine($"Creating video: Title={createVideoDto.Title}, CourseId={courseId}");
                Console.WriteLine($"Video data: {System.Text.Json.JsonSerializer.Serialize(createVideoDto)}");

                // Parse the VideoType enum safely
                VideoType videoType = VideoType.Upload; // Default value
                if (!string.IsNullOrEmpty(createVideoDto.VideoType) && Enum.TryParse<VideoType>(createVideoDto.VideoType, out var parsedVideoType))
                {
                    videoType = parsedVideoType;
                }

                // Parse the VideoQuality enum safely
                VideoQuality videoQuality = VideoQuality.HD; // Default value
                if (!string.IsNullOrEmpty(createVideoDto.Quality) && Enum.TryParse<VideoQuality>(createVideoDto.Quality, out var parsedQuality))
                {
                    videoQuality = parsedQuality;
                }

                var video = new Video
                {
                    Title = createVideoDto.Title,
                    Description = createVideoDto.Description,
                    VideoUrl = createVideoDto.VideoUrl,
                    VideoFile = createVideoDto.VideoFile,
                    Thumbnail = createVideoDto.Thumbnail,
                    Duration = createVideoDto.Duration,
                    Order = createVideoDto.Order,
                    IsFree = createVideoDto.IsFree,
                    IsPublished = createVideoDto.IsPublished,
                    VideoType = videoType,
                    Quality = videoQuality,
                    Transcript = createVideoDto.Transcript,
                    Notes = createVideoDto.Notes,
                    CourseId = courseId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Videos.Add(video);
                await _context.SaveChangesAsync();

                Console.WriteLine($"Video created successfully with ID: {video.Id}");
                return await GetVideoByIdAsync(video.Id);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating video: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw;
            }
        }

        public async Task<VideoDto> UpdateVideoAsync(int id, UpdateVideoDto updateVideoDto)
        {
            var video = await _context.Videos
                .FirstOrDefaultAsync(v => v.Id == id);

            if (video == null)
            {
                throw new KeyNotFoundException("Video not found");
            }

            if (!string.IsNullOrEmpty(updateVideoDto.Title))
                video.Title = updateVideoDto.Title;

            if (!string.IsNullOrEmpty(updateVideoDto.Description))
                video.Description = updateVideoDto.Description;

            if (!string.IsNullOrEmpty(updateVideoDto.VideoUrl))
                video.VideoUrl = updateVideoDto.VideoUrl;

            if (!string.IsNullOrEmpty(updateVideoDto.VideoFile))
                video.VideoFile = updateVideoDto.VideoFile;

            if (!string.IsNullOrEmpty(updateVideoDto.Thumbnail))
                video.Thumbnail = updateVideoDto.Thumbnail;

            if (updateVideoDto.Duration.HasValue)
                video.Duration = updateVideoDto.Duration.Value;

            if (updateVideoDto.Order.HasValue)
                video.Order = updateVideoDto.Order.Value;

            if (updateVideoDto.IsFree.HasValue)
                video.IsFree = updateVideoDto.IsFree.Value;

            if (updateVideoDto.IsPublished.HasValue)
                video.IsPublished = updateVideoDto.IsPublished.Value;

            if (!string.IsNullOrEmpty(updateVideoDto.VideoType) && Enum.TryParse<VideoType>(updateVideoDto.VideoType, out var parsedVideoType))
                video.VideoType = parsedVideoType;

            if (!string.IsNullOrEmpty(updateVideoDto.Quality) && Enum.TryParse<VideoQuality>(updateVideoDto.Quality, out var parsedQuality))
                video.Quality = parsedQuality;

            if (!string.IsNullOrEmpty(updateVideoDto.Transcript))
                video.Transcript = updateVideoDto.Transcript;

            if (!string.IsNullOrEmpty(updateVideoDto.Notes))
                video.Notes = updateVideoDto.Notes;

            video.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetVideoByIdAsync(video.Id);
        }

        public async Task<bool> DeleteVideoAsync(int id)
        {
            var video = await _context.Videos
                .FirstOrDefaultAsync(v => v.Id == id);

            if (video == null)
            {
                return false;
            }

            _context.Videos.Remove(video);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
