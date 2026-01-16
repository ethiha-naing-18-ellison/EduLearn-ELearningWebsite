using AutoMapper;
using ELearning.API.Data;
using ELearning.API.DTOs;
using ELearning.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ELearning.API.Services
{
    public class MaterialCompletionService : IMaterialCompletionService
    {
        private readonly ELearningDbContext _context;
        private readonly IMapper _mapper;

        public MaterialCompletionService(ELearningDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<MaterialCompletionDto> MarkMaterialCompleteAsync(int userId, MarkMaterialCompleteDto dto)
        {
            var existing = await _context.MaterialCompletions
                .FirstOrDefaultAsync(mc => 
                    mc.UserId == userId && 
                    mc.CourseId == dto.CourseId && 
                    mc.MaterialType == dto.MaterialType && 
                    mc.MaterialId == dto.MaterialId);

            if (existing != null)
            {
                existing.IsCompleted = true;
                existing.CompletedAt = DateTime.UtcNow;
                existing.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                var completion = new MaterialCompletion
                {
                    UserId = userId,
                    CourseId = dto.CourseId,
                    MaterialType = dto.MaterialType,
                    MaterialId = dto.MaterialId,
                    IsCompleted = true,
                    CompletedAt = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.MaterialCompletions.Add(completion);
            }

            await _context.SaveChangesAsync();

            var result = await _context.MaterialCompletions
                .FirstOrDefaultAsync(mc => 
                    mc.UserId == userId && 
                    mc.CourseId == dto.CourseId && 
                    mc.MaterialType == dto.MaterialType && 
                    mc.MaterialId == dto.MaterialId);

            return _mapper.Map<MaterialCompletionDto>(result);
        }

        public async Task<bool> IsMaterialCompleteAsync(int userId, int courseId, string materialType, int materialId)
        {
            var completion = await _context.MaterialCompletions
                .FirstOrDefaultAsync(mc => 
                    mc.UserId == userId && 
                    mc.CourseId == courseId && 
                    mc.MaterialType == materialType && 
                    mc.MaterialId == materialId);

            return completion?.IsCompleted ?? false;
        }

        public async Task<Dictionary<string, bool>> GetCourseMaterialCompletionsAsync(int userId, int courseId)
        {
            var completions = await _context.MaterialCompletions
                .Where(mc => mc.UserId == userId && mc.CourseId == courseId && mc.IsCompleted)
                .ToListAsync();

            var result = new Dictionary<string, bool>();
            foreach (var completion in completions)
            {
                var key = $"{completion.MaterialType}_{completion.MaterialId}";
                result[key] = completion.IsCompleted;
            }

            return result;
        }

        public async Task<bool> UnmarkMaterialCompleteAsync(int userId, int courseId, string materialType, int materialId)
        {
            var completion = await _context.MaterialCompletions
                .FirstOrDefaultAsync(mc => 
                    mc.UserId == userId && 
                    mc.CourseId == courseId && 
                    mc.MaterialType == materialType && 
                    mc.MaterialId == materialId);

            if (completion != null)
            {
                completion.IsCompleted = false;
                completion.CompletedAt = null;
                completion.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return true;
            }

            return false;
        }
    }
}

