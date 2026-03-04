using EventTicketing.API.Models.DTOs;

namespace EventTicketing.API.Services
{
    public interface IPromoCodeService
    {
        // Organizer functions - main functionality
        Task<PromoCodeResponseDto> CreatePromoCodeAsync(CreatePromoCodeDto createDto, int organizerId);
        Task<PromoCodeResponseDto> UpdatePromoCodeAsync(int promoCodeId, UpdatePromoCodeDto updateDto, int organizerId);
        Task<bool> DeletePromoCodeAsync(int promoCodeId, int organizerId);
        Task<List<PromoCodeResponseDto>> GetOrganizerPromoCodesAsync(int organizerId);
        Task<List<PromoCodeResponseDto>> GetEventPromoCodesAsync(int eventId, int organizerId);
        Task<PromoCodeResponseDto> GetPromoCodeByIdAsync(int promoCodeId, int organizerId);

        // Customer-facing validation
        Task<PromoCodeValidationDto> ValidatePromoCodeAsync(string code, int eventId, decimal orderSubtotal, int userId);
        Task<decimal> CalculateDiscountAsync(string code, int eventId, decimal orderSubtotal, int userId);
        Task<PromoCodeUsageResponseDto> RecordPromoCodeUsageAsync(string code, int orderId, int eventId, decimal discountAmount, decimal orderSubtotal, int userId);

        // Analytics for organizers
        Task<object> GetPromoCodeAnalyticsAsync(int promoCodeId, int organizerId);
        Task<List<PromoCodeUsageResponseDto>> GetPromoCodeUsageHistoryAsync(int promoCodeId, int organizerId);
        Task<PromoCodeStatsDto> GetOrganizerPromoCodeStatsAsync(int organizerId);

        // Admin oversight (optional)
        Task<List<PromoCodeResponseDto>> GetAllPromoCodesAsync(int adminUserId);
        Task<object> GetSystemPromoCodeStatsAsync(int adminUserId);
    }
}