using System.ComponentModel.DataAnnotations;

namespace EventTicketing.API.Models.Entities
{
	public class TicketType
	{
		[Key]
		public int TicketTypeId { get; set; }
		public int EventId { get; set; }

		[Required]
		public string Name { get; set; }

		public string? Description { get; set; }
		public decimal Price { get; set; }
		public int QuantityAvailable { get; set; }
		public int QuantitySold { get; set; } = 0;
		public DateTime? SaleStartDate { get; set; }
		public DateTime? SaleEndDate { get; set; }
		public int MinQuantityPerOrder { get; set; } = 1;
		public int MaxQuantityPerOrder { get; set; } = 10;
		public bool IsActive { get; set; } = true;
		public int SortOrder { get; set; }

		public Event Event { get; set; }
		public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}