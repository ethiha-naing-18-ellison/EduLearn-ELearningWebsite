using ELearning.API.DTOs;

namespace ELearning.API.Services
{
    public interface ICourseService
    {
        Task<IEnumerable<CourseDto>> GetAllCoursesAsync();
        Task<IEnumerable<CourseDto>> GetPublishedCoursesAsync(string? search = null, string? level = null, string? category = null, int page = 1, int limit = 12);
        Task<CourseDto> GetCourseByIdAsync(int id);
        Task<CourseDto> CreateCourseAsync(CreateCourseDto createCourseDto, int instructorId);
        Task<CourseDto> UpdateCourseAsync(int id, UpdateCourseDto updateCourseDto, int userId);
        Task<bool> DeleteCourseAsync(int id, int userId);
        Task<IEnumerable<CourseDto>> GetCoursesByCategoryAsync(int categoryId);
        Task<IEnumerable<CourseDto>> SearchCoursesAsync(string searchTerm);
    }
}
