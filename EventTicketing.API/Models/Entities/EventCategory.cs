using System.ComponentModel.DataAnnotations;

namespace EventTicketing.API.Models.Entities
{
    public class EventCategory
    {
        [Key]
        public int CategoryId { get; set; }

        [Required]
        public string Name { get; set; }

        public string? Description { get; set; }
        public string? IconUrl { get; set; }
        public bool IsActive { get; set; } = true;

        public ICollection<Event> Events { get; set; } = new List<Event>();
    }
}