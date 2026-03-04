using EventTicketing.API.Models.DTOs;
using EventTicketing.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations;

namespace EventTicketing.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PromoCodesController : ControllerBase
    {
        private readonly IPromoCodeService _promoCodeService;

        public PromoCodesController(IPromoCodeService promoCodeService)
        {
            _promoCodeService = promoCodeService;
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }

        private string GetUserRole()
        {
            return User.FindFirst(ClaimTypes.Role)?.Value ?? "";
        }

        // Organizer endpoints - Main functionality
        [HttpPost]
        [Authorize(Roles = "Organizer")]
        public async Task<ActionResult<PromoCodeResponseDto>> CreatePromoCode([FromBody] CreatePromoCodeDto createDto)
        {
            try
            {
                var result = await _promoCodeService.CreatePromoCodeAsync(createDto, GetUserId());
                return CreatedAtAction(nameof(GetPromoCode), new { id = result.PromoCodeId }, result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        [Authorize(Roles = "Organizer,Admin")]
        public async Task<ActionResult<List<PromoCodeResponseDto>>> GetPromoCodes()
        {
            try
            {
                if (GetUserRole() == "Admin")
                {
                    var adminResult = await _promoCodeService.GetAllPromoCodesAsync(GetUserId());
                    return Ok(adminResult);
                }

                var result = await _promoCodeService.GetOrganizerPromoCodesAsync(GetUserId());
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Organizer")]
        public async Task<ActionResult<PromoCodeResponseDto>> GetPromoCode(int id)
        {
            try
            {
                var result = await _promoCodeService.GetPromoCodeByIdAsync(id, GetUserId());
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Organizer")]
        public async Task<ActionResult<PromoCodeResponseDto>> UpdatePromoCode(int id, [FromBody] UpdatePromoCodeDto updateDto)
        {
            try
            {
                var result = await _promoCodeService.UpdatePromoCodeAsync(id, updateDto, GetUserId());
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Organizer")]
        public async Task<ActionResult> DeletePromoCode(int id)
        {
            try
            {
                var result = await _promoCodeService.DeletePromoCodeAsync(id, GetUserId());
                if (result)
                    return NoContent();
                return NotFound();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("event/{eventId}")]
        [Authorize(Roles = "Organizer")]
        public async Task<ActionResult<List<PromoCodeResponseDto>>> GetEventPromoCodes(int eventId)
        {
            try
            {
                var result = await _promoCodeService.GetEventPromoCodesAsync(eventId, GetUserId());
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("stats")]
        [Authorize(Roles = "Organizer,Admin")]
        public async Task<ActionResult<object>> GetPromoCodeStats()
        {
            try
            {
                if (GetUserRole() == "Admin")
                {
                    var adminStats = await _promoCodeService.GetSystemPromoCodeStatsAsync(GetUserId());
                    return Ok(adminStats);
                }

                var organizerStats = await _promoCodeService.GetOrganizerPromoCodeStatsAsync(GetUserId());
                return Ok(organizerStats);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Customer-facing endpoints
        [HttpPost("validate")]
        [AllowAnonymous]
        public async Task<ActionResult<PromoCodeValidationDto>> ValidatePromoCode([FromBody] ValidatePromoCodeRequest request)
        {
            try
            {

                var userId = User.Identity?.IsAuthenticated == true ? GetUserId() : 0;

                var result = await _promoCodeService.ValidatePromoCodeAsync(request.Code, request.EventId, request.OrderSubtotal, userId);


                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Analytics endpoints
        [HttpGet("{id}/analytics")]
        [Authorize(Roles = "Organizer")]
        public async Task<ActionResult<object>> GetPromoCodeAnalytics(int id)
        {
            try
            {
                var result = await _promoCodeService.GetPromoCodeAnalyticsAsync(id, GetUserId());
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}/usage-history")]
        [Authorize(Roles = "Organizer")]
        public async Task<ActionResult<List<PromoCodeUsageResponseDto>>> GetPromoCodeUsageHistory(int id)
        {
            try
            {
                var result = await _promoCodeService.GetPromoCodeUsageHistoryAsync(id, GetUserId());
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}