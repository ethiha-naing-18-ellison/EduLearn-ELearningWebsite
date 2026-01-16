using ELearning.API.DTOs;

namespace ELearning.API.Services
{
    public interface IMaterialCompletionService
    {
        Task<MaterialCompletionDto> MarkMaterialCompleteAsync(int userId, MarkMaterialCompleteDto dto);
        Task<bool> IsMaterialCompleteAsync(int userId, int courseId, string materialType, int materialId);
        Task<Dictionary<string, bool>> GetCourseMaterialCompletionsAsync(int userId, int courseId);
        Task<bool> UnmarkMaterialCompleteAsync(int userId, int courseId, string materialType, int materialId);
    }
}

