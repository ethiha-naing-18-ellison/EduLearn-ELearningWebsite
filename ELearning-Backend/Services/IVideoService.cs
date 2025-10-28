using ELearning.API.DTOs;

namespace ELearning.API.Services
{
    public interface IVideoService
    {
        Task<IEnumerable<VideoDto>> GetCourseVideosAsync(int courseId);
        Task<VideoDto> GetVideoByIdAsync(int id);
        Task<VideoDto> CreateVideoAsync(CreateVideoDto createVideoDto, int courseId);
        Task<VideoDto> UpdateVideoAsync(int id, UpdateVideoDto updateVideoDto);
        Task<bool> DeleteVideoAsync(int id);
    }

}
