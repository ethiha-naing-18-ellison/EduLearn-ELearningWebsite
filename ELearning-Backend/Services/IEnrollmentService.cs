using ELearning.API.DTOs;

namespace ELearning.API.Services
{
    public interface IEnrollmentService
    {
        Task<IEnumerable<EnrollmentDto>> GetUserEnrollmentsAsync(int userId);
        Task<EnrollmentDto> EnrollInCourseAsync(int userId, int courseId);
        Task<bool> UnenrollFromCourseAsync(int userId, int courseId);
        Task<bool> IsEnrolledAsync(int userId, int courseId);
        Task<EnrollmentDto> UpdateEnrollmentStatusAsync(int userId, int courseId, string status);
    }
}
