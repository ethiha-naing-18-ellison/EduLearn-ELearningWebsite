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

    public class EnrollmentDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int CourseId { get; set; }
        public DateTime EnrolledAt { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? CompletedAt { get; set; }
        public decimal? Grade { get; set; }
        public string? Notes { get; set; }
        public CourseDto Course { get; set; } = null!;
        public UserDto User { get; set; } = null!;
    }
}
