using ELearning.API.DTOs;

namespace ELearning.API.Services
{
    public interface ILessonService
    {
        Task<IEnumerable<LessonDto>> GetCourseLessonsAsync(int courseId);
        Task<LessonDto> GetLessonByIdAsync(int id);
        Task<LessonDto> CreateLessonAsync(CreateLessonDto createLessonDto, int courseId);
        Task<LessonDto> UpdateLessonAsync(int id, UpdateLessonDto updateLessonDto);
        Task<bool> DeleteLessonAsync(int id);
    }

    public class LessonDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string? VideoUrl { get; set; }
        public string? AudioUrl { get; set; }
        public string? DocumentUrl { get; set; }
        public int Duration { get; set; }
        public int Order { get; set; }
        public bool IsFree { get; set; }
        public string Type { get; set; } = string.Empty;
        public int CourseId { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateLessonDto
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string? VideoUrl { get; set; }
        public string? AudioUrl { get; set; }
        public string? DocumentUrl { get; set; }
        public int Duration { get; set; } = 30;
        public int Order { get; set; } = 1;
        public bool IsFree { get; set; } = false;
        public string Type { get; set; } = "Video";
        public int CourseId { get; set; }
    }

    public class UpdateLessonDto
    {
        public string? Title { get; set; }
        public string? Content { get; set; }
        public string? VideoUrl { get; set; }
        public string? AudioUrl { get; set; }
        public string? DocumentUrl { get; set; }
        public int? Duration { get; set; }
        public int? Order { get; set; }
        public bool? IsFree { get; set; }
        public string? Type { get; set; }
    }
}
