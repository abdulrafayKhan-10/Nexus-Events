using EventTicketing.API.Models.DTOs;
using EventTicketing.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using iTextSharp.text;
using iTextSharp.text.pdf;
using QRCoder;

namespace EventTicketing.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TicketsController : ControllerBase
    {
        private readonly ITicketService _ticketService;

        public TicketsController(ITicketService ticketService)
        {
            _ticketService = ticketService;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                throw new UnauthorizedAccessException("User not authenticated");

            return int.Parse(userIdClaim.Value);
        }

        // GET: api/tickets/event/{eventId}/ticket-types
        [HttpGet("event/{eventId}/ticket-types")]
        public async Task<ActionResult<List<TicketTypeResponseDto>>> GetEventTicketTypes(int eventId)
        {
            try
            {
                var ticketTypes = await _ticketService.GetTicketTypesByEventAsync(eventId);
                return Ok(ticketTypes);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/tickets/ticket-types
        [HttpPost("ticket-types")]
        [Authorize]
        public async Task<ActionResult<TicketTypeResponseDto>> CreateTicketType(CreateTicketTypeDto createTicketTypeDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var ticketType = await _ticketService.CreateTicketTypeAsync(createTicketTypeDto, userId);
                return CreatedAtAction(nameof(GetTicketType), new { id = ticketType.TicketTypeId }, ticketType);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/tickets/ticket-types/{id}
        [HttpPut("ticket-types/{id}")]
        [Authorize]
        public async Task<ActionResult<TicketTypeResponseDto>> UpdateTicketType(int id, UpdateTicketTypeDto updateTicketTypeDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var ticketType = await _ticketService.UpdateTicketTypeAsync(id, updateTicketTypeDto, userId);
                return Ok(ticketType);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/tickets/ticket-types/{id}
        [HttpGet("ticket-types/{id}")]
        public async Task<ActionResult<TicketTypeResponseDto>> GetTicketType(int id)
        {
            try
            {
                var ticketType = await _ticketService.GetTicketTypeByIdAsync(id);
                return Ok(ticketType);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // POST: api/tickets/calculate-order
        [HttpPost("calculate-order")]
        public async Task<ActionResult<OrderSummaryDto>> CalculateOrder(PurchaseTicketsDto purchaseDto)
        {
            try
            {
                var summary = await _ticketService.CalculateOrderSummaryAsync(purchaseDto);
                return Ok(summary);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/tickets/purchase
        [HttpPost("purchase")]
        [Authorize]
        public async Task<ActionResult<OrderResponseDto>> PurchaseTickets(PurchaseTicketsDto purchaseDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var order = await _ticketService.PurchaseTicketsAsync(purchaseDto, userId);
                return Ok(order);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/tickets/my-tickets
        [HttpGet("my-tickets")]
        [Authorize]
        public async Task<ActionResult<List<TicketResponseDto>>> GetMyTickets()
        {
            try
            {
                var userId = GetCurrentUserId();
                var tickets = await _ticketService.GetUserTicketsAsync(userId);
                return Ok(tickets);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/tickets/{id}
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<TicketResponseDto>> GetTicket(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var ticket = await _ticketService.GetTicketByIdAsync(id, userId);
                return Ok(ticket);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // POST: api/tickets/validate
        [HttpPost("validate")]
        [Authorize]
        public async Task<ActionResult<TicketValidationDto>> ValidateTicket([FromBody] string ticketNumber)
        {
            try
            {
                var validation = await _ticketService.ValidateTicketAsync(ticketNumber);
                return Ok(validation);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/tickets/check-in
        [HttpPost("check-in")]
        [Authorize]
        public async Task<ActionResult<TicketResponseDto>> CheckInTicket(CheckInTicketDto checkInDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var ticket = await _ticketService.CheckInTicketAsync(checkInDto, userId);
                return Ok(ticket);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/tickets/{id}/download
        [HttpGet("{id}/download")]
        [Authorize]
        public async Task<IActionResult> DownloadTicket(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var ticket = await _ticketService.GetTicketByIdAsync(id, userId);

                if (ticket == null)
                    return NotFound(new { message = "Ticket not found" });

                var pdfBytes = GenerateTicketPdf(ticket);
                var fileName = $"ticket-{ticket.TicketNumber}.pdf";

                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}/qr")]
        [Authorize]
        public async Task<IActionResult> GetTicketQR(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var ticket = await _ticketService.GetTicketByIdAsync(id, userId);

                if (ticket == null)
                    return NotFound();

                // Return QR data for frontend to generate
                return Ok(new
                {
                    qrData = $"TICKET:{ticket.TicketNumber}",
                    ticketNumber = ticket.TicketNumber,
                    message = "Use this data to generate QR code in frontend"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ENHANCED: Comprehensive event revenue endpoint
        [HttpGet("event/{eventId}/revenue")]
        [Authorize]
        public async Task<ActionResult<object>> GetEventRevenue(int eventId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var revenueAnalytics = await _ticketService.GetEventRevenueAnalyticsAsync(eventId, userId);
                return Ok(revenueAnalytics);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // NEW: Detailed revenue breakdown endpoint
        [HttpGet("event/{eventId}/revenue/detailed")]
        [Authorize]
        public async Task<ActionResult<object>> GetDetailedEventRevenue(int eventId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var detailedRevenue = await _ticketService.GetDetailedEventRevenueAsync(eventId, userId);
                return Ok(detailedRevenue);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // NEW: Revenue by time period endpoint
        [HttpGet("event/{eventId}/revenue/timeline")]
        [Authorize]
        public async Task<ActionResult<object>> GetEventRevenueTimeline(int eventId, [FromQuery] string period = "daily")
        {
            try
            {
                var userId = GetCurrentUserId();
                var timeline = await _ticketService.GetEventRevenueTimelineAsync(eventId, userId, period);
                return Ok(timeline);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // FIXED: PDF generation method
        private byte[] GenerateTicketPdf(TicketResponseDto ticket)
        {
            using (var memoryStream = new MemoryStream())
            {
                var document = new Document(PageSize.A4, 36, 36, 54, 54);
                var writer = PdfWriter.GetInstance(document, memoryStream);

                document.Open();

                // Fonts
                var titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 20, BaseColor.BLACK);
                var headerFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 14, BaseColor.BLACK);
                var normalFont = FontFactory.GetFont(FontFactory.HELVETICA, 12, BaseColor.BLACK);

                // Title
                var title = new iTextSharp.text.Paragraph("EVENT TICKET", titleFont)
                {
                    Alignment = Element.ALIGN_CENTER,
                    SpacingAfter = 20
                };
                document.Add(title);

                // Event Information
                document.Add(new iTextSharp.text.Paragraph("Event Details", headerFont) { SpacingAfter = 10 });

                var eventTable = new PdfPTable(2) { WidthPercentage = 100 };
                eventTable.SetWidths(new float[] { 30, 70 });

                // FIXED: Proper DateTime conversion
                string eventDateStr;
                if (DateTime.TryParse(ticket.EventStartDateTime, out var parsedEventDate))
                {
                    eventDateStr = parsedEventDate.ToString("dddd, MMMM dd, yyyy at h:mm tt");
                }
                else
                {
                    eventDateStr = ticket.EventStartDateTime ?? "Date not available";
                }

                AddTableRow(eventTable, "Event:", ticket.EventTitle ?? "", normalFont);
                AddTableRow(eventTable, "Date:", eventDateStr, normalFont);
                AddTableRow(eventTable, "Venue:", ticket.VenueName ?? "TBD", normalFont);
                AddTableRow(eventTable, "Address:", ticket.VenueAddress ?? "TBD", normalFont);

                document.Add(eventTable);
                document.Add(new iTextSharp.text.Paragraph(" ") { SpacingAfter = 10 });

                // Ticket Information
                document.Add(new iTextSharp.text.Paragraph("Ticket Details", headerFont) { SpacingAfter = 10 });

                var ticketTable = new PdfPTable(2) { WidthPercentage = 100 };
                ticketTable.SetWidths(new float[] { 30, 70 });

                string purchaseDateStr = ticket.PurchaseDate.ToString("MMMM dd, yyyy");

                AddTableRow(ticketTable, "Ticket Type:", ticket.TicketTypeName ?? "", normalFont);
                AddTableRow(ticketTable, "Ticket Number:", ticket.TicketNumber ?? "", normalFont);
                AddTableRow(ticketTable, "Attendee:", $"{ticket.AttendeeFirstName} {ticket.AttendeeLastName}", normalFont);
                AddTableRow(ticketTable, "Email:", ticket.AttendeeEmail ?? "", normalFont);
                AddTableRow(ticketTable, "Price Paid:", $"${ticket.PricePaid:F2}", normalFont);
                AddTableRow(ticketTable, "Purchase Date:", purchaseDateStr, normalFont);
                AddTableRow(ticketTable, "Status:", ticket.Status ?? "", normalFont);

                document.Add(ticketTable);
                document.Add(new iTextSharp.text.Paragraph(" ") { SpacingAfter = 20 });

                // Entry Information (instead of QR code)
                document.Add(new iTextSharp.text.Paragraph("Entry Information", headerFont)
                {
                    Alignment = Element.ALIGN_CENTER,
                    SpacingAfter = 10
                });

                document.Add(new iTextSharp.text.Paragraph($"Ticket Number: {ticket.TicketNumber}", normalFont)
                {
                    Alignment = Element.ALIGN_CENTER,
                    SpacingAfter = 5
                });

                document.Add(new iTextSharp.text.Paragraph("Show this number at the entrance", normalFont)
                {
                    Alignment = Element.ALIGN_CENTER,
                    SpacingAfter = 20
                });

                // Footer
                document.Add(new iTextSharp.text.Paragraph(" ") { SpacingAfter = 20 });
                document.Add(new iTextSharp.text.Paragraph("Important Information:", headerFont) { SpacingAfter = 5 });
                document.Add(new iTextSharp.text.Paragraph("• Please arrive 30 minutes before the event", normalFont));
                document.Add(new iTextSharp.text.Paragraph("• Bring a valid ID for verification", normalFont));
                document.Add(new iTextSharp.text.Paragraph("• This ticket is non-transferable", normalFont));

                document.Close();
                return memoryStream.ToArray();
            }
        }

        // Helper method to add table rows
        private void AddTableRow(PdfPTable table, string label, string value, iTextSharp.text.Font font)
        {
            var labelCell = new PdfPCell(new Phrase(label, FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 12)))
            {
                Border = PdfPCell.NO_BORDER,
                PaddingBottom = 5,
                VerticalAlignment = Element.ALIGN_TOP
            };

            var valueCell = new PdfPCell(new Phrase(value ?? "", font))
            {
                Border = PdfPCell.NO_BORDER,
                PaddingBottom = 5,
                VerticalAlignment = Element.ALIGN_TOP
            };

            table.AddCell(labelCell);
            table.AddCell(valueCell);
        }

        private byte[] GenerateQRCode(string ticketNumber)
        {
            try
            {
                // Instead of generating actual QR image, return simple text placeholder
                // The frontend can generate the actual QR code using JavaScript libraries
                var qrText = $"QR_PLACEHOLDER:{ticketNumber}";
                return System.Text.Encoding.UTF8.GetBytes(qrText);
            }
            catch (Exception ex)
            {
                return System.Text.Encoding.UTF8.GetBytes($"QR_ERROR:{ticketNumber}");
            }
        }

        // GET: api/tickets/my-tickets/count
        [HttpGet("my-tickets/count")]
        [Authorize]
        public async Task<ActionResult<object>> GetMyTicketCount()
        {
            try
            {
                var userId = GetCurrentUserId();
                var tickets = await _ticketService.GetUserTicketsAsync(userId);

                return Ok(new
                {
                    count = tickets.Count,
                    activeTickets = tickets.Count(t => t.Status == "Active" || t.Status == "Valid"),
                    usedTickets = tickets.Count(t => t.Status == "Used" || t.Status == "CheckedIn"),
                    totalTickets = tickets.Count
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message, count = 0 });
            }
        }
    }
}