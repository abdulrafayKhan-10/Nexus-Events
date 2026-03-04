using System.ComponentModel.DataAnnotations;
using EventTicketing.API.Models.Entities;

namespace EventTicketing.API.Models.DTOs
{
    public class CreatePromoCodeDto
    {
        [Required]
        [StringLength(50)]
        [RegularExpression(@"^[A-Z0-9]+$", ErrorMessage = "Promo code must contain only uppercase letters and numbers")]
        public string Code { get; set; } = string.Empty;

        [StringLength(200)]
        public string? Description { get; set; }

        [Required]
        public PromoCodeType Type { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Value { get; set; }

        [Range(0, double.MaxValue)]
        public decimal? MinimumOrderAmount { get; set; }

        [Range(0, double.MaxValue)]
        public decimal? MaximumDiscountAmount { get; set; }

        [Required]
        public PromoCodeScope Scope { get; set; }

        public int? EventId { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        [Range(1, 10000)]
        public int MaxUsageCount { get; set; } = 100;

        [Range(1, 50)]
        public int? MaxUsagePerUser { get; set; } = 1;
    }

    public class UpdatePromoCodeDto
    {
        [StringLength(200)]
        public string? Description { get; set; }

        public PromoCodeType? Type { get; set; }

        [Range(0.01, double.MaxValue)]
        public decimal? Value { get; set; }

        [Range(0, double.MaxValue)]
        public decimal? MinimumOrderAmount { get; set; }

        [Range(0, double.MaxValue)]
        public decimal? MaximumDiscountAmount { get; set; }

        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        [Range(1, 10000)]
        public int? MaxUsageCount { get; set; }

        [Range(1, 50)]
        public int? MaxUsagePerUser { get; set; }

        public PromoCodeStatus? Status { get; set; }
        public bool? IsActive { get; set; }
    }

    public class PromoCodeResponseDto
    {
        public int PromoCodeId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Type { get; set; } = string.Empty;
        public decimal Value { get; set; }
        public string FormattedValue { get; set; } = string.Empty; 
        public decimal? MinimumOrderAmount { get; set; }
        public decimal? MaximumDiscountAmount { get; set; }
        public string Scope { get; set; } = string.Empty;
        public int OrganizerId { get; set; }
        public string OrganizerName { get; set; } = string.Empty;
        public int? EventId { get; set; }
        public string? EventTitle { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int MaxUsageCount { get; set; }
        public int CurrentUsageCount { get; set; }
        public int RemainingUsage { get; set; }
        public int? MaxUsagePerUser { get; set; }
        public string Status { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public bool IsValid { get; set; }
        public string? InvalidReason { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class PromoCodeValidationDto
    {
        public bool IsValid { get; set; }
        public string Message { get; set; } = string.Empty;
        public decimal DiscountAmount { get; set; }
        public string FormattedDiscount { get; set; } = string.Empty;
        public PromoCodeResponseDto? PromoCode { get; set; }
    }

    public class PromoCodeUsageResponseDto
    {
        public int PromoCodeUsageId { get; set; }
        public string PromoCode { get; set; } = string.Empty;
        public string OrderNumber { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string EventTitle { get; set; } = string.Empty;
        public decimal DiscountAmount { get; set; }
        public decimal OrderSubtotal { get; set; }
        public DateTime UsedAt { get; set; }
    }

    public class PromoCodeStatsDto
    {
        public int TotalPromoCodes { get; set; }
        public int ActivePromoCodes { get; set; }
        public int TotalUsages { get; set; }
        public decimal TotalDiscountGiven { get; set; }
        public decimal AverageDiscountAmount { get; set; }
        public List<PromoCodePerformanceDto> TopPerformingCodes { get; set; } = new();
    }

    public class PromoCodePerformanceDto
    {
        public string Code { get; set; } = string.Empty;
        public int Usages { get; set; }
        public decimal TotalDiscount { get; set; }
    }

    public class ValidatePromoCodeRequest
    {
        [Required]
        public string Code { get; set; } = string.Empty;

        [Required]
        public int EventId { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal OrderSubtotal { get; set; }
    }
}