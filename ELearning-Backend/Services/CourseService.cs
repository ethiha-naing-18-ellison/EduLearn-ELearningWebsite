using Microsoft.EntityFrameworkCore;
using AutoMapper;
using ELearning.API.Data;
using ELearning.API.DTOs;
using ELearning.API.Models;

namespace ELearning.API.Services
{
    public class CourseService : ICourseService
    {
        private readonly ELearningDbContext _context;
        private readonly IMapper _mapper;

        public CourseService(ELearningDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<CourseDto>> GetAllCoursesAsync()
        {
            var courses = await _context.Courses
                .Include(c => c.Instructor)
                .Include(c => c.Category)
                .ToListAsync();

            return _mapper.Map<IEnumerable<CourseDto>>(courses);
        }

        public async Task<IEnumerable<CourseDto>> GetPublishedCoursesAsync(
            string? search = null, 
            string? level = null, 
            string? category = null, 
            int page = 1, 
            int limit = 12)
        {
            // Debug: Check total courses in database
            var totalCourses = await _context.Courses.CountAsync();
            Console.WriteLine($"Total courses in database: {totalCourses}");
            
            var publishedCourses = await _context.Courses
                .Where(c => c.Status == CourseStatus.Published)
                .CountAsync();
            Console.WriteLine($"Published courses: {publishedCourses}");

            // Build the query with filters
            var query = _context.Courses
                .Where(c => c.Status == CourseStatus.Published)
                .Include(c => c.Instructor)
                .Include(c => c.Category)
                .AsQueryable();

            // Apply search filter
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(c => c.Title.Contains(search) || 
                                       c.Description.Contains(search) ||
                                       c.Instructor.FirstName.Contains(search) ||
                                       c.Instructor.LastName.Contains(search));
                Console.WriteLine($"Applied search filter: {search}");
            }

            // Apply level filter
            if (!string.IsNullOrEmpty(level))
            {
                if (Enum.TryParse<CourseLevel>(level, true, out var courseLevel))
                {
                    query = query.Where(c => c.Level == courseLevel);
                    Console.WriteLine($"Applied level filter: {level}");
                }
            }

            // Apply category filter
            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(c => c.Category.Name == category);
                Console.WriteLine($"Applied category filter: {category}");
            }

            // Apply pagination
            var courses = await query
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            Console.WriteLine($"Returning {courses.Count} courses with filters - Search: {search}, Level: {level}, Category: {category}");
            return _mapper.Map<IEnumerable<CourseDto>>(courses);
        }

        public async Task<CourseDto> GetCourseByIdAsync(int id)
        {
            var course = await _context.Courses
                .Include(c => c.Instructor)
                .Include(c => c.Category)
                .Include(c => c.Lessons)
                .Include(c => c.Assignments)
                .Include(c => c.Quizzes)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (course == null)
            {
                throw new KeyNotFoundException("Course not found");
            }

            return _mapper.Map<CourseDto>(course);
        }

        public async Task<CourseDto> CreateCourseAsync(CreateCourseDto createCourseDto, int instructorId)
        {
            var course = new Course
            {
                Title = createCourseDto.Title,
                Description = createCourseDto.Description,
                Thumbnail = createCourseDto.Thumbnail,
                Price = createCourseDto.Price,
                IsFree = createCourseDto.IsFree,
                Level = Enum.Parse<CourseLevel>(createCourseDto.Level),
                Status = CourseStatus.Published,
                Duration = createCourseDto.Duration,
                Prerequisites = createCourseDto.Prerequisites,
                LearningOutcomes = createCourseDto.LearningOutcomes,
                InstructorId = instructorId,
                CategoryId = createCourseDto.CategoryId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();

            return await GetCourseByIdAsync(course.Id);
        }

        public async Task<CourseDto> UpdateCourseAsync(int id, UpdateCourseDto updateCourseDto, int userId)
        {
            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.Id == id);

            if (course == null)
            {
                throw new KeyNotFoundException("Course not found");
            }

            if (course.InstructorId != userId)
            {
                throw new UnauthorizedAccessException("You can only update your own courses");
            }

            if (!string.IsNullOrEmpty(updateCourseDto.Title))
                course.Title = updateCourseDto.Title;

            if (!string.IsNullOrEmpty(updateCourseDto.Description))
                course.Description = updateCourseDto.Description;

            if (!string.IsNullOrEmpty(updateCourseDto.Thumbnail))
                course.Thumbnail = updateCourseDto.Thumbnail;

            if (updateCourseDto.Price.HasValue)
                course.Price = updateCourseDto.Price.Value;

            if (updateCourseDto.IsFree.HasValue)
                course.IsFree = updateCourseDto.IsFree.Value;

            if (!string.IsNullOrEmpty(updateCourseDto.Level))
                course.Level = Enum.Parse<CourseLevel>(updateCourseDto.Level);

            if (!string.IsNullOrEmpty(updateCourseDto.Status))
                course.Status = Enum.Parse<CourseStatus>(updateCourseDto.Status);

            if (updateCourseDto.Duration.HasValue)
                course.Duration = updateCourseDto.Duration.Value;

            if (!string.IsNullOrEmpty(updateCourseDto.Prerequisites))
                course.Prerequisites = updateCourseDto.Prerequisites;

            if (!string.IsNullOrEmpty(updateCourseDto.LearningOutcomes))
                course.LearningOutcomes = updateCourseDto.LearningOutcomes;

            if (updateCourseDto.CategoryId.HasValue)
                course.CategoryId = updateCourseDto.CategoryId;

            course.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetCourseByIdAsync(course.Id);
        }

        public async Task<bool> DeleteCourseAsync(int id, int userId)
        {
            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.Id == id);

            if (course == null)
            {
                return false;
            }

            if (course.InstructorId != userId)
            {
                throw new UnauthorizedAccessException("You can only delete your own courses");
            }

            course.Status = CourseStatus.Archived;
            course.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<CourseDto>> GetCoursesByCategoryAsync(int categoryId)
        {
            var courses = await _context.Courses
                .Where(c => c.CategoryId == categoryId && c.Status == CourseStatus.Published)
                .Include(c => c.Instructor)
                .Include(c => c.Category)
                .ToListAsync();

            return _mapper.Map<IEnumerable<CourseDto>>(courses);
        }

        public async Task<IEnumerable<CourseDto>> SearchCoursesAsync(string searchTerm)
        {
            var courses = await _context.Courses
                .Where(c => c.Status == CourseStatus.Published &&
                           (c.Title.Contains(searchTerm) || 
                            c.Description.Contains(searchTerm)))
                .Include(c => c.Instructor)
                .Include(c => c.Category)
                .ToListAsync();

            return _mapper.Map<IEnumerable<CourseDto>>(courses);
        }
    }
}
