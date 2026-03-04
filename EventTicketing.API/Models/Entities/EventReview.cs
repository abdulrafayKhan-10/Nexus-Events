using System.ComponentModel.DataAnnotations;

namespace EventTicketing.API.Models.Entities
{
    public class EventReview
    {
        [Key]
        public int ReviewId { get; set; }
        public int EventId { get; set; }
        public int UserId { get; set; }

        [Range(1, 5)]
        public int Rating { get; set; }

        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsVerified { get; set; } = false;

        public Event Event { get; set; }
        public User User { get; set; }
    }
}