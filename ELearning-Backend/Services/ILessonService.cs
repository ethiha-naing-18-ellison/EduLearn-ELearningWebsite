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

}
