using EventTicketing.API.Models.DTOs;

namespace EventTicketing.API.Services
{
    public interface IAnalyticsService
    {
        Task<RevenueAnalyticsDto> GetRevenueAnalyticsAsync(int organizerId, string period);
        Task<PaymentMethodAnalyticsDto> GetPaymentMethodAnalyticsAsync(int organizerId, string period);
        Task<CapacityAnalyticsDto> GetCapacityAnalyticsAsync(int organizerId, string period);
        Task<DemographicsAnalyticsDto> GetDemographicsAnalyticsAsync(int organizerId, string period);
        Task<CheckInAnalyticsDto> GetCheckInAnalyticsAsync(int organizerId, string period);
        Task<VenueAnalyticsDto> GetVenueAnalyticsAsync(int organizerId, string period);
        Task<SeasonalAnalyticsDto> GetSeasonalTrendsAsync(int organizerId);
        Task<LowAttendanceAnalyticsDto> GetLowAttendanceEventsAsync(int organizerId);
    }
}