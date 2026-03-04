using System.ComponentModel.DataAnnotations;

namespace EventTicketing.API.Models.Entities
{
    public class UserPreferences
    {
        [Key]
        public int UserPreferencesId { get; set; }
        public int UserId { get; set; }

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
        public string DefaultTimeZone { get; set; } = "America/New_York";
        public int DefaultEventDuration { get; set; } = 120; // minutes
        public int DefaultTicketSaleStart { get; set; } = 30; // days before
        public string DefaultRefundPolicy { get; set; } = "flexible";
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
        public string FontSize { get; set; } = "medium"; // small, medium, large
        public bool CompactMode { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public User User { get; set; }
    }
}