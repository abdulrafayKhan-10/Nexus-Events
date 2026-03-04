using EventTicketing.API.Models.DTOs;
using EventTicketing.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EventTicketing.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventsController : ControllerBase
    {
        private readonly IEventService _eventService;
        private readonly IImageStorageService _imageStorageService;

        public EventsController(IEventService eventService, IImageStorageService imageStorageService)
        {
            _eventService = eventService;
            _imageStorageService = imageStorageService;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                throw new UnauthorizedAccessException("User not authenticated");

            return int.Parse(userIdClaim.Value);
        }

        [HttpPost("{id}/upload-banner")]
        public async Task<ActionResult> UploadEventBanner(int id, IFormFile file)
        {
            try
            {
                var userId = GetCurrentUserId();

                if (!await _imageStorageService.ValidateImageAsync(file))
                {
                    return BadRequest(new { message = "Invalid image file. Please upload a valid image (JPEG, PNG, WebP, GIF) under 5MB." });
                }

                var imageUrl = await _eventService.UploadEventBannerAsync(id, file, userId);

                return Ok(new
                {
                    success = true,
                    imageUrl = imageUrl,
                    message = "Event banner uploaded successfully"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/events/{id}/upload-image
        [HttpPost("{id}/upload-image")]
        [Authorize]
        public async Task<ActionResult> UploadEventImage(int id, IFormFile file)
        {
            try
            {
                var userId = GetCurrentUserId();

                if (!await _imageStorageService.ValidateImageAsync(file))
                {
                    return BadRequest(new { message = "Invalid image file. Please upload a valid image (JPEG, PNG, WebP, GIF) under 5MB." });
                }

                var imageUrl = await _eventService.UploadEventImageAsync(id, file, userId);

                return Ok(new
                {
                    success = true,
                    imageUrl = imageUrl,
                    message = "Event image uploaded successfully"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/events/{id}/banner
        [HttpDelete("{id}/banner")]
        [Authorize]
        public async Task<ActionResult> DeleteEventBanner(int id)
        {
            try
            {
                var userId = GetCurrentUserId();

                var eventEntity = await _eventService.GetEventByIdAsync(id);
                if (eventEntity.OrganizerId != userId)
                {
                    return Forbid("You can only modify your own events");
                }

                if (!string.IsNullOrEmpty(eventEntity.BannerImageUrl))
                {
                    await _imageStorageService.DeleteImageAsync(eventEntity.BannerImageUrl);

                    // Update event to remove banner URL
                    var updateDto = new UpdateEventDto { BannerImageUrl = null };
                    await _eventService.UpdateEventAsync(id, updateDto, userId);
                }

                return Ok(new { message = "Event banner deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/events/{id}/image
        [HttpDelete("{id}/image")]
        [Authorize]
        public async Task<ActionResult> DeleteEventImage(int id)
        {
            try
            {
                var userId = GetCurrentUserId();

                var eventEntity = await _eventService.GetEventByIdAsync(id);
                if (eventEntity.OrganizerId != userId)
                {
                    return Forbid("You can only modify your own events");
                }

                if (!string.IsNullOrEmpty(eventEntity.ImageUrl))
                {
                    await _imageStorageService.DeleteImageAsync(eventEntity.ImageUrl);

                    // Update event to remove image URL
                    var updateDto = new UpdateEventDto { ImageUrl = null };
                    await _eventService.UpdateEventAsync(id, updateDto, userId);
                }

                return Ok(new { message = "Event image deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/events
        [HttpGet]
        public async Task<ActionResult<List<EventListDto>>> GetEvents(
            [FromQuery] int? categoryId = null,
            [FromQuery] string? search = null,
            [FromQuery] bool? isOnline = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var events = await _eventService.GetEventsAsync(categoryId, search, isOnline,
                    startDate, endDate, page, pageSize);
                return Ok(events);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/events/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<EventResponseDto>> GetEvent(int id)
        {
            try
            {
                var eventDto = await _eventService.GetEventByIdAsync(id);
                return Ok(eventDto);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // POST: api/events
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<EventResponseDto>> CreateEvent(CreateEventDto createEventDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var eventDto = await _eventService.CreateEventAsync(createEventDto, userId);
                return CreatedAtAction(nameof(GetEvent), new { id = eventDto.EventId }, eventDto);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/events/{id}
        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<EventResponseDto>> UpdateEvent(int id, UpdateEventDto updateEventDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var eventDto = await _eventService.UpdateEventAsync(id, updateEventDto, userId);
                return Ok(eventDto);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/events/{id}
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult> DeleteEvent(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _eventService.DeleteEventAsync(id, userId);
                if (result)
                    return NoContent();
                return NotFound(new { message = "Event not found" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/events/{id}/publish
        [HttpPost("{id}/publish")]
        [Authorize]
        public async Task<ActionResult> PublishEvent(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _eventService.PublishEventAsync(id, userId);
                if (result)
                    return Ok(new { message = "Event published successfully" });
                return NotFound(new { message = "Event not found" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/events/{id}/unpublish
        [HttpPost("{id}/unpublish")]
        [Authorize]
        public async Task<ActionResult> UnpublishEvent(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _eventService.UnpublishEventAsync(id, userId);
                if (result)
                    return Ok(new { message = "Event unpublished successfully" });
                return NotFound(new { message = "Event not found" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/events/my-events
        [HttpGet("my-events")]
        [Authorize]
        public async Task<ActionResult<List<EventListDto>>> GetMyEvents()
        {
            try
            {
                var userId = GetCurrentUserId();
                var events = await _eventService.GetEventsByOrganizerAsync(userId);
                return Ok(events);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}