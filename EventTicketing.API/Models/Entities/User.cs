using System.ComponentModel.DataAnnotations;

namespace EventTicketing.API.Models.Entities
{
    public class User
    {
        [Key]
        public int UserId { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        [Required]
        public string FirstName { get; set; }

        [Required]
        public string LastName { get; set; }

        public string? PhoneNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? ProfileImageUrl { get; set; }
        public bool IsEmailVerified { get; set; } = false;
        public bool IsPhoneVerified { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLoginAt { get; set; }
        public bool IsActive { get; set; } = true;
        public UserStatus Status { get; set; } = UserStatus.Active;

        public UserPreferences? UserPreferences { get; set; }

        // Navigation Properties
        public UserProfile? UserProfile { get; set; }
        public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
        public ICollection<Event> OrganizedEvents { get; set; } = new List<Event>();
        public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
        public ICollection<Order> Orders { get; set; } = new List<Order>();
        public ICollection<UserNotification> Notifications { get; set; } = new List<UserNotification>();
        public ICollection<EventReview> Reviews { get; set; } = new List<EventReview>();
        public ICollection<UserFavoriteEvent> FavoriteEvents { get; set; } = new List<UserFavoriteEvent>();
    }

    public enum UserStatus
    {
        Active,
        Inactive,
        Suspended,
        PendingVerification
    }
}