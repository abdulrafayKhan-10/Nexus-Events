using EventTicketing.API.Models.DTOs;
using EventTicketing.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EventTicketing.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IImageStorageService _imageStorageService;

        public UserController(IUserService userService, IImageStorageService imageStorageService)
        {
            _userService = userService;
            _imageStorageService = imageStorageService;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                throw new UnauthorizedAccessException("User not authenticated");

            return int.Parse(userIdClaim.Value);
        }

        [HttpPost("upload-profile-image")]
        public async Task<ActionResult> UploadProfileImage(IFormFile file)
        {
            try
            {
                var userId = GetCurrentUserId();

                if (!await _imageStorageService.ValidateImageAsync(file))
                {
                    return BadRequest(new { message = "Invalid image file. Please upload a valid image (JPEG, PNG, WebP, GIF) under 5MB." });
                }

                // Get current user profile to delete old image
                var currentProfile = await _userService.GetUserProfileAsync(userId);
                if (!string.IsNullOrEmpty(currentProfile.ProfileImageUrl))
                {
                    await _imageStorageService.DeleteImageAsync(currentProfile.ProfileImageUrl);
                }

                // Upload new image
                var imageUrl = await _imageStorageService.UploadUserProfileImageAsync(file, userId);

                // Update user profile with new image URL
                var updateDto = new UpdateUserProfileDto
                {
                    FirstName = currentProfile.FirstName,
                    LastName = currentProfile.LastName,
                    Email = currentProfile.Email,
                    PhoneNumber = currentProfile.PhoneNumber,
                    DateOfBirth = currentProfile.DateOfBirth,
                    Bio = currentProfile.Bio,
                    Website = currentProfile.Website,
                    TimeZone = currentProfile.TimeZone,
                    ProfileImageUrl = imageUrl // Add this field to your DTO if not present
                };

                await _userService.UpdateUserProfileAsync(userId, updateDto);

                return Ok(new
                {
                    success = true,
                    imageUrl = imageUrl,
                    message = "Profile image uploaded successfully"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/user/profile-image
        [HttpDelete("profile-image")]
        public async Task<ActionResult> DeleteProfileImage()
        {
            try
            {
                var userId = GetCurrentUserId();
                var currentProfile = await _userService.GetUserProfileAsync(userId);

                if (!string.IsNullOrEmpty(currentProfile.ProfileImageUrl))
                {
                    await _imageStorageService.DeleteImageAsync(currentProfile.ProfileImageUrl);

                    // Update user profile to remove image URL
                    var updateDto = new UpdateUserProfileDto
                    {
                        FirstName = currentProfile.FirstName,
                        LastName = currentProfile.LastName,
                        Email = currentProfile.Email,
                        PhoneNumber = currentProfile.PhoneNumber,
                        DateOfBirth = currentProfile.DateOfBirth,
                        Bio = currentProfile.Bio,
                        Website = currentProfile.Website,
                        TimeZone = currentProfile.TimeZone,
                        ProfileImageUrl = null // Remove the image
                    };

                    await _userService.UpdateUserProfileAsync(userId, updateDto);
                }

                return Ok(new { message = "Profile image deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/user/profile
        [HttpGet("profile")]
        public async Task<ActionResult<UserProfileResponseDto>> GetProfile()
        {
            try
            {
                var userId = GetCurrentUserId();
                var profile = await _userService.GetUserProfileAsync(userId);
                return Ok(profile);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // PUT: api/user/profile
        [HttpPut("profile")]
        public async Task<ActionResult<UserProfileResponseDto>> UpdateProfile(UpdateUserProfileDto updateDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var profile = await _userService.UpdateUserProfileAsync(userId, updateDto);
                return Ok(profile);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/user/change-password
        [HttpPost("change-password")]
        public async Task<ActionResult> ChangePassword(ChangePasswordDto changePasswordDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                await _userService.ChangePasswordAsync(userId, changePasswordDto);
                return Ok(new { message = "Password changed successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/user/organization
        [HttpGet("organization")]
        public async Task<ActionResult<UserOrganizationDto>> GetOrganization()
        {
            try
            {
                var userId = GetCurrentUserId();
                var organization = await _userService.GetUserOrganizationAsync(userId);
                return Ok(organization);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // PUT: api/user/organization
        [HttpPut("organization")]
        public async Task<ActionResult<UserOrganizationDto>> UpdateOrganization(UpdateUserOrganizationDto updateDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var organization = await _userService.UpdateUserOrganizationAsync(userId, updateDto);
                return Ok(organization);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/user/preferences
        [HttpGet("preferences")]
        public async Task<ActionResult<UserPreferencesDto>> GetPreferences()
        {
            try
            {
                var userId = GetCurrentUserId();
                var preferences = await _userService.GetUserPreferencesAsync(userId);
                return Ok(preferences);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // PUT: api/user/preferences
        [HttpPut("preferences")]
        public async Task<ActionResult<UserPreferencesDto>> UpdatePreferences(UpdateUserPreferencesDto updateDto)
        {
            try
            {
                var userId = GetCurrentUserId();

                var preferences = await _userService.UpdateUserPreferencesAsync(userId, updateDto);


                return Ok(preferences);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/user/all
        [HttpGet("all")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<ActionResult<IEnumerable<UserProfileResponseDto>>> GetAllUsers()
        {
            try
            {
                var users = await _userService.GetAllUsersAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/user/{id}/role
        [HttpPut("{id}/role")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<ActionResult<UserProfileResponseDto>> UpdateUserRole(int id, UpdateUserRoleDto updateDto)
        {
            try
            {
                var user = await _userService.UpdateUserRoleAsync(id, updateDto);
                return Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}