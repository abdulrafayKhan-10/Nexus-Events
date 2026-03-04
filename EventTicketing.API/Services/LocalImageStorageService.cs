using Microsoft.AspNetCore.Http;

namespace EventTicketing.API.Services
{
    public class LocalImageStorageService : IImageStorageService
    {
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<LocalImageStorageService> _logger;

        public LocalImageStorageService(IWebHostEnvironment environment, ILogger<LocalImageStorageService> logger)
        {
            _environment = environment;
            _logger = logger;
        }

        public async Task<string> UploadEventBannerAsync(IFormFile file, int eventId)
        {
            return await SaveImageAsync(file, "events", "banners", $"event-{eventId}-banner");
        }

        public async Task<string> UploadEventImageAsync(IFormFile file, int eventId)
        {
            return await SaveImageAsync(file, "events", null, $"event-{eventId}");
        }

        public async Task<string> UploadVenueImageAsync(IFormFile file, int venueId)
        {
            return await SaveImageAsync(file, "venues", null, $"venue-{venueId}");
        }

        public async Task<string> UploadUserProfileImageAsync(IFormFile file, int userId)
        {
            return await SaveImageAsync(file, "users", "profiles", $"user-{userId}-profile");
        }

        public async Task<string> UploadCategoryIconAsync(IFormFile file, int categoryId)
        {
            return await SaveImageAsync(file, "categories", "icons", $"category-{categoryId}-icon");
        }

        private async Task<string> SaveImageAsync(IFormFile file, string mainFolder, string? subFolder, string filePrefix)
        {
            try
            {
                var fileExtension = Path.GetExtension(file.FileName).ToLower();
                var timestamp = DateTime.Now.ToString("yyyyMMdd-HHmmss");
                var uniqueId = Guid.NewGuid().ToString("N")[..16]; // First 16 chars
                var fileName = $"{filePrefix}-{timestamp}-{uniqueId}{fileExtension}";

                // Build the relative path - FIXED: No duplicate "images" folder
                var pathParts = new List<string> { "images", mainFolder };
                if (!string.IsNullOrEmpty(subFolder))
                {
                    pathParts.Add(subFolder);
                }
                pathParts.Add(fileName);

                var relativePath = Path.Combine(pathParts.ToArray());
                var absolutePath = Path.Combine(_environment.WebRootPath, relativePath);


                // Ensure directory exists
                var directory = Path.GetDirectoryName(absolutePath);
                if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
                {
                    Directory.CreateDirectory(directory);
                }

                // Save the file
                using (var stream = new FileStream(absolutePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Return clean URL path (always with forward slashes and leading slash)
                var urlPath = "/" + relativePath.Replace('\\', '/');

                return urlPath;
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to save image: {ex.Message}");
            }
        }

        public async Task<bool> DeleteImageAsync(string imageUrl)
        {
            try
            {
                if (string.IsNullOrEmpty(imageUrl))
                {
                    return true;
                }


                // Convert URL to file path
                var relativePath = imageUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
                var absolutePath = Path.Combine(_environment.WebRootPath, relativePath);


                if (File.Exists(absolutePath))
                {
                    File.Delete(absolutePath);;
                    return true;
                }
                else
                {
                    return false;
                }
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public async Task<bool> ValidateImageAsync(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return false;
                }

                // Check file size (5MB limit)
                const long maxFileSize = 5 * 1024 * 1024; // 5MB
                if (file.Length > maxFileSize)
                {
                    return false;
                }

                // Check content type
                var allowedTypes = new[]
                {
                    "image/jpeg",
                    "image/jpg",
                    "image/png",
                    "image/webp",
                    "image/gif"
                };

                var contentType = file.ContentType.ToLower();
                if (!allowedTypes.Contains(contentType))
                {
                    return false;
                }

                // Check file extension
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
                var fileExtension = Path.GetExtension(file.FileName).ToLower();
                if (!allowedExtensions.Contains(fileExtension))
                {
                    return false;
                }

                // Basic file header validation (optional but recommended)
                using var stream = file.OpenReadStream();
                var buffer = new byte[8];
                await stream.ReadAsync(buffer, 0, 8);

                // Check for common image file signatures
                var isValidImage = IsValidImageHeader(buffer, contentType);
                if (!isValidImage)
                {
                    return false;
                }

                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        private static bool IsValidImageHeader(byte[] buffer, string contentType)
        {
            if (buffer.Length < 8) return false;

            return contentType switch
            {
                "image/jpeg" or "image/jpg" => buffer[0] == 0xFF && buffer[1] == 0xD8,
                "image/png" => buffer[0] == 0x89 && buffer[1] == 0x50 && buffer[2] == 0x4E && buffer[3] == 0x47,
                "image/gif" => (buffer[0] == 0x47 && buffer[1] == 0x49 && buffer[2] == 0x46),
                "image/webp" => buffer[0] == 0x52 && buffer[1] == 0x49 && buffer[2] == 0x46 && buffer[3] == 0x46,
                _ => true // Allow other types to pass basic validation
            };
        }
    }
}