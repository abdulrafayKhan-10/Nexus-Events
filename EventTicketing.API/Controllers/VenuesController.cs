using EventTicketing.API.Models.DTOs;
using EventTicketing.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventTicketing.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VenuesController : ControllerBase
    {
        private readonly IEventService _eventService;
        private readonly IImageStorageService _imageStorageService;

        public VenuesController(IEventService eventService, IImageStorageService imageStorageService)
        {
            _eventService = eventService;
            _imageStorageService = imageStorageService;
        }

        [HttpPost("{id}/upload-image")]
        [Authorize(Roles = "Admin,Organizer")]
        public async Task<ActionResult> UploadVenueImage(int id, IFormFile file)
        {
            try
            {
                if (!await _imageStorageService.ValidateImageAsync(file))
                {
                    return BadRequest(new { message = "Invalid image file. Please upload a valid image (JPEG, PNG, WebP, GIF) under 5MB." });
                }

                var imageUrl = await _eventService.UploadVenueImageAsync(id, file);

                return Ok(new
                {
                    success = true,
                    imageUrl = imageUrl,
                    message = "Venue image uploaded successfully"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/venues/{id}/image
        [HttpDelete("{id}/image")]
        [Authorize(Roles = "Admin,Organizer")]
        public async Task<ActionResult> DeleteVenueImage(int id)
        {
            try
            {
                var venue = await _eventService.GetVenueByIdAsync(id);

                if (!string.IsNullOrEmpty(venue.ImageUrl))
                {
                    await _imageStorageService.DeleteImageAsync(venue.ImageUrl);

                    // Note: You'll need to add an UpdateVenue method to EventService
                    // or handle this directly in the database
                }

                return Ok(new { message = "Venue image deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/venues
        [HttpGet]
        public async Task<ActionResult<List<VenueResponseDto>>> GetVenues([FromQuery] string? city = null)
        {
            try
            {
                var venues = await _eventService.GetVenuesAsync(city);
                return Ok(venues);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/venues/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<VenueResponseDto>> GetVenue(int id)
        {
            try
            {
                var venue = await _eventService.GetVenueByIdAsync(id);
                return Ok(venue);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // POST: api/venues
        [HttpPost]
        [Authorize(Roles = "Admin,Organizer")]
        public async Task<ActionResult<VenueResponseDto>> CreateVenue(CreateVenueDto createVenueDto)
        {
            try
            {
                var venue = await _eventService.CreateVenueAsync(createVenueDto);
                return CreatedAtAction(nameof(GetVenue), new { id = venue.VenueId }, venue);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        

        // GET: api/venues/{id}/events
        [HttpGet("{id}/events")]
        public async Task<ActionResult<List<EventListDto>>> GetVenueEvents(int id)
        {
            try
            {
                var events = await _eventService.GetEventsByVenueAsync(id);
                return Ok(events);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/venues/{id}/events/upcoming
        [HttpGet("{id}/events/upcoming")]
        public async Task<ActionResult<List<EventListDto>>> GetVenueUpcomingEvents(int id)
        {
            try
            {
                var events = await _eventService.GetUpcomingEventsByVenueAsync(id);
                return Ok(events);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/venues/{id}/events/past
        [HttpGet("{id}/events/past")]
        public async Task<ActionResult<List<EventListDto>>> GetVenuePastEvents(int id)
        {
            try
            {
                var events = await _eventService.GetPastEventsByVenueAsync(id);
                return Ok(events);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}