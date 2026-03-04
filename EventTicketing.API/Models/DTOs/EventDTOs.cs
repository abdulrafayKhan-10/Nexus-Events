using System.ComponentModel.DataAnnotations;

namespace EventTicketing.API.Models.DTOs
{
    public class CreateEventDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; }

        [Required]
        [StringLength(2000)]
        public string Description { get; set; }

        [StringLength(500)]
        public string? ShortDescription { get; set; }

        [Required]
        public int VenueId { get; set; }

        [Required]
        public int CategoryId { get; set; }

        [Required]
        public DateTime StartDateTime { get; set; }

        [Required]
        public DateTime EndDateTime { get; set; }

        public string? ImageUrl { get; set; }
        public string? BannerImageUrl { get; set; }
        public string? Tags { get; set; }

        [Range(1, 100000)]
        public int MaxAttendees { get; set; }

        [Range(0, 10000)]
        public decimal BasePrice { get; set; }

        public string Currency { get; set; } = "USD";
        public bool IsOnline { get; set; } = false;
        public string? OnlineUrl { get; set; }
    }

    public class UpdateEventDto
    {
        [StringLength(200)]
        public string? Title { get; set; }

        [StringLength(2000)]
        public string? Description { get; set; }

        [StringLength(500)]
        public string? ShortDescription { get; set; }

        public int? VenueId { get; set; }
        public int? CategoryId { get; set; }
        public DateTime? StartDateTime { get; set; }
        public DateTime? EndDateTime { get; set; }
        public string? ImageUrl { get; set; }
        public string? BannerImageUrl { get; set; }
        public string? Tags { get; set; }

        [Range(1, 100000)]
        public int? MaxAttendees { get; set; }

        [Range(0, 10000)]
        public decimal? BasePrice { get; set; }

        public string? Currency { get; set; }
        public bool? IsOnline { get; set; }
        public string? OnlineUrl { get; set; }
    }

    public class EventResponseDto
    {
        public int EventId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string? ShortDescription { get; set; }
        public int OrganizerId { get; set; }
        public string OrganizerName { get; set; }
        public int VenueId { get; set; }
        public string VenueName { get; set; }
        public string VenueCity { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        public string? ImageUrl { get; set; }
        public string? BannerImageUrl { get; set; }
        public string Status { get; set; }
        public bool IsPublished { get; set; }
        public bool IsFeatured { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? Tags { get; set; }
        public int MaxAttendees { get; set; }
        public decimal BasePrice { get; set; }
        public string Currency { get; set; }
        public bool IsOnline { get; set; }
        public string? OnlineUrl { get; set; }
        public int TicketsSold { get; set; }
        public int AvailableTickets { get; set; }
    }

    public class EventListDto
    {
        public int EventId { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }  // ADD THIS
        public string? ShortDescription { get; set; }
        public int OrganizerId { get; set; }  // ADD THIS
        public string OrganizerName { get; set; }
        public int VenueId { get; set; }  // ADD THIS
        public string VenueName { get; set; }
        public string VenueCity { get; set; }
        public int CategoryId { get; set; }  // ADD THIS
        public string CategoryName { get; set; }
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        public string? ImageUrl { get; set; }
        public string? BannerImageUrl { get; set; }  // ADD THIS
        public string Status { get; set; }
        public bool IsPublished { get; set; }
        public bool IsFeatured { get; set; }
        public DateTime CreatedAt { get; set; }  // ADD THIS
        public string? Tags { get; set; }  // ADD THIS
        public int MaxAttendees { get; set; }  // ADD THIS
        public decimal BasePrice { get; set; }
        public string Currency { get; set; }
        public bool IsOnline { get; set; }
        public string? OnlineUrl { get; set; }  // ADD THIS
        public int TicketsSold { get; set; }
        public int AvailableTickets { get; set; }
    }

    public class CreateCategoryDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        public string? IconUrl { get; set; }
    }

    public class CategoryResponseDto
    {
        public int CategoryId { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public string? IconUrl { get; set; }
        public bool IsActive { get; set; }
        public int EventCount { get; set; }
    }

    public class CreateVenueDto
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; }

        [StringLength(1000)]
        public string? Description { get; set; }

        [Required]
        public string Address { get; set; }

        [Required]
        public string City { get; set; }

        public string? State { get; set; }

        public string? ZipCode { get; set; }

        [Required]
        public string Country { get; set; }

        [Range(-90, 90)]
        public decimal? Latitude { get; set; }

        [Range(-180, 180)]
        public decimal? Longitude { get; set; }

        [Range(1, 1000000)]
        public int Capacity { get; set; }

        public string? ImageUrl { get; set; }
        public string? ContactEmail { get; set; }
        public string? ContactPhone { get; set; }
        public string? Website { get; set; }
    }

    public class VenueResponseDto
    {
        public int VenueId { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string ZipCode { get; set; }
        public string Country { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public int Capacity { get; set; }
        public string? ImageUrl { get; set; }
        public string? ContactEmail { get; set; }
        public string? ContactPhone { get; set; }
        public string? Website { get; set; }
        public bool IsActive { get; set; }
        public int EventCount { get; set; }
    }

    
}