using Microsoft.EntityFrameworkCore;
using AutoMapper;
using ELearning.API.Data;
using ELearning.API.DTOs;
using ELearning.API.Models;

namespace ELearning.API.Services
{
    public class EnrollmentService : IEnrollmentService
    {
        private readonly ELearningDbContext _context;
        private readonly IMapper _mapper;

        public EnrollmentService(ELearningDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<EnrollmentDto>> GetUserEnrollmentsAsync(int userId)
        {
            var enrollments = await _context.Enrollments
                .Where(e => e.UserId == userId)
                .Include(e => e.Course)
                .ThenInclude(c => c.Instructor)
                .Include(e => e.Course)
                .ThenInclude(c => c.Category)
                .Include(e => e.User)
                .ToListAsync();

            return _mapper.Map<IEnumerable<EnrollmentDto>>(enrollments);
        }

        public async Task<EnrollmentDto> EnrollInCourseAsync(int userId, int courseId)
        {
            // Check if already enrolled
            var existingEnrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == courseId);

            if (existingEnrollment != null)
            {
                throw new InvalidOperationException("User is already enrolled in this course");
            }

            // Check if course exists and is published
            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.Id == courseId && c.Status == CourseStatus.Published);

            if (course == null)
            {
                throw new KeyNotFoundException("Course not found or not published");
            }

            var enrollment = new Enrollment
            {
                UserId = userId,
                CourseId = courseId,
                EnrolledAt = DateTime.UtcNow,
                Status = EnrollmentStatus.Active
            };

            try
            {
                _context.Enrollments.Add(enrollment);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("duplicate key") == true || 
                                               ex.InnerException?.Message.Contains("unique constraint") == true ||
                                               ex.InnerException?.Message.Contains("23505") == true) // PostgreSQL unique violation error code
            {
                // Handle unique constraint violation (race condition)
                throw new InvalidOperationException("User is already enrolled in this course");
            }

            return await GetEnrollmentByIdAsync(enrollment.Id);
        }

        public async Task<bool> UnenrollFromCourseAsync(int userId, int courseId)
        {
            var enrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == courseId);

            if (enrollment == null)
            {
                return false;
            }

            enrollment.Status = EnrollmentStatus.Dropped;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> IsEnrolledAsync(int userId, int courseId)
        {
            return await _context.Enrollments
                .AnyAsync(e => e.UserId == userId && e.CourseId == courseId && e.Status == EnrollmentStatus.Active);
        }

        public async Task<EnrollmentDto> UpdateEnrollmentStatusAsync(int userId, int courseId, string status)
        {
            var enrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == courseId);

            if (enrollment == null)
            {
                throw new KeyNotFoundException("Enrollment not found");
            }

            enrollment.Status = Enum.Parse<EnrollmentStatus>(status);
            
            if (status == "Completed")
            {
                enrollment.CompletedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return await GetEnrollmentByIdAsync(enrollment.Id);
        }

        private async Task<EnrollmentDto> GetEnrollmentByIdAsync(int id)
        {
            var enrollment = await _context.Enrollments
                .Include(e => e.Course)
                .ThenInclude(c => c.Instructor)
                .Include(e => e.Course)
                .ThenInclude(c => c.Category)
                .Include(e => e.User)
                .FirstOrDefaultAsync(e => e.Id == id);

            return _mapper.Map<EnrollmentDto>(enrollment);
        }
    }
}
