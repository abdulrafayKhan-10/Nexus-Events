using EventTicketing.API.Data;
using EventTicketing.API.Models.DTOs;
using EventTicketing.API.Models.Entities;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace EventTicketing.API.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;
        private readonly IAuthService _authService; // For password hashing

        public UserService(ApplicationDbContext context, IAuthService authService)
        {
            _context = context;
            _authService = authService;
        }

        public async Task<UserProfileResponseDto> GetUserProfileAsync(int userId)
        {
            var user = await _context.Users
                .Include(u => u.UserProfile)
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
                throw new ArgumentException("User not found");

            return new UserProfileResponseDto
            {
                UserId = user.UserId,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                DateOfBirth = user.DateOfBirth,
                ProfileImageUrl = user.ProfileImageUrl,
                IsEmailVerified = user.IsEmailVerified,
                IsPhoneVerified = user.IsPhoneVerified,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt,
                Status = user.Status,
                Bio = user.UserProfile?.Bio,
                Website = user.UserProfile?.Website,
                TimeZone = user.UserProfile?.TimeZone,
                IsOrganizer = user.UserProfile?.IsOrganizer ?? false,
                Roles = user.UserRoles.Where(ur => ur.IsActive).Select(ur => ur.Role.ToString()).ToList()
            };
        }

        public async Task<UserProfileResponseDto> UpdateUserProfileAsync(int userId, UpdateUserProfileDto updateDto)
        {
            var user = await _context.Users
                .Include(u => u.UserProfile)
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
                throw new ArgumentException("User not found");

            // Check if email is already taken by another user
            if (await _context.Users.AnyAsync(u => u.Email == updateDto.Email && u.UserId != userId))
                throw new ArgumentException("Email is already in use");

            // Update user basic info
            user.FirstName = updateDto.FirstName;
            user.LastName = updateDto.LastName;
            user.Email = updateDto.Email;
            user.PhoneNumber = updateDto.PhoneNumber;
            user.DateOfBirth = updateDto.DateOfBirth;

            // ADD THIS: Update profile image URL if provided
            if (updateDto.ProfileImageUrl != null)
            {
                user.ProfileImageUrl = updateDto.ProfileImageUrl;
            }

            // Update or create user profile
            if (user.UserProfile == null)
            {
                user.UserProfile = new UserProfile
                {
                    UserId = userId,
                    Bio = updateDto.Bio,
                    Website = updateDto.Website,
                    TimeZone = updateDto.TimeZone
                };
                _context.UserProfiles.Add(user.UserProfile);
            }
            else
            {
                user.UserProfile.Bio = updateDto.Bio;
                user.UserProfile.Website = updateDto.Website;
                user.UserProfile.TimeZone = updateDto.TimeZone;
            }

            await _context.SaveChangesAsync();

            return await GetUserProfileAsync(userId);
        }

        public async Task ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
                throw new ArgumentException("User not found");

            // Verify current password (you'll need to implement password verification in AuthService)
            if (!await _authService.VerifyPasswordAsync(changePasswordDto.CurrentPassword, user.PasswordHash))
                throw new ArgumentException("Current password is incorrect");

            // Hash new password
            user.PasswordHash = await _authService.HashPasswordAsync(changePasswordDto.NewPassword);

            await _context.SaveChangesAsync();
        }

        public async Task<UserOrganizationDto> GetUserOrganizationAsync(int userId)
        {
            var userProfile = await _context.UserProfiles
                .FirstOrDefaultAsync(up => up.UserId == userId);

            if (userProfile == null)
            {
                return new UserOrganizationDto();
            }

            return new UserOrganizationDto
            {
                CompanyName = userProfile.CompanyName,
                BusinessLicense = userProfile.BusinessLicense,
                Address = userProfile.Address,
                City = userProfile.City,
                State = userProfile.State,
                ZipCode = userProfile.ZipCode,
                Country = userProfile.Country
            };
        }

        public async Task<UserOrganizationDto> UpdateUserOrganizationAsync(int userId, UpdateUserOrganizationDto updateDto)
        {
            var user = await _context.Users
                .Include(u => u.UserProfile)
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
                throw new ArgumentException("User not found");

            // Create profile if it doesn't exist
            if (user.UserProfile == null)
            {
                user.UserProfile = new UserProfile { UserId = userId };
                _context.UserProfiles.Add(user.UserProfile);
            }

            // Update organization info
            user.UserProfile.CompanyName = updateDto.CompanyName;
            user.UserProfile.BusinessLicense = updateDto.BusinessLicense;
            user.UserProfile.Address = updateDto.Address;
            user.UserProfile.City = updateDto.City;
            user.UserProfile.State = updateDto.State;
            user.UserProfile.ZipCode = updateDto.ZipCode;
            user.UserProfile.Country = updateDto.Country;

            await _context.SaveChangesAsync();

            return await GetUserOrganizationAsync(userId);
        }

        // UPDATED: Now uses actual UserPreferences entity with enhanced properties
        public async Task<UserPreferencesDto> GetUserPreferencesAsync(int userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
                throw new ArgumentException("User not found");

            var preferences = await _context.UserPreferences
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (preferences == null)
            {
                // Return default preferences if none exist
                return new UserPreferencesDto
                {
                    EmailNotifications = true,
                    SmsNotifications = false,
                    NewBookingNotifications = true,
                    CancellationNotifications = true,
                    LowInventoryNotifications = true,
                    DailyReports = false,
                    WeeklyReports = true,
                    MonthlyReports = true,
                    TwoFactorEnabled = false,
                    SessionTimeout = 30,
                    LoginNotifications = true,
                    DefaultTimeZone = "America/New_York",
                    DefaultEventDuration = 120,
                    DefaultTicketSaleStart = 30,
                    DefaultRefundPolicy = "flexible",
                    RequireApproval = false,
                    AutoPublish = false,
                    Theme = "light",
                    Language = "en",
                    DateFormat = "MM/dd/yyyy",
                    TimeFormat = "12h",
                    Currency = "USD",
                    // NEW: Enhanced appearance preferences
                    AccentColor = "blue",
                    FontSize = "medium",
                    CompactMode = false
                };
            }

            return new UserPreferencesDto
            {
                EmailNotifications = preferences.EmailNotifications,
                SmsNotifications = preferences.SmsNotifications,
                NewBookingNotifications = preferences.NewBookingNotifications,
                CancellationNotifications = preferences.CancellationNotifications,
                LowInventoryNotifications = preferences.LowInventoryNotifications,
                DailyReports = preferences.DailyReports,
                WeeklyReports = preferences.WeeklyReports,
                MonthlyReports = preferences.MonthlyReports,
                TwoFactorEnabled = preferences.TwoFactorEnabled,
                SessionTimeout = preferences.SessionTimeout,
                LoginNotifications = preferences.LoginNotifications,
                DefaultTimeZone = preferences.DefaultTimeZone,
                DefaultEventDuration = preferences.DefaultEventDuration,
                DefaultTicketSaleStart = preferences.DefaultTicketSaleStart,
                DefaultRefundPolicy = preferences.DefaultRefundPolicy,
                RequireApproval = preferences.RequireApproval,
                AutoPublish = preferences.AutoPublish,
                Theme = preferences.Theme,
                Language = preferences.Language,
                DateFormat = preferences.DateFormat,
                TimeFormat = preferences.TimeFormat,
                Currency = preferences.Currency,
                // NEW: Enhanced appearance preferences
                AccentColor = preferences.AccentColor,
                FontSize = preferences.FontSize,
                CompactMode = preferences.CompactMode
            };
        }

        // UPDATED: Now saves to actual UserPreferences entity with enhanced properties
        public async Task<UserPreferencesDto> UpdateUserPreferencesAsync(int userId, UpdateUserPreferencesDto updateDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
                throw new ArgumentException("User not found");

            var preferences = await _context.UserPreferences
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (preferences == null)
            {
                // Create new preferences if none exist
                preferences = new UserPreferences
                {
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow
                };
                _context.UserPreferences.Add(preferences);
            }

            // Map all properties from DTO to entity
            preferences.EmailNotifications = updateDto.EmailNotifications;
            preferences.SmsNotifications = updateDto.SmsNotifications;
            preferences.NewBookingNotifications = updateDto.NewBookingNotifications;
            preferences.CancellationNotifications = updateDto.CancellationNotifications;
            preferences.LowInventoryNotifications = updateDto.LowInventoryNotifications;
            preferences.DailyReports = updateDto.DailyReports;
            preferences.WeeklyReports = updateDto.WeeklyReports;
            preferences.MonthlyReports = updateDto.MonthlyReports;

            preferences.TwoFactorEnabled = updateDto.TwoFactorEnabled;
            preferences.SessionTimeout = updateDto.SessionTimeout;
            preferences.LoginNotifications = updateDto.LoginNotifications;

            preferences.DefaultTimeZone = updateDto.DefaultTimeZone;
            preferences.DefaultEventDuration = updateDto.DefaultEventDuration;
            preferences.DefaultTicketSaleStart = updateDto.DefaultTicketSaleStart;
            preferences.DefaultRefundPolicy = updateDto.DefaultRefundPolicy;
            preferences.RequireApproval = updateDto.RequireApproval;
            preferences.AutoPublish = updateDto.AutoPublish;

            preferences.Theme = updateDto.Theme;
            preferences.Language = updateDto.Language;
            preferences.DateFormat = updateDto.DateFormat;
            preferences.TimeFormat = updateDto.TimeFormat;
            preferences.Currency = updateDto.Currency;

            // NEW: Enhanced appearance preferences
            preferences.AccentColor = updateDto.AccentColor;
            preferences.FontSize = updateDto.FontSize;
            preferences.CompactMode = updateDto.CompactMode;

            preferences.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Return the updated preferences
            return new UserPreferencesDto
            {
                EmailNotifications = preferences.EmailNotifications,
                SmsNotifications = preferences.SmsNotifications,
                NewBookingNotifications = preferences.NewBookingNotifications,
                CancellationNotifications = preferences.CancellationNotifications,
                LowInventoryNotifications = preferences.LowInventoryNotifications,
                DailyReports = preferences.DailyReports,
                WeeklyReports = preferences.WeeklyReports,
                MonthlyReports = preferences.MonthlyReports,
                TwoFactorEnabled = preferences.TwoFactorEnabled,
                SessionTimeout = preferences.SessionTimeout,
                LoginNotifications = preferences.LoginNotifications,
                DefaultTimeZone = preferences.DefaultTimeZone,
                DefaultEventDuration = preferences.DefaultEventDuration,
                DefaultTicketSaleStart = preferences.DefaultTicketSaleStart,
                DefaultRefundPolicy = preferences.DefaultRefundPolicy,
                RequireApproval = preferences.RequireApproval,
                AutoPublish = preferences.AutoPublish,
                Theme = preferences.Theme,
                Language = preferences.Language,
                DateFormat = preferences.DateFormat,
                TimeFormat = preferences.TimeFormat,
                Currency = preferences.Currency,
                // NEW: Enhanced appearance preferences
                AccentColor = preferences.AccentColor,
                FontSize = preferences.FontSize,
                CompactMode = preferences.CompactMode
            };
        }

        public async Task<IEnumerable<UserProfileResponseDto>> GetAllUsersAsync()
        {
            var users = await _context.Users
                .Include(u => u.UserProfile)
                .Include(u => u.UserRoles)
                .ToListAsync();

            return users.Select(user => new UserProfileResponseDto
            {
                UserId = user.UserId,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                DateOfBirth = user.DateOfBirth,
                ProfileImageUrl = user.ProfileImageUrl,
                IsEmailVerified = user.IsEmailVerified,
                IsPhoneVerified = user.IsPhoneVerified,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt,
                Status = user.Status,
                Bio = user.UserProfile?.Bio,
                Website = user.UserProfile?.Website,
                TimeZone = user.UserProfile?.TimeZone,
                IsOrganizer = user.UserProfile?.IsOrganizer ?? false,
                Roles = user.UserRoles.Where(ur => ur.IsActive).Select(ur => ur.Role.ToString()).ToList()
            });
        }

        public async Task<UserProfileResponseDto> UpdateUserRoleAsync(int userId, UpdateUserRoleDto updateDto)
        {
            var user = await _context.Users
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
                throw new ArgumentException("User not found");

            if (!Enum.TryParse<RoleType>(updateDto.Role, out var roleType))
                throw new ArgumentException("Invalid role");

            // Deactivate existing roles
            foreach (var role in user.UserRoles)
            {
                role.IsActive = false;
            }

            // Add new role
            var newRole = new UserRole
            {
                UserId = userId,
                Role = roleType,
                AssignedAt = DateTime.UtcNow,
                IsActive = true
            };
            
            _context.UserRoles.Add(newRole);
            await _context.SaveChangesAsync();

            return await GetUserProfileAsync(userId);
        }
    }
}