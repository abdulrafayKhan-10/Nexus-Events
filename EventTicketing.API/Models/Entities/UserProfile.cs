using System.ComponentModel.DataAnnotations;

namespace EventTicketing.API.Models.Entities
{
    public class UserProfile
    {
        [Key]
        public int UserProfileId { get; set; }

        public int UserId { get; set; }
        public string? Bio { get; set; }
        public string? Website { get; set; }
        public string? CompanyName { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? ZipCode { get; set; }
        public string? Country { get; set; }
        public string? TimeZone { get; set; }
        public bool IsOrganizer { get; set; } = false;
        public string? BusinessLicense { get; set; }

        // Navigation
        public User User { get; set; }
    }
}