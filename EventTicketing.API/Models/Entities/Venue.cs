using System.ComponentModel.DataAnnotations;

namespace EventTicketing.API.Models.Entities
{
    public class Venue
    {
        [Key]
        public int VenueId { get; set; }

        [Required]
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
        public bool IsActive { get; set; } = true;

        public ICollection<Event> Events { get; set; } = new List<Event>();
    }
}