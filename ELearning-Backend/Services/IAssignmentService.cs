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
}
