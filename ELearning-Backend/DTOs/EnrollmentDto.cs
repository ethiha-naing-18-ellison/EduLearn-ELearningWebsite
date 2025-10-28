using ELearning.API.Models;

namespace ELearning.API.DTOs
{
    public class EnrollmentDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int CourseId { get; set; }
        public DateTime EnrolledAt { get; set; }
        public EnrollmentStatus Status { get; set; }
        public DateTime? CompletedAt { get; set; }
        public decimal? Grade { get; set; }
        public string? Notes { get; set; }
        
        // Navigation properties
        public UserDto? User { get; set; }
        public CourseDto? Course { get; set; }
    }
}
