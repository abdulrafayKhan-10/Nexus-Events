using System.ComponentModel.DataAnnotations;

namespace EventTicketing.API.Models.Entities
{
    public class UserNotification
    {
        [Key]
        public int NotificationId { get; set; }
        public int UserId { get; set; }

        [Required]
        public string Title { get; set; }

        [Required]
        public string Message { get; set; }

        public NotificationType Type { get; set; }
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? ActionUrl { get; set; }

        public User User { get; set; }
    }

    public enum NotificationType
    {
        TicketPurchase,
        EventReminder,
        PaymentConfirmation,
        EventUpdate,
        PromoCode
    }
}