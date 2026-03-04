using EventTicketing.API.Models.DTOs;

namespace EventTicketing.API.Services
{
	public interface IEventService
	{
		Task<EventResponseDto> CreateEventAsync(CreateEventDto createEventDto, int organizerId);
		Task<EventResponseDto> GetEventByIdAsync(int eventId);
		Task<List<EventListDto>> GetEventsAsync(int? categoryId = null, string? search = null,
			bool? isOnline = null, DateTime? startDate = null, DateTime? endDate = null,
			int page = 1, int pageSize = 10);
		Task<List<EventListDto>> GetEventsByOrganizerAsync(int organizerId);
		Task<EventResponseDto> UpdateEventAsync(int eventId, UpdateEventDto updateEventDto, int organizerId);
		Task<bool> DeleteEventAsync(int eventId, int organizerId);
		Task<bool> PublishEventAsync(int eventId, int organizerId);
		Task<bool> UnpublishEventAsync(int eventId, int organizerId);

		// Categories
		Task<CategoryResponseDto> CreateCategoryAsync(CreateCategoryDto createCategoryDto);
		Task<List<CategoryResponseDto>> GetCategoriesAsync();
		Task<CategoryResponseDto> GetCategoryByIdAsync(int categoryId);

		// Venues
		Task<VenueResponseDto> CreateVenueAsync(CreateVenueDto createVenueDto);
		Task<List<VenueResponseDto>> GetVenuesAsync(string? city = null);
		Task<VenueResponseDto> GetVenueByIdAsync(int venueId);

        //Images
        Task<string> UploadEventBannerAsync(int eventId, IFormFile file, int organizerId);
        Task<string> UploadEventImageAsync(int eventId, IFormFile file, int organizerId);
        Task<string> UploadVenueImageAsync(int venueId, IFormFile file);

        Task<List<EventListDto>> GetEventsByVenueAsync(int venueId);
        Task<List<EventListDto>> GetUpcomingEventsByVenueAsync(int venueId);
        Task<List<EventListDto>> GetPastEventsByVenueAsync(int venueId);
    }
}