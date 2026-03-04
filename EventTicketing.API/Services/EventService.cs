using EventTicketing.API.Data;
using EventTicketing.API.Models.DTOs;
using EventTicketing.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace EventTicketing.API.Services
{
    public class EventService : IEventService
    {
        private readonly ApplicationDbContext _context;
        private readonly IImageStorageService _imageStorageService;

        public EventService(ApplicationDbContext context, IImageStorageService imageStorageService)
        {
            _context = context;
            _imageStorageService = imageStorageService; // ✅ Now it's properly injected
        }

        public async Task<string> UploadEventBannerAsync(int eventId, IFormFile file, int organizerId)
        {
            // Verify event exists and user owns it
            var eventEntity = await _context.Events.FindAsync(eventId);
            if (eventEntity == null)
                throw new Exception("Event not found");

            if (eventEntity.OrganizerId != organizerId)
                throw new Exception("You can only upload images for your own events");

            // Delete old banner if exists
            if (!string.IsNullOrEmpty(eventEntity.BannerImageUrl))
            {
                await _imageStorageService.DeleteImageAsync(eventEntity.BannerImageUrl);
            }

            // Upload new banner
            var imageUrl = await _imageStorageService.UploadEventBannerAsync(file, eventId);

            // Update event with new banner URL
            eventEntity.BannerImageUrl = imageUrl;
            eventEntity.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return imageUrl;
        }

        public async Task<string> UploadEventImageAsync(int eventId, IFormFile file, int organizerId)
        {
            // Verify event exists and user owns it
            var eventEntity = await _context.Events.FindAsync(eventId);
            if (eventEntity == null)
                throw new Exception("Event not found");

            if (eventEntity.OrganizerId != organizerId)
                throw new Exception("You can only upload images for your own events");

            // Delete old image if exists
            if (!string.IsNullOrEmpty(eventEntity.ImageUrl))
            {
                await _imageStorageService.DeleteImageAsync(eventEntity.ImageUrl);
            }

            // Upload new image
            var imageUrl = await _imageStorageService.UploadEventImageAsync(file, eventId);

            // Update event with new image URL
            eventEntity.ImageUrl = imageUrl;
            eventEntity.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return imageUrl;
        }

        public async Task<string> UploadVenueImageAsync(int venueId, IFormFile file)
        {
            // Verify venue exists
            var venue = await _context.Venues.FindAsync(venueId);
            if (venue == null)
                throw new Exception("Venue not found");

            // Delete old image if exists
            if (!string.IsNullOrEmpty(venue.ImageUrl))
            {
                await _imageStorageService.DeleteImageAsync(venue.ImageUrl);
            }

            // Upload new image
            var imageUrl = await _imageStorageService.UploadVenueImageAsync(file, venueId);

            // Update venue with new image URL
            venue.ImageUrl = imageUrl;

            await _context.SaveChangesAsync();

            return imageUrl;
        }

        public async Task<EventResponseDto> CreateEventAsync(CreateEventDto createEventDto, int organizerId)
        {
            // Validate venue exists
            var venue = await _context.Venues.FindAsync(createEventDto.VenueId);
            if (venue == null)
                throw new Exception("Venue not found");

            // Validate category exists
            var category = await _context.EventCategories.FindAsync(createEventDto.CategoryId);
            if (category == null)
                throw new Exception("Category not found");

            // Validate dates
            if (createEventDto.EndDateTime <= createEventDto.StartDateTime)
                throw new Exception("End date must be after start date");

            if (createEventDto.StartDateTime <= DateTime.UtcNow)
                throw new Exception("Start date must be in the future");

            var eventEntity = new Event
            {
                Title = createEventDto.Title,
                Description = createEventDto.Description,
                ShortDescription = createEventDto.ShortDescription,
                OrganizerId = organizerId,
                VenueId = createEventDto.VenueId,
                CategoryId = createEventDto.CategoryId,
                StartDateTime = createEventDto.StartDateTime,
                EndDateTime = createEventDto.EndDateTime,
                ImageUrl = createEventDto.ImageUrl,
                BannerImageUrl = createEventDto.BannerImageUrl,
                Tags = createEventDto.Tags,
                MaxAttendees = createEventDto.MaxAttendees,
                BasePrice = createEventDto.BasePrice,
                Currency = createEventDto.Currency,
                IsOnline = createEventDto.IsOnline,
                OnlineUrl = createEventDto.OnlineUrl,
                Status = EventStatus.Draft,
                IsPublished = false,
                IsFeatured = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Events.Add(eventEntity);
            await _context.SaveChangesAsync();

            return await GetEventByIdAsync(eventEntity.EventId);
        }

        public async Task<EventResponseDto> GetEventByIdAsync(int eventId)
        {
            var eventEntity = await _context.Events
                .Include(e => e.Organizer)
                .Include(e => e.Venue)
                .Include(e => e.Category)
                .Include(e => e.Tickets)
                .FirstOrDefaultAsync(e => e.EventId == eventId);

            if (eventEntity == null)
                throw new Exception("Event not found");

            var ticketsSold = eventEntity.Tickets.Count(t => t.Status == TicketStatus.Valid || t.Status == TicketStatus.Used);

            return new EventResponseDto
            {
                EventId = eventEntity.EventId,
                Title = eventEntity.Title,
                Description = eventEntity.Description,
                ShortDescription = eventEntity.ShortDescription,
                OrganizerId = eventEntity.OrganizerId,
                OrganizerName = $"{eventEntity.Organizer.FirstName} {eventEntity.Organizer.LastName}",
                VenueId = eventEntity.VenueId,
                VenueName = eventEntity.Venue.Name,
                VenueCity = eventEntity.Venue.City,
                CategoryId = eventEntity.CategoryId,
                CategoryName = eventEntity.Category.Name,
                StartDateTime = eventEntity.StartDateTime,
                EndDateTime = eventEntity.EndDateTime,
                ImageUrl = eventEntity.ImageUrl,
                BannerImageUrl = eventEntity.BannerImageUrl,
                Status = eventEntity.Status.ToString(),
                IsPublished = eventEntity.IsPublished,
                IsFeatured = eventEntity.IsFeatured,
                CreatedAt = eventEntity.CreatedAt,
                Tags = eventEntity.Tags,
                MaxAttendees = eventEntity.MaxAttendees,
                BasePrice = eventEntity.BasePrice,
                Currency = eventEntity.Currency,
                IsOnline = eventEntity.IsOnline,
                OnlineUrl = eventEntity.OnlineUrl,
                TicketsSold = ticketsSold,
                AvailableTickets = eventEntity.MaxAttendees - ticketsSold
            };
        }

        public async Task<List<EventListDto>> GetEventsAsync(int? categoryId = null, string? search = null,
            bool? isOnline = null, DateTime? startDate = null, DateTime? endDate = null,
            int page = 1, int pageSize = 10)
        {
            var query = _context.Events
                .Include(e => e.Organizer)
                .Include(e => e.Venue)
                .Include(e => e.Category)
                .Include(e => e.Tickets)
                .Where(e => e.IsPublished)
                .AsQueryable();

            // Apply filters
            if (categoryId.HasValue)
                query = query.Where(e => e.CategoryId == categoryId.Value);

            if (!string.IsNullOrEmpty(search))
                query = query.Where(e => e.Title.Contains(search) ||
                                       e.Description.Contains(search) ||
                                       e.Tags.Contains(search));

            if (isOnline.HasValue)
                query = query.Where(e => e.IsOnline == isOnline.Value);

            if (startDate.HasValue)
                query = query.Where(e => e.StartDateTime >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(e => e.EndDateTime <= endDate.Value);

            // Pagination
            var events = await query
                .OrderBy(e => e.StartDateTime)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

          
            return events.Select(e => new EventListDto
            {
                EventId = e.EventId,
                Title = e.Title,
                ShortDescription = e.ShortDescription,
                OrganizerName = $"{e.Organizer.FirstName} {e.Organizer.LastName}",

                VenueId = e.VenueId,  

                VenueName = e.Venue.Name,
                VenueCity = e.Venue.City,
                CategoryName = e.Category.Name,
                StartDateTime = e.StartDateTime,
                EndDateTime = e.EndDateTime,
                ImageUrl = e.ImageUrl,
                Status = e.Status.ToString(),
                IsPublished = e.IsPublished,
                IsFeatured = e.IsFeatured,
                BasePrice = e.BasePrice,
                Currency = e.Currency,
                IsOnline = e.IsOnline,
                TicketsSold = e.Tickets.Count(t => t.Status == TicketStatus.Valid || t.Status == TicketStatus.Used),
                AvailableTickets = e.MaxAttendees - e.Tickets.Count(t => t.Status == TicketStatus.Valid || t.Status == TicketStatus.Used)
            }).ToList();
        }

        public async Task<List<EventListDto>> GetEventsByOrganizerAsync(int organizerId)
        {
            var events = await _context.Events
                .Include(e => e.Organizer)
                .Include(e => e.Venue)
                .Include(e => e.Category)
                .Include(e => e.Tickets)
                .Where(e => e.OrganizerId == organizerId)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();

            return events.Select(e => new EventListDto
            {
                EventId = e.EventId,
                Title = e.Title,
                ShortDescription = e.ShortDescription,
                OrganizerName = $"{e.Organizer.FirstName} {e.Organizer.LastName}",

                
                VenueId = e.VenueId,  

                VenueName = e.Venue.Name,
                VenueCity = e.Venue.City,
                CategoryName = e.Category.Name,
                StartDateTime = e.StartDateTime,
                EndDateTime = e.EndDateTime,
                ImageUrl = e.ImageUrl,
                Status = e.Status.ToString(),
                IsPublished = e.IsPublished,
                IsFeatured = e.IsFeatured,
                BasePrice = e.BasePrice,
                Currency = e.Currency,
                IsOnline = e.IsOnline,
                TicketsSold = e.Tickets.Count(t => t.Status == TicketStatus.Valid || t.Status == TicketStatus.Used),
                AvailableTickets = e.MaxAttendees - e.Tickets.Count(t => t.Status == TicketStatus.Valid || t.Status == TicketStatus.Used)
            }).ToList();
        }

        public async Task<EventResponseDto> UpdateEventAsync(int eventId, UpdateEventDto updateEventDto, int organizerId)
        {
            var eventEntity = await _context.Events.FindAsync(eventId);
            if (eventEntity == null)
                throw new Exception("Event not found");

            if (eventEntity.OrganizerId != organizerId)
                throw new Exception("You can only update your own events");

            // Update only provided fields - SAFE VERSION
            if (!string.IsNullOrEmpty(updateEventDto.Title))
                eventEntity.Title = updateEventDto.Title;

            if (!string.IsNullOrEmpty(updateEventDto.Description))
                eventEntity.Description = updateEventDto.Description;

            if (updateEventDto.ShortDescription != null)
                eventEntity.ShortDescription = updateEventDto.ShortDescription;

            if (updateEventDto.VenueId.HasValue)
                eventEntity.VenueId = updateEventDto.VenueId.Value;

            if (updateEventDto.CategoryId.HasValue)
                eventEntity.CategoryId = updateEventDto.CategoryId.Value;

            if (updateEventDto.StartDateTime.HasValue)
                eventEntity.StartDateTime = updateEventDto.StartDateTime.Value;

            if (updateEventDto.EndDateTime.HasValue)
                eventEntity.EndDateTime = updateEventDto.EndDateTime.Value;

            if (updateEventDto.ImageUrl != null)
                eventEntity.ImageUrl = updateEventDto.ImageUrl;

            if (updateEventDto.BannerImageUrl != null)
                eventEntity.BannerImageUrl = updateEventDto.BannerImageUrl;

            if (updateEventDto.Tags != null)
                eventEntity.Tags = updateEventDto.Tags;

            if (updateEventDto.MaxAttendees.HasValue)
                eventEntity.MaxAttendees = updateEventDto.MaxAttendees.Value;

            if (updateEventDto.IsOnline.HasValue)
                eventEntity.IsOnline = updateEventDto.IsOnline.Value;

            if (updateEventDto.OnlineUrl != null)
                eventEntity.OnlineUrl = updateEventDto.OnlineUrl;

            eventEntity.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return await GetEventByIdAsync(eventId);
        }

        public async Task<bool> DeleteEventAsync(int eventId, int organizerId)
        {
            var eventEntity = await _context.Events.FindAsync(eventId);
            if (eventEntity == null)
                return false;

            if (eventEntity.OrganizerId != organizerId)
                throw new Exception("You can only delete your own events");

            _context.Events.Remove(eventEntity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> PublishEventAsync(int eventId, int organizerId)
        {
            var eventEntity = await _context.Events.FindAsync(eventId);
            if (eventEntity == null)
                return false;

            if (eventEntity.OrganizerId != organizerId)
                throw new Exception("You can only publish your own events");

            eventEntity.IsPublished = true;
            eventEntity.Status = EventStatus.Published;
            eventEntity.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UnpublishEventAsync(int eventId, int organizerId)
        {
            var eventEntity = await _context.Events.FindAsync(eventId);
            if (eventEntity == null)
                return false;

            if (eventEntity.OrganizerId != organizerId)
                throw new Exception("You can only unpublish your own events");

            eventEntity.IsPublished = false;
            eventEntity.Status = EventStatus.Draft;
            eventEntity.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        // Categories
        public async Task<CategoryResponseDto> CreateCategoryAsync(CreateCategoryDto createCategoryDto)
        {
            var category = new EventCategory
            {
                Name = createCategoryDto.Name,
                Description = createCategoryDto.Description,
                IconUrl = createCategoryDto.IconUrl,
                IsActive = true
            };

            _context.EventCategories.Add(category);
            await _context.SaveChangesAsync();

            return new CategoryResponseDto
            {
                CategoryId = category.CategoryId,
                Name = category.Name,
                Description = category.Description,
                IconUrl = category.IconUrl,
                IsActive = category.IsActive,
                EventCount = 0
            };
        }

        public async Task<List<CategoryResponseDto>> GetCategoriesAsync()
        {
            var categories = await _context.EventCategories
                .Include(c => c.Events)
                .Where(c => c.IsActive)
                .ToListAsync();

            return categories.Select(c => new CategoryResponseDto
            {
                CategoryId = c.CategoryId,
                Name = c.Name,
                Description = c.Description,
                IconUrl = c.IconUrl,
                IsActive = c.IsActive,
                EventCount = c.Events.Count(e => e.IsPublished)
            }).ToList();
        }

        public async Task<CategoryResponseDto> GetCategoryByIdAsync(int categoryId)
        {
            var category = await _context.EventCategories
                .Include(c => c.Events)
                .FirstOrDefaultAsync(c => c.CategoryId == categoryId);

            if (category == null)
                throw new Exception("Category not found");

            return new CategoryResponseDto
            {
                CategoryId = category.CategoryId,
                Name = category.Name,
                Description = category.Description,
                IconUrl = category.IconUrl,
                IsActive = category.IsActive,
                EventCount = category.Events.Count(e => e.IsPublished)
            };
        }

        // Venues
        public async Task<VenueResponseDto> CreateVenueAsync(CreateVenueDto createVenueDto)
        {
            var venue = new Venue
            {
                Name = createVenueDto.Name,
                Description = createVenueDto.Description,
                Address = createVenueDto.Address,
                City = createVenueDto.City,
                State = createVenueDto.State,
                ZipCode = createVenueDto.ZipCode,
                Country = createVenueDto.Country,
                Latitude = createVenueDto.Latitude,
                Longitude = createVenueDto.Longitude,
                Capacity = createVenueDto.Capacity,
                ImageUrl = createVenueDto.ImageUrl,
                ContactEmail = createVenueDto.ContactEmail,
                ContactPhone = createVenueDto.ContactPhone,
                Website = createVenueDto.Website,
                IsActive = true
            };

            _context.Venues.Add(venue);
            await _context.SaveChangesAsync();

            return new VenueResponseDto
            {
                VenueId = venue.VenueId,
                Name = venue.Name,
                Description = venue.Description,
                Address = venue.Address,
                City = venue.City,
                State = venue.State,
                ZipCode = venue.ZipCode,
                Country = venue.Country,
                Latitude = venue.Latitude,
                Longitude = venue.Longitude,
                Capacity = venue.Capacity,
                ImageUrl = venue.ImageUrl,
                ContactEmail = venue.ContactEmail,
                ContactPhone = venue.ContactPhone,
                Website = venue.Website,
                IsActive = venue.IsActive,
                EventCount = 0
            };
        }

        public async Task<List<VenueResponseDto>> GetVenuesAsync(string? city = null)
        {
            var query = _context.Venues
                .Include(v => v.Events)
                .Where(v => v.IsActive)
                .AsQueryable();

            if (!string.IsNullOrEmpty(city))
                query = query.Where(v => v.City.Contains(city));

            var venues = await query.ToListAsync();

            return venues.Select(v => new VenueResponseDto
            {
                VenueId = v.VenueId,
                Name = v.Name,
                Description = v.Description,
                Address = v.Address,
                City = v.City,
                State = v.State,
                ZipCode = v.ZipCode,
                Country = v.Country,
                Latitude = v.Latitude,
                Longitude = v.Longitude,
                Capacity = v.Capacity,
                ImageUrl = v.ImageUrl,
                ContactEmail = v.ContactEmail,
                ContactPhone = v.ContactPhone,
                Website = v.Website,
                IsActive = v.IsActive,
                EventCount = v.Events.Count(e => e.IsPublished)
            }).ToList();
        }

        public async Task<VenueResponseDto> GetVenueByIdAsync(int venueId)
        {
            var venue = await _context.Venues
                .Include(v => v.Events)
                .FirstOrDefaultAsync(v => v.VenueId == venueId);

            if (venue == null)
                throw new Exception("Venue not found");

            return new VenueResponseDto
            {
                VenueId = venue.VenueId,
                Name = venue.Name,
                Description = venue.Description,
                Address = venue.Address,
                City = venue.City,
                State = venue.State,
                ZipCode = venue.ZipCode,
                Country = venue.Country,
                Latitude = venue.Latitude,
                Longitude = venue.Longitude,
                Capacity = venue.Capacity,
                ImageUrl = venue.ImageUrl,
                ContactEmail = venue.ContactEmail,
                ContactPhone = venue.ContactPhone,
                Website = venue.Website,
                IsActive = venue.IsActive,
                EventCount = venue.Events.Count(e => e.IsPublished)
            };
        }

        public async Task<List<EventListDto>> GetEventsByVenueAsync(int venueId)
        {
            var events = await _context.Events
                .Include(e => e.Venue)
                .Include(e => e.Category)
                .Include(e => e.Organizer)
                .Include(e => e.Tickets)  // ADD THIS
                .Where(e => e.VenueId == venueId && e.IsPublished)
                .OrderByDescending(e => e.StartDateTime)
                .Select(e => new EventListDto
                {
                    EventId = e.EventId,
                    Title = e.Title,
                    Description = e.Description,
                    ShortDescription = e.ShortDescription,
                    OrganizerId = e.OrganizerId,
                    OrganizerName = e.Organizer.FirstName + " " + e.Organizer.LastName,
                    VenueId = e.VenueId,
                    VenueName = e.Venue.Name,
                    VenueCity = e.Venue.City,
                    CategoryId = e.CategoryId,
                    CategoryName = e.Category.Name,
                    StartDateTime = e.StartDateTime,
                    EndDateTime = e.EndDateTime,
                    ImageUrl = e.ImageUrl,
                    BannerImageUrl = e.BannerImageUrl,
                    Status = e.Status.ToString(),  // FIX: Convert enum to string
                    IsPublished = e.IsPublished,
                    IsFeatured = e.IsFeatured,
                    CreatedAt = e.CreatedAt,
                    Tags = e.Tags,
                    MaxAttendees = e.MaxAttendees,
                    BasePrice = e.BasePrice,
                    Currency = e.Currency,
                    IsOnline = e.IsOnline,
                    OnlineUrl = e.OnlineUrl,
                    TicketsSold = e.Tickets.Count(t => t.Status == TicketStatus.Valid || t.Status == TicketStatus.Used),
                    AvailableTickets = e.MaxAttendees - e.Tickets.Count(t => t.Status == TicketStatus.Valid || t.Status == TicketStatus.Used)  
                })
                .ToListAsync();

            return events;
        }

        public async Task<List<EventListDto>> GetUpcomingEventsByVenueAsync(int venueId)
        {
            var now = DateTime.UtcNow;

            var events = await _context.Events
                .Include(e => e.Venue)
                .Include(e => e.Category)
                .Include(e => e.Organizer)
                .Include(e => e.Tickets)  // ADD THIS
                .Where(e => e.VenueId == venueId &&
                           e.IsPublished &&
                           e.StartDateTime > now)
                .OrderBy(e => e.StartDateTime)
                .Select(e => new EventListDto
                {
                    EventId = e.EventId,
                    Title = e.Title,
                    Description = e.Description,
                    ShortDescription = e.ShortDescription,
                    OrganizerId = e.OrganizerId,
                    OrganizerName = e.Organizer.FirstName + " " + e.Organizer.LastName,
                    VenueId = e.VenueId,
                    VenueName = e.Venue.Name,
                    VenueCity = e.Venue.City,
                    CategoryId = e.CategoryId,
                    CategoryName = e.Category.Name,
                    StartDateTime = e.StartDateTime,
                    EndDateTime = e.EndDateTime,
                    ImageUrl = e.ImageUrl,
                    BannerImageUrl = e.BannerImageUrl,
                    Status = e.Status.ToString(),  
                    IsPublished = e.IsPublished,
                    IsFeatured = e.IsFeatured,
                    CreatedAt = e.CreatedAt,
                    Tags = e.Tags,
                    MaxAttendees = e.MaxAttendees,
                    BasePrice = e.BasePrice,
                    Currency = e.Currency,
                    IsOnline = e.IsOnline,
                    OnlineUrl = e.OnlineUrl,
                    TicketsSold = e.Tickets.Count(t => t.Status == TicketStatus.Valid || t.Status == TicketStatus.Used),  
                    AvailableTickets = e.MaxAttendees - e.Tickets.Count(t => t.Status == TicketStatus.Valid || t.Status == TicketStatus.Used)  
                })
                .ToListAsync();

            return events;
        }

        public async Task<List<EventListDto>> GetPastEventsByVenueAsync(int venueId)
        {
            var now = DateTime.UtcNow;

            var events = await _context.Events
                .Include(e => e.Venue)
                .Include(e => e.Category)
                .Include(e => e.Organizer)
                .Include(e => e.Tickets) 
                .Where(e => e.VenueId == venueId &&
                           e.IsPublished &&
                           e.StartDateTime <= now)
                .OrderByDescending(e => e.StartDateTime)
                .Select(e => new EventListDto
                {
                    EventId = e.EventId,
                    Title = e.Title,
                    Description = e.Description,
                    ShortDescription = e.ShortDescription,
                    OrganizerId = e.OrganizerId,
                    OrganizerName = e.Organizer.FirstName + " " + e.Organizer.LastName,
                    VenueId = e.VenueId,
                    VenueName = e.Venue.Name,
                    VenueCity = e.Venue.City,
                    CategoryId = e.CategoryId,
                    CategoryName = e.Category.Name,
                    StartDateTime = e.StartDateTime,
                    EndDateTime = e.EndDateTime,
                    ImageUrl = e.ImageUrl,
                    BannerImageUrl = e.BannerImageUrl,
                    Status = e.Status.ToString(),  
                    IsPublished = e.IsPublished,
                    IsFeatured = e.IsFeatured,
                    CreatedAt = e.CreatedAt,
                    Tags = e.Tags,
                    MaxAttendees = e.MaxAttendees,
                    BasePrice = e.BasePrice,
                    Currency = e.Currency,
                    IsOnline = e.IsOnline,
                    OnlineUrl = e.OnlineUrl,
                    TicketsSold = e.Tickets.Count(t => t.Status == TicketStatus.Valid || t.Status == TicketStatus.Used), 
                    AvailableTickets = e.MaxAttendees - e.Tickets.Count(t => t.Status == TicketStatus.Valid || t.Status == TicketStatus.Used)  
                })
                .ToListAsync();

            return events;
        }
    }
}