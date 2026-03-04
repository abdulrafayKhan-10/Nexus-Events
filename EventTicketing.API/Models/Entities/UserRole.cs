using System.ComponentModel.DataAnnotations;

namespace EventTicketing.API.Models.Entities
{
    public class UserRole
    {
        [Key]
        public int UserRoleId { get; set; }
        public int UserId { get; set; }
        public RoleType Role { get; set; }
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;

        public User User { get; set; }
    }

    public enum RoleType
    {
        Customer,
        Organizer,
        Admin,
        VenueManager,
        SuperAdmin
    }
}