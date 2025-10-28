using Microsoft.EntityFrameworkCore;
using AutoMapper;
using ELearning.API.Data;
using ELearning.API.DTOs;
using ELearning.API.Models;

namespace ELearning.API.Services
{
    public class AssignmentService : IAssignmentService
    {
        private readonly ELearningDbContext _context;
        private readonly IMapper _mapper;

        public AssignmentService(ELearningDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<AssignmentDto>> GetCourseAssignmentsAsync(int courseId)
        {
            var assignments = await _context.Assignments
                .Where(a => a.CourseId == courseId)
                .ToListAsync();

            return _mapper.Map<IEnumerable<AssignmentDto>>(assignments);
        }

        public async Task<AssignmentDto> GetAssignmentByIdAsync(int id)
        {
            var assignment = await _context.Assignments
                .Include(a => a.Course)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (assignment == null)
            {
                throw new KeyNotFoundException("Assignment not found");
            }

            return _mapper.Map<AssignmentDto>(assignment);
        }

        public async Task<AssignmentDto> CreateAssignmentAsync(CreateAssignmentDto createAssignmentDto, int courseId)
        {
            try
            {
                // Debug logging
                Console.WriteLine($"Creating assignment: Title={createAssignmentDto.Title}, CourseId={courseId}");
                Console.WriteLine($"Assignment data: {System.Text.Json.JsonSerializer.Serialize(createAssignmentDto)}");

                // Parse the Type enum safely
                AssignmentType assignmentType = AssignmentType.Essay; // Default value
                if (!string.IsNullOrEmpty(createAssignmentDto.Type) && Enum.TryParse<AssignmentType>(createAssignmentDto.Type, out var parsedType))
                {
                    assignmentType = parsedType;
                }

                var assignment = new Assignment
                {
                    Title = createAssignmentDto.Title,
                    Description = createAssignmentDto.Description,
                    Instructions = createAssignmentDto.Instructions,
                    MaxPoints = createAssignmentDto.MaxPoints,
                    DueDate = createAssignmentDto.DueDate,
                    AllowLateSubmission = createAssignmentDto.AllowLateSubmission,
                    LatePenaltyPercentage = createAssignmentDto.LatePenaltyPercentage,
                    Type = assignmentType,
                    CourseId = courseId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Assignments.Add(assignment);
                await _context.SaveChangesAsync();

                Console.WriteLine($"Assignment created successfully with ID: {assignment.Id}");
                return await GetAssignmentByIdAsync(assignment.Id);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating assignment: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw;
            }
        }

        public async Task<AssignmentDto> UpdateAssignmentAsync(int id, UpdateAssignmentDto updateAssignmentDto)
        {
            var assignment = await _context.Assignments
                .FirstOrDefaultAsync(a => a.Id == id);

            if (assignment == null)
            {
                throw new KeyNotFoundException("Assignment not found");
            }

            if (!string.IsNullOrEmpty(updateAssignmentDto.Title))
                assignment.Title = updateAssignmentDto.Title;

            if (!string.IsNullOrEmpty(updateAssignmentDto.Description))
                assignment.Description = updateAssignmentDto.Description;

            if (!string.IsNullOrEmpty(updateAssignmentDto.Instructions))
                assignment.Instructions = updateAssignmentDto.Instructions;

            if (updateAssignmentDto.MaxPoints.HasValue)
                assignment.MaxPoints = updateAssignmentDto.MaxPoints.Value;

            if (updateAssignmentDto.DueDate.HasValue)
                assignment.DueDate = updateAssignmentDto.DueDate.Value;

            if (updateAssignmentDto.AllowLateSubmission.HasValue)
                assignment.AllowLateSubmission = updateAssignmentDto.AllowLateSubmission.Value;

            if (updateAssignmentDto.LatePenaltyPercentage.HasValue)
                assignment.LatePenaltyPercentage = updateAssignmentDto.LatePenaltyPercentage.Value;

            if (!string.IsNullOrEmpty(updateAssignmentDto.Type) && Enum.TryParse<AssignmentType>(updateAssignmentDto.Type, out var parsedType))
                assignment.Type = parsedType;

            assignment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetAssignmentByIdAsync(assignment.Id);
        }

        public async Task<bool> DeleteAssignmentAsync(int id)
        {
            var assignment = await _context.Assignments
                .FirstOrDefaultAsync(a => a.Id == id);

            if (assignment == null)
            {
                return false;
            }

            _context.Assignments.Remove(assignment);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<SubmissionDto>> GetAssignmentSubmissionsAsync(int assignmentId)
        {
            var submissions = await _context.Submissions
                .Where(s => s.AssignmentId == assignmentId)
                .Include(s => s.User)
                .Include(s => s.Assignment)
                .ToListAsync();

            return _mapper.Map<IEnumerable<SubmissionDto>>(submissions);
        }

        public async Task<SubmissionDto> SubmitAssignmentAsync(int assignmentId, int userId, CreateSubmissionDto createSubmissionDto)
        {
            var assignment = await _context.Assignments
                .FirstOrDefaultAsync(a => a.Id == assignmentId);

            if (assignment == null)
            {
                throw new KeyNotFoundException("Assignment not found");
            }

            var isLate = DateTime.UtcNow > assignment.DueDate;
            var existingSubmission = await _context.Submissions
                .FirstOrDefaultAsync(s => s.AssignmentId == assignmentId && s.UserId == userId);

            if (existingSubmission != null)
            {
                existingSubmission.Content = createSubmissionDto.Content;
                existingSubmission.FileUrl = createSubmissionDto.FileUrl;
                existingSubmission.SubmittedAt = DateTime.UtcNow;
                existingSubmission.IsLate = isLate;
                existingSubmission.Status = SubmissionStatus.Submitted;

                await _context.SaveChangesAsync();
                return await GetSubmissionByIdAsync(existingSubmission.Id);
            }

            var submission = new Submission
            {
                Content = createSubmissionDto.Content,
                FileUrl = createSubmissionDto.FileUrl,
                SubmittedAt = DateTime.UtcNow,
                IsLate = isLate,
                Status = SubmissionStatus.Submitted,
                UserId = userId,
                AssignmentId = assignmentId
            };

            _context.Submissions.Add(submission);
            await _context.SaveChangesAsync();

            return await GetSubmissionByIdAsync(submission.Id);
        }

        public async Task<SubmissionDto> GradeSubmissionAsync(int submissionId, decimal score, string feedback)
        {
            var submission = await _context.Submissions
                .FirstOrDefaultAsync(s => s.Id == submissionId);

            if (submission == null)
            {
                throw new KeyNotFoundException("Submission not found");
            }

            submission.Score = score;
            submission.Feedback = feedback;
            submission.GradedAt = DateTime.UtcNow;
            submission.Status = SubmissionStatus.Graded;

            await _context.SaveChangesAsync();

            return await GetSubmissionByIdAsync(submission.Id);
        }

        private async Task<SubmissionDto> GetSubmissionByIdAsync(int id)
        {
            var submission = await _context.Submissions
                .Include(s => s.User)
                .Include(s => s.Assignment)
                .FirstOrDefaultAsync(s => s.Id == id);

            return _mapper.Map<SubmissionDto>(submission);
        }
    }
}
