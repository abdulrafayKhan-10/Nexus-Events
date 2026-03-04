using System.ComponentModel.DataAnnotations;

namespace EventTicketing.API.Models.Entities
{
    public class Event
    {
        [Key]
        public int EventId { get; set; }

        [Required]
        public string Title { get; set; }

        [Required]
        public string Description { get; set; }

        public string? ShortDescription { get; set; }
        public int OrganizerId { get; set; }
        public int VenueId { get; set; }
        public int CategoryId { get; set; }
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        public string? ImageUrl { get; set; }
        public string? BannerImageUrl { get; set; }
        public EventStatus Status { get; set; } = EventStatus.Draft;
        public bool IsPublished { get; set; } = false;
        public bool IsFeatured { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public string? Tags { get; set; }
        public int MaxAttendees { get; set; }
        public decimal BasePrice { get; set; }
        public string Currency { get; set; } = "USD";
        public bool IsOnline { get; set; } = false;
        public string? OnlineUrl { get; set; }

        // Navigation Properties
        public User Organizer { get; set; }
        public Venue Venue { get; set; }
        public EventCategory Category { get; set; }
        public ICollection<TicketType> TicketTypes { get; set; } = new List<TicketType>();
        public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
        public ICollection<EventReview> Reviews { get; set; } = new List<EventReview>();
        public ICollection<UserFavoriteEvent> FavoritedBy { get; set; } = new List<UserFavoriteEvent>();
    }

    public enum EventStatus
    {
        Draft,
        Published,
        SoldOut,
        Cancelled,
        Completed
    }
}