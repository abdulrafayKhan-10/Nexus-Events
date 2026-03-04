namespace EventTicketing.API.Models.DTOs
{
    public class RevenueAnalyticsDto
    {
        public decimal TotalRevenue { get; set; }
        public int TotalAttendees { get; set; }
        public int ActiveEvents { get; set; }
        public int TotalVenues { get; set; }
        public List<EventRevenueDto> Events { get; set; } = new();
    }

    public class EventRevenueDto
    {
        public int EventId { get; set; }
        public string EventName { get; set; } = string.Empty;
        public decimal TotalRevenue { get; set; }
        public int AttendeeCount { get; set; }
        public int TicketsSold { get; set; }
    }

    public class PaymentMethodAnalyticsDto
    {
        public List<PaymentMethodDto> Methods { get; set; } = new();
    }

    public class PaymentMethodDto
    {
        public string PaymentMethod { get; set; } = string.Empty;
        public int OrderCount { get; set; }
        public decimal Percentage { get; set; }
        public decimal TotalAmount { get; set; }
    }

    public class CapacityAnalyticsDto
    {
        public List<CapacityEventDto> Events { get; set; } = new();
    }

    public class CapacityEventDto
    {
        public int EventId { get; set; }
        public string EventName { get; set; } = string.Empty;
        public int MaxCapacity { get; set; }
        public int TicketsSold { get; set; }
        public decimal UtilizationPercentage { get; set; }
    }

    public class DemographicsAnalyticsDto
    {
        public List<AgeGroupDto> AgeDistribution { get; set; } = new();
        public List<GenderDistributionDto> GenderDistribution { get; set; } = new();
    }

    public class AgeGroupDto
    {
        public string AgeGroup { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal Percentage { get; set; }
    }

    public class GenderDistributionDto
    {
        public string Gender { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal Percentage { get; set; }
    }

    public class CheckInAnalyticsDto
    {
        public List<CheckInHourlyDto> HourlyPattern { get; set; } = new();
        public int TotalCheckIns { get; set; }
        public int TotalTicketsSold { get; set; }
        public decimal AttendanceRate { get; set; }
    }

    public class CheckInHourlyDto
    {
        public string Hour { get; set; } = string.Empty;
        public int CheckInCount { get; set; }
        public int CumulativeCount { get; set; }
    }

    public class VenueAnalyticsDto
    {
        public List<VenuePerformanceDto> Performance { get; set; } = new();
    }

    public class VenuePerformanceDto
    {
        public int VenueId { get; set; }
        public string VenueName { get; set; } = string.Empty;
        public int EventCount { get; set; }
        public int AvgAttendance { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal AvgRating { get; set; }
    }

    public class SeasonalAnalyticsDto
    {
        public List<SeasonalTrendDto> MonthlyTrends { get; set; } = new();
    }

    public class SeasonalTrendDto
    {
        public string Month { get; set; } = string.Empty;
        public int EventCount { get; set; }
        public decimal TotalRevenue { get; set; }
        public int TotalAttendance { get; set; }
    }

    public class LowAttendanceAnalyticsDto
    {
        public List<LowAttendanceEventDto> Events { get; set; } = new();
    }

    public class LowAttendanceEventDto
    {
        public int EventId { get; set; }
        public string EventName { get; set; } = string.Empty;
        public int MaxCapacity { get; set; }
        public int TicketsSold { get; set; }
        public decimal UtilizationPercentage { get; set; }
        public int DaysUntilEvent { get; set; }
        public List<TicketTypeDataDto> TicketTypes { get; set; } = new();
        public List<string> PotentialIssues { get; set; } = new();
        public List<string> Recommendations { get; set; } = new();
    }

    public class TicketTypeDataDto
    {
        public string TypeName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Sold { get; set; }
    }
}