using System.ComponentModel.DataAnnotations;
using EventTicketing.API.Models.Entities;

namespace EventTicketing.API.Models.DTOs
{
    public class UserProfileResponseDto
    {
        public int UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string? PhoneNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? ProfileImageUrl { get; set; }
        public bool IsEmailVerified { get; set; }
        public bool IsPhoneVerified { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public UserStatus Status { get; set; }

        public string? Bio { get; set; }
        public string? Website { get; set; }
        public string? TimeZone { get; set; }
        public bool IsOrganizer { get; set; }
        public List<string> Roles { get; set; } = new List<string>();
    }

    public class UpdateUserProfileDto
    {
        [Required]
        public string FirstName { get; set; }

        [Required]
        public string LastName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        public string? PhoneNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Bio { get; set; }
        public string? Website { get; set; }
     
        public string? TimeZone { get; set; }

        public string? ProfileImageUrl { get; set; }
    }

    public class UserOrganizationDto
    {
        public string? CompanyName { get; set; }
        public string? BusinessLicense { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? ZipCode { get; set; }
        public string? Country { get; set; }
    }

    public class UpdateUserOrganizationDto
    {
        public string? CompanyName { get; set; }
        public string? BusinessLicense { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? ZipCode { get; set; }
        public string? Country { get; set; }
    }

    public class UserPreferencesDto
    {
        // Notification preferences
        public bool EmailNotifications { get; set; } = true;
        public bool SmsNotifications { get; set; } = false;
        public bool NewBookingNotifications { get; set; } = true;
        public bool CancellationNotifications { get; set; } = true;
        public bool LowInventoryNotifications { get; set; } = true;
        public bool DailyReports { get; set; } = false;
        public bool WeeklyReports { get; set; } = true;
        public bool MonthlyReports { get; set; } = true;

        // Security preferences
        public bool TwoFactorEnabled { get; set; } = false;
        public int SessionTimeout { get; set; } = 30; // minutes
        public bool LoginNotifications { get; set; } = true;

        // Event defaults
        public string? DefaultTimeZone { get; set; } = "America/New_York";
        public int DefaultEventDuration { get; set; } = 120; // minutes
        public int DefaultTicketSaleStart { get; set; } = 30; // days before
        public string? DefaultRefundPolicy { get; set; } = "flexible";
        public bool RequireApproval { get; set; } = false;
        public bool AutoPublish { get; set; } = false;

        // Appearance preferences - EXISTING
        public string Theme { get; set; } = "light";
        public string Language { get; set; } = "en";
        public string DateFormat { get; set; } = "MM/dd/yyyy";
        public string TimeFormat { get; set; } = "12h";
        public string Currency { get; set; } = "USD";

        // NEW: Enhanced appearance preferences
        public string AccentColor { get; set; } = "blue";
        public string FontSize { get; set; } = "medium";
        public bool CompactMode { get; set; } = false;
    }

    public class UpdateUserPreferencesDto
    {
        // Notification preferences
        public bool EmailNotifications { get; set; }
        public bool SmsNotifications { get; set; }
        public bool NewBookingNotifications { get; set; }
        public bool CancellationNotifications { get; set; }
        public bool LowInventoryNotifications { get; set; }
        public bool DailyReports { get; set; }
        public bool WeeklyReports { get; set; }
        public bool MonthlyReports { get; set; }

        // Security preferences
        public bool TwoFactorEnabled { get; set; }
        public int SessionTimeout { get; set; }
        public bool LoginNotifications { get; set; }

        // Event defaults
        public string? DefaultTimeZone { get; set; }
        public int DefaultEventDuration { get; set; }
        public int DefaultTicketSaleStart { get; set; }
        public string? DefaultRefundPolicy { get; set; }
        public bool RequireApproval { get; set; }
        public bool AutoPublish { get; set; }

        // Appearance preferences - EXISTING
        public string Theme { get; set; }
        public string Language { get; set; }
        public string DateFormat { get; set; }
        public string TimeFormat { get; set; }
        public string Currency { get; set; }

        // NEW: Enhanced appearance preferences
        [RegularExpression("^(blue|purple|green|red|orange|pink)$",
            ErrorMessage = "AccentColor must be one of: blue, purple, green, red, orange, pink")]
        public string AccentColor { get; set; }

        [RegularExpression("^(small|medium|large)$",
            ErrorMessage = "FontSize must be one of: small, medium, large")]
        public string FontSize { get; set; }

        public bool CompactMode { get; set; }
    }

    public class ChangePasswordDto
    {
        [Required]
        public string CurrentPassword { get; set; }

        [Required]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters long")]
        public string NewPassword { get; set; }
    }

    public class UpdateUserRoleDto
    {
        [Required]
        public string Role { get; set; }
    }
}