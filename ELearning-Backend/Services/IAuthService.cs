using ELearning.API.DTOs;

namespace ELearning.API.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
        Task<AuthResponseDto> RegisterAsync(CreateUserDto createUserDto);
        Task<bool> ValidateTokenAsync(string token);
        Task<UserDto> GetUserFromTokenAsync(string token);
    }
}
