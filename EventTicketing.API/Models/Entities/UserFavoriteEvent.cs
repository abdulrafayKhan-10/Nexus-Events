using System.ComponentModel.DataAnnotations;

namespace EventTicketing.API.Models.Entities
{
    public class UserFavoriteEvent
    {
        [Key]
        public int UserFavoriteEventId { get; set; }
        public int UserId { get; set; }
        public int EventId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User User { get; set; }
        public Event Event { get; set; }
    }
}