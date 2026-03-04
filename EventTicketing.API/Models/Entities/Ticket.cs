using System.ComponentModel.DataAnnotations;

namespace EventTicketing.API.Models.Entities
{
    public class Ticket
    {
        [Key]
        public int TicketId { get; set; }
        public int EventId { get; set; }
        public int TicketTypeId { get; set; }
        public int OrderId { get; set; }
        public int UserId { get; set; }

        [Required]
        public string TicketNumber { get; set; }

        public string? QrCode { get; set; }
        public decimal PricePaid { get; set; }
        public TicketStatus Status { get; set; } = TicketStatus.Valid;
        public DateTime PurchaseDate { get; set; } = DateTime.UtcNow;
        public DateTime? CheckInDate { get; set; }
        public string? AttendeeFirstName { get; set; }
        public string? AttendeeLastName { get; set; }
        public string? AttendeeEmail { get; set; }

        public Event Event { get; set; }
        public TicketType TicketType { get; set; }
        public Order Order { get; set; }
        public User User { get; set; }
    }

    public enum TicketStatus
    {
        Valid,
        Used,
        Cancelled,
        Refunded
    }
}