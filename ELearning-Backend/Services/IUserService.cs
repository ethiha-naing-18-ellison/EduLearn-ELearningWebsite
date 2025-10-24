using ELearning.API.DTOs;

namespace ELearning.API.Services
{
    public interface IUserService
    {
        Task<IEnumerable<UserDto>> GetAllUsersAsync();
        Task<UserDto> GetUserByIdAsync(int id);
        Task<UserDto> CreateUserAsync(CreateUserDto createUserDto);
        Task<UserDto> UpdateUserAsync(int id, UpdateUserDto updateUserDto);
        Task<bool> DeleteUserAsync(int id);
        Task<IEnumerable<CourseDto>> GetUserCoursesAsync(int userId);
        Task<IEnumerable<CourseDto>> GetUserEnrollmentsAsync(int userId);
    }
}
