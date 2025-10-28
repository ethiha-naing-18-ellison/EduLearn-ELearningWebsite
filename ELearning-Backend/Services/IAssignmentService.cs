using ELearning.API.DTOs;

namespace ELearning.API.Services
{
    public interface IAssignmentService
    {
        Task<IEnumerable<AssignmentDto>> GetCourseAssignmentsAsync(int courseId);
        Task<AssignmentDto> GetAssignmentByIdAsync(int id);
        Task<AssignmentDto> CreateAssignmentAsync(CreateAssignmentDto createAssignmentDto, int courseId);
        Task<AssignmentDto> UpdateAssignmentAsync(int id, UpdateAssignmentDto updateAssignmentDto);
        Task<bool> DeleteAssignmentAsync(int id);
        Task<IEnumerable<SubmissionDto>> GetAssignmentSubmissionsAsync(int assignmentId);
        Task<SubmissionDto> SubmitAssignmentAsync(int assignmentId, int userId, CreateSubmissionDto createSubmissionDto);
        Task<SubmissionDto> GradeSubmissionAsync(int submissionId, decimal score, string feedback);
    }

    public class AssignmentDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Instructions { get; set; }
        public decimal MaxPoints { get; set; }
        public DateTime DueDate { get; set; }
        public bool AllowLateSubmission { get; set; }
        public int LatePenaltyPercentage { get; set; }
        public string Type { get; set; } = string.Empty;
        public int CourseId { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateAssignmentDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Instructions { get; set; }
        public decimal MaxPoints { get; set; }
        public DateTime DueDate { get; set; }
        public bool AllowLateSubmission { get; set; }
        public int LatePenaltyPercentage { get; set; }
        public string Type { get; set; } = string.Empty;
        public int CourseId { get; set; }
    }

    public class UpdateAssignmentDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Instructions { get; set; }
        public decimal? MaxPoints { get; set; }
        public DateTime? DueDate { get; set; }
        public bool? AllowLateSubmission { get; set; }
        public int? LatePenaltyPercentage { get; set; }
        public string? Type { get; set; }
    }

    public class SubmissionDto
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public string? FileUrl { get; set; }
        public decimal? Score { get; set; }
        public string? Feedback { get; set; }
        public DateTime SubmittedAt { get; set; }
        public DateTime? GradedAt { get; set; }
        public bool IsLate { get; set; }
        public string Status { get; set; } = string.Empty;
        public int UserId { get; set; }
        public int AssignmentId { get; set; }
        public UserDto User { get; set; } = null!;
        public AssignmentDto Assignment { get; set; } = null!;
    }

    public class CreateSubmissionDto
    {
        public string Content { get; set; } = string.Empty;
        public string? FileUrl { get; set; }
    }
}
