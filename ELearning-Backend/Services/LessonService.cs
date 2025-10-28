using Microsoft.EntityFrameworkCore;
using AutoMapper;
using ELearning.API.Data;
using ELearning.API.DTOs;
using ELearning.API.Models;

namespace ELearning.API.Services
{
    public class LessonService : ILessonService
    {
        private readonly ELearningDbContext _context;
        private readonly IMapper _mapper;

        public LessonService(ELearningDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<LessonDto>> GetCourseLessonsAsync(int courseId)
        {
            var lessons = await _context.Lessons
                .Where(l => l.CourseId == courseId)
                .OrderBy(l => l.Order)
                .ToListAsync();

            return _mapper.Map<IEnumerable<LessonDto>>(lessons);
        }

        public async Task<LessonDto> GetLessonByIdAsync(int id)
        {
            var lesson = await _context.Lessons
                .Include(l => l.Course)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (lesson == null)
            {
                throw new KeyNotFoundException("Lesson not found");
            }

            return _mapper.Map<LessonDto>(lesson);
        }

        public async Task<LessonDto> CreateLessonAsync(CreateLessonDto createLessonDto, int courseId)
        {
            // Parse the Type enum safely
            LessonType lessonType = LessonType.Video; // Default value
            if (!string.IsNullOrEmpty(createLessonDto.Type) && Enum.TryParse<LessonType>(createLessonDto.Type, out var parsedType))
            {
                lessonType = parsedType;
            }

            var lesson = new Lesson
            {
                Title = createLessonDto.Title,
                Content = createLessonDto.Content,
                VideoUrl = createLessonDto.VideoUrl,
                AudioUrl = createLessonDto.AudioUrl,
                DocumentUrl = createLessonDto.DocumentUrl,
                Duration = createLessonDto.Duration,
                Order = createLessonDto.Order,
                IsFree = createLessonDto.IsFree,
                Type = lessonType,
                CourseId = courseId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Lessons.Add(lesson);
            await _context.SaveChangesAsync();

            return await GetLessonByIdAsync(lesson.Id);
        }

        public async Task<LessonDto> UpdateLessonAsync(int id, UpdateLessonDto updateLessonDto)
        {
            var lesson = await _context.Lessons
                .FirstOrDefaultAsync(l => l.Id == id);

            if (lesson == null)
            {
                throw new KeyNotFoundException("Lesson not found");
            }

            if (!string.IsNullOrEmpty(updateLessonDto.Title))
                lesson.Title = updateLessonDto.Title;

            if (!string.IsNullOrEmpty(updateLessonDto.Content))
                lesson.Content = updateLessonDto.Content;

            if (!string.IsNullOrEmpty(updateLessonDto.VideoUrl))
                lesson.VideoUrl = updateLessonDto.VideoUrl;

            if (!string.IsNullOrEmpty(updateLessonDto.AudioUrl))
                lesson.AudioUrl = updateLessonDto.AudioUrl;

            if (!string.IsNullOrEmpty(updateLessonDto.DocumentUrl))
                lesson.DocumentUrl = updateLessonDto.DocumentUrl;

            if (updateLessonDto.Duration.HasValue)
                lesson.Duration = updateLessonDto.Duration.Value;

            if (updateLessonDto.Order.HasValue)
                lesson.Order = updateLessonDto.Order.Value;

            if (updateLessonDto.IsFree.HasValue)
                lesson.IsFree = updateLessonDto.IsFree.Value;

            if (!string.IsNullOrEmpty(updateLessonDto.Type) && Enum.TryParse<LessonType>(updateLessonDto.Type, out var parsedType))
                lesson.Type = parsedType;

            lesson.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetLessonByIdAsync(lesson.Id);
        }

        public async Task<bool> DeleteLessonAsync(int id)
        {
            var lesson = await _context.Lessons
                .FirstOrDefaultAsync(l => l.Id == id);

            if (lesson == null)
            {
                return false;
            }

            _context.Lessons.Remove(lesson);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
