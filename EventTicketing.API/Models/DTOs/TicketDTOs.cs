using System.ComponentModel.DataAnnotations;

namespace EventTicketing.API.Models.DTOs
{
    public class CreateTicketTypeDto
    {
        [Required]
        public int EventId { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        [Required]
        [Range(0, 10000)]
        public decimal Price { get; set; }

        [Required]
        [Range(1, 100000)]
        public int QuantityAvailable { get; set; }

        public DateTime? SaleStartDate { get; set; }
        public DateTime? SaleEndDate { get; set; }

        [Range(1, 100)]
        public int MinQuantityPerOrder { get; set; } = 1;

        [Range(1, 100)]
        public int MaxQuantityPerOrder { get; set; } = 10;

        public int SortOrder { get; set; } = 0;
    }

    public class UpdateTicketTypeDto
    {
        [StringLength(100)]
        public string? Name { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        [Range(0, 10000)]
        public decimal? Price { get; set; }

        [Range(1, 100000)]
        public int? QuantityAvailable { get; set; }

        public DateTime? SaleStartDate { get; set; }
        public DateTime? SaleEndDate { get; set; }

        [Range(1, 100)]
        public int? MinQuantityPerOrder { get; set; }

        [Range(1, 100)]
        public int? MaxQuantityPerOrder { get; set; }

        public int? SortOrder { get; set; }
        public bool? IsActive { get; set; }
    }

    public class TicketTypeResponseDto
    {
        public int TicketTypeId { get; set; }
        public int EventId { get; set; }
        public string EventTitle { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int QuantityAvailable { get; set; }
        public int QuantitySold { get; set; }
        public int QuantityRemaining { get; set; }
        public DateTime? SaleStartDate { get; set; }
        public DateTime? SaleEndDate { get; set; }
        public int MinQuantityPerOrder { get; set; }
        public int MaxQuantityPerOrder { get; set; }
        public bool IsActive { get; set; }
        public bool IsOnSale { get; set; }
        public int SortOrder { get; set; }

        // NEW: Add fields for smart editing support
        public bool IsEventPublished { get; set; }
        public string EventStatus { get; set; }
        public int TicketsSold => QuantitySold; // Alias for compatibility
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class PurchaseTicketsDto
    {
        [Required]
        public int EventId { get; set; }

        [Required]
        public List<TicketPurchaseItem> TicketItems { get; set; } = new List<TicketPurchaseItem>();

        [Required]
        [EmailAddress]
        public string BillingEmail { get; set; }

        [Required]
        public string BillingFirstName { get; set; }

        [Required]
        public string BillingLastName { get; set; }

        public string? BillingAddress { get; set; }
        public string? BillingCity { get; set; }
        public string? BillingState { get; set; }
        public string? BillingZipCode { get; set; }
        public string? PromoCode { get; set; }

        public List<AttendeeInfo> Attendees { get; set; } = new List<AttendeeInfo>();
    }

    public class TicketPurchaseItem
    {
        [Required]
        public int TicketTypeId { get; set; }

        [Required]
        [Range(1, 100)]
        public int Quantity { get; set; }
    }

    public class AttendeeInfo
    {
        [Required]
        public string FirstName { get; set; }

        [Required]
        public string LastName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }

    public class OrderResponseDto
    {
        public int OrderId { get; set; }
        public string OrderNumber { get; set; }
        public int UserId { get; set; }
        public int EventId { get; set; }
        public string EventTitle { get; set; }
        public decimal SubTotal { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal ServiceFee { get; set; }
        public decimal TotalAmount { get; set; }
        public string Currency { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string BillingEmail { get; set; }
        public string BillingFirstName { get; set; }
        public string BillingLastName { get; set; }
        public string? PromoCode { get; set; }
        public decimal DiscountAmount { get; set; }
        public List<TicketResponseDto> Tickets { get; set; } = new List<TicketResponseDto>();
    }

    public class TicketResponseDto
    {
        public int TicketId { get; set; }
        public int EventId { get; set; }
        public string EventTitle { get; set; }
        public int TicketTypeId { get; set; }
        public string TicketTypeName { get; set; }
        public string TicketNumber { get; set; }
        public string? QrCode { get; set; }
        public decimal PricePaid { get; set; }
        public string Currency { get; set; } = "USD"; 
        public string Status { get; set; }
        public DateTime PurchaseDate { get; set; }
        public DateTime? CheckInDate { get; set; }
        public string? AttendeeFirstName { get; set; }
        public string? AttendeeLastName { get; set; }
        public string? AttendeeEmail { get; set; }
        public string EventStartDateTime { get; set; }
        public string VenueName { get; set; }
        public string VenueAddress { get; set; }
    }

    public class CheckInTicketDto
    {
        [Required]
        public string TicketNumber { get; set; }

        
        public string? QrCode { get; set; }
    }

    public class TicketValidationDto
    {
        public bool IsValid { get; set; }
        public string Message { get; set; }
        public TicketResponseDto? Ticket { get; set; }
    }

    public class OrderSummaryDto
    {
        public int EventId { get; set; }
        public string EventTitle { get; set; }
        public List<TicketPurchaseItem> Items { get; set; } = new List<TicketPurchaseItem>();
        public decimal SubTotal { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal ServiceFee { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public string Currency { get; set; }
    }
}