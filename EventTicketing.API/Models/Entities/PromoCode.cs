
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EventTicketing.API.Models.Entities
{
    public enum PromoCodeType
    {
        Percentage = 0,   
        FixedAmount = 1    
    }

    public enum PromoCodeStatus
    {
        Inactive = 0,
        Active = 1,
        Expired = 2,
        Suspended = 3
    }

    public enum PromoCodeScope
    {
        EventSpecific = 0, 
        OrganizerWide = 1  
    }

   
    public class PromoCode
    {
        [Key]
        public int PromoCodeId { get; set; }

        [Required]
        [StringLength(50)]
        public string Code { get; set; } = string.Empty;

        [StringLength(200)]
        public string? Description { get; set; }

        [Required]
        public PromoCodeType Type { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Value { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? MinimumOrderAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? MaximumDiscountAmount { get; set; }

        [Required]
        public PromoCodeScope Scope { get; set; }

        [Required]
        public int OrganizerId { get; set; }
        [ForeignKey("OrganizerId")]
        public virtual User Organizer { get; set; } = null!;

        public int? EventId { get; set; }
        [ForeignKey("EventId")]
        public virtual Event? Event { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        public int MaxUsageCount { get; set; } = 1;

        public int CurrentUsageCount { get; set; } = 0;

        public int? MaxUsagePerUser { get; set; } = 1;

        [Required]
        public PromoCodeStatus Status { get; set; } = PromoCodeStatus.Active;

        [Required]
        public bool IsActive { get; set; } = true;

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public virtual ICollection<PromoCodeUsage> PromoCodeUsages { get; set; } = new List<PromoCodeUsage>();
    }

    public class PromoCodeUsage
    {
        [Key]
        public int PromoCodeUsageId { get; set; }

        [Required]
        public int PromoCodeId { get; set; }
        [ForeignKey("PromoCodeId")]
        public virtual PromoCode PromoCode { get; set; } = null!;

        [Required]
        public int OrderId { get; set; }
        [ForeignKey("OrderId")]
        public virtual Order Order { get; set; } = null!;

        [Required]
        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        [Required]
        public int EventId { get; set; }
        [ForeignKey("EventId")]
        public virtual Event Event { get; set; } = null!;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal DiscountAmount { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal OrderSubtotal { get; set; }

        [Required]
        public DateTime UsedAt { get; set; } = DateTime.UtcNow;
    }
}