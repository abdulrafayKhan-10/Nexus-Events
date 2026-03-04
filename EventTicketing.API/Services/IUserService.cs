using EventTicketing.API.Models.DTOs;

namespace EventTicketing.API.Services
{
    public interface IUserService
    {
        Task<UserProfileResponseDto> GetUserProfileAsync(int userId);
        Task<UserProfileResponseDto> UpdateUserProfileAsync(int userId, UpdateUserProfileDto updateDto);
        Task ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto);
        Task<UserOrganizationDto> GetUserOrganizationAsync(int userId);
        Task<UserOrganizationDto> UpdateUserOrganizationAsync(int userId, UpdateUserOrganizationDto updateDto);
        Task<UserPreferencesDto> GetUserPreferencesAsync(int userId);
        Task<UserPreferencesDto> UpdateUserPreferencesAsync(int userId, UpdateUserPreferencesDto updateDto);
        Task<IEnumerable<UserProfileResponseDto>> GetAllUsersAsync();
        Task<UserProfileResponseDto> UpdateUserRoleAsync(int userId, UpdateUserRoleDto updateDto);
    }
}