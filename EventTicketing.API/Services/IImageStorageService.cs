using Microsoft.AspNetCore.Http;

namespace EventTicketing.API.Services
{
    public interface IImageStorageService
    {
        Task<string> UploadEventBannerAsync(IFormFile file, int eventId);
        Task<string> UploadEventImageAsync(IFormFile file, int eventId);
        Task<string> UploadVenueImageAsync(IFormFile file, int venueId);
        Task<string> UploadUserProfileImageAsync(IFormFile file, int userId);
        Task<string> UploadCategoryIconAsync(IFormFile file, int categoryId);
        Task<bool> DeleteImageAsync(string imageUrl);
        Task<bool> ValidateImageAsync(IFormFile file);
    }
}