using System.ComponentModel.DataAnnotations;

namespace EventTicketing.API.Models.Entities
{
    public class Order
    {
        [Key]
        public int OrderId { get; set; }
        public int UserId { get; set; }

        [Required]
        public string OrderNumber { get; set; }

        public decimal SubTotal { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal ServiceFee { get; set; }
        public decimal TotalAmount { get; set; }
        public string Currency { get; set; } = "USD";
        public OrderStatus Status { get; set; } = OrderStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }
        public string BillingEmail { get; set; }
        public string BillingFirstName { get; set; }
        public string BillingLastName { get; set; }
        public string? BillingAddress { get; set; }
        public string? BillingCity { get; set; }
        public string? BillingState { get; set; }
        public string? BillingZipCode { get; set; }
        public string? PromoCode { get; set; }
        public decimal DiscountAmount { get; set; } = 0;

        public User User { get; set; }
        public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    }

    public enum OrderStatus
    {
        Pending,
        Completed,
        Cancelled,
        Refunded,
        Failed
    }
}