using EventTicketing.API.Data;
using EventTicketing.API.Models.DTOs;
using EventTicketing.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace EventTicketing.API.Services
{
    public class TicketService : ITicketService
    {
        private readonly ApplicationDbContext _context;
        private readonly IQrCodeService _qrCodeService;
        private readonly IPromoCodeService _promoCodeService;

        public TicketService(ApplicationDbContext context, IQrCodeService qrCodeService, IPromoCodeService promoCodeService)
        {
            _context = context;
            _qrCodeService = qrCodeService;
            _promoCodeService = promoCodeService;
        }

        // ENHANCED: Comprehensive Event Revenue Analytics
        public async Task<object> GetEventRevenueAnalyticsAsync(int eventId, int organizerId)
        {
            // Verify the organizer owns this event
            var eventEntity = await _context.Events
                .FirstOrDefaultAsync(e => e.EventId == eventId && e.OrganizerId == organizerId);

            if (eventEntity == null)
            {
                throw new UnauthorizedAccessException("Event not found or you don't have permission to access it");
            }

            // Get all orders for this event with related data
            var orders = await _context.Orders
                .Include(o => o.Tickets)
                    .ThenInclude(t => t.TicketType)
                .Where(o => o.Tickets.Any(t => t.EventId == eventId))
                .ToListAsync();

            // Get all tickets for this event
            var tickets = await _context.Tickets
                .Include(t => t.TicketType)
                .Where(t => t.EventId == eventId)
                .ToListAsync();

            // Calculate actual revenue from tickets sold (what customers actually paid)
            var grossRevenue = tickets.Sum(t => t.PricePaid);

            // Calculate fees and taxes from orders
            var totalServiceFees = orders.Sum(o => o.ServiceFee);
            var totalTaxes = orders.Sum(o => o.TaxAmount);
            var totalDiscounts = orders.Sum(o => o.DiscountAmount);

            // Net revenue (what organizer receives after platform fees)
            var netRevenue = grossRevenue - totalServiceFees;

            // Revenue by ticket type
            var revenueByTicketType = tickets
                .GroupBy(t => new { t.TicketTypeId, t.TicketType.Name, t.TicketType.Price })
                .Select(g => new
                {
                    TicketTypeId = g.Key.TicketTypeId,
                    TicketTypeName = g.Key.Name,
                    OriginalPrice = g.Key.Price,
                    TicketsSold = g.Count(),
                    ActualRevenue = g.Sum(t => t.PricePaid),
                    AveragePrice = g.Average(t => t.PricePaid),
                    MaxPrice = g.Max(t => t.PricePaid),
                    MinPrice = g.Min(t => t.PricePaid)
                })
                .OrderByDescending(x => x.ActualRevenue)
                .ToList();

            // Promo code impact analysis - FIXED: Handle missing DiscountType property
            var promoCodeUsage = await _context.PromoCodeUsages
                .Include(pcu => pcu.PromoCode)
                .Where(pcu => pcu.EventId == eventId)
                .GroupBy(pcu => new { pcu.PromoCodeId, pcu.PromoCode.Code })
                .Select(g => new
                {
                    PromoCode = g.Key.Code,
                    DiscountType = "PERCENTAGE", // Default value since DiscountType doesn't exist
                    TimesUsed = g.Count(),
                    TotalDiscount = g.Sum(pcu => pcu.DiscountAmount),
                    AverageDiscount = g.Average(pcu => pcu.DiscountAmount),
                    TotalOrderValue = g.Sum(pcu => pcu.OrderSubtotal)
                })
                .OrderByDescending(x => x.TotalDiscount)
                .ToListAsync();

            return new
            {
                EventId = eventId,
                EventTitle = eventEntity.Title,
                Currency = eventEntity.Currency ?? "USD",

                // Core Revenue Metrics
                GrossRevenue = grossRevenue,
                NetRevenue = netRevenue,
                TotalServiceFees = totalServiceFees,
                TotalTaxes = totalTaxes,
                TotalDiscounts = totalDiscounts,

                // Ticket Sales Summary
                TotalTicketsSold = tickets.Count,
                TotalOrders = orders.Count,
                AverageOrderValue = orders.Count > 0 ? orders.Average(o => o.TotalAmount) : 0,
                AverageTicketPrice = tickets.Count > 0 ? tickets.Average(t => t.PricePaid) : 0,

                // Revenue Breakdown
                RevenueByTicketType = revenueByTicketType,

                // Promo Code Impact
                PromoCodeAnalysis = new
                {
                    TotalPromoCodeUsage = promoCodeUsage.Count,
                    TotalDiscountGiven = promoCodeUsage.Sum(p => p.TotalDiscount),
                    AverageDiscountPerCode = promoCodeUsage.Count > 0 ? promoCodeUsage.Average(p => p.TotalDiscount) : 0,
                    PromoCodeBreakdown = promoCodeUsage
                },

                // Performance Metrics
                ConversionMetrics = new
                {
                    DiscountPenetration = tickets.Count > 0 ? (decimal)promoCodeUsage.Sum(p => p.TimesUsed) / tickets.Count * 100 : 0,
                    AverageDiscountPercentage = grossRevenue > 0 ? totalDiscounts / grossRevenue * 100 : 0,
                    RevenueEfficiencyRatio = grossRevenue > 0 ? netRevenue / grossRevenue * 100 : 0
                }
            };
        }

        // NEW: Detailed Revenue Breakdown
        public async Task<object> GetDetailedEventRevenueAsync(int eventId, int organizerId)
        {
            var eventEntity = await _context.Events
                .FirstOrDefaultAsync(e => e.EventId == eventId && e.OrganizerId == organizerId);

            if (eventEntity == null)
            {
                throw new UnauthorizedAccessException("Event not found or you don't have permission to access it");
            }

            // Get detailed order and ticket information
            var orderDetails = await _context.Orders
                .Include(o => o.Tickets)
                    .ThenInclude(t => t.TicketType)
                .Where(o => o.Tickets.Any(t => t.EventId == eventId))
                .Select(o => new
                {
                    OrderId = o.OrderId,
                    OrderNumber = o.OrderNumber,
                    OrderDate = o.CreatedAt,
                    CustomerEmail = o.BillingEmail,
                    SubTotal = o.SubTotal,
                    ServiceFee = o.ServiceFee,
                    TaxAmount = o.TaxAmount,
                    DiscountAmount = o.DiscountAmount,
                    TotalAmount = o.TotalAmount,
                    PromoCode = o.PromoCode,
                    TicketCount = o.Tickets.Count,
                    Tickets = o.Tickets.Select(t => new
                    {
                        TicketId = t.TicketId,
                        TicketNumber = t.TicketNumber,
                        TicketTypeName = t.TicketType.Name,
                        OriginalPrice = t.TicketType.Price,
                        PricePaid = t.PricePaid,
                        PriceDifference = t.TicketType.Price - t.PricePaid,
                        AttendeeFirstName = t.AttendeeFirstName,
                        AttendeeLastName = t.AttendeeLastName,
                        AttendeeEmail = t.AttendeeEmail,
                        Status = t.Status.ToString(),
                        CheckInDate = t.CheckInDate
                    }).ToList()
                })
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            // Calculate revenue adjustments (refunds, cancellations, etc.)
            var refundedTickets = await _context.Tickets
                .Include(t => t.TicketType)
                .Where(t => t.EventId == eventId && t.Status == TicketStatus.Cancelled)
                .ToListAsync();

            var refundAmount = refundedTickets.Sum(t => t.PricePaid);

            return new
            {
                EventId = eventId,
                EventTitle = eventEntity.Title,
                Currency = eventEntity.Currency ?? "USD",
                GeneratedAt = DateTime.UtcNow,

                // Summary Metrics
                Summary = new
                {
                    TotalOrders = orderDetails.Count,
                    TotalTicketsSold = orderDetails.Sum(o => o.TicketCount),
                    GrossRevenue = orderDetails.Sum(o => o.TotalAmount),
                    NetRevenue = orderDetails.Sum(o => o.SubTotal),
                    TotalFees = orderDetails.Sum(o => o.ServiceFee),
                    TotalTaxes = orderDetails.Sum(o => o.TaxAmount),
                    TotalDiscounts = orderDetails.Sum(o => o.DiscountAmount),
                    RefundAmount = refundAmount,
                    FinalNetRevenue = orderDetails.Sum(o => o.SubTotal) - refundAmount
                },

                // Detailed order breakdown
                OrderDetails = orderDetails,

                // Refund information
                RefundedTickets = refundedTickets.Select(t => new
                {
                    TicketId = t.TicketId,
                    TicketNumber = t.TicketNumber,
                    TicketTypeName = t.TicketType.Name,
                    RefundAmount = t.PricePaid,
                    OriginalPurchaseDate = t.PurchaseDate,
                    AttendeeEmail = t.AttendeeEmail
                }).ToList()
            };
        }

        // NEW: Revenue Timeline Analysis - FIXED: Complete method implementation
        public async Task<object> GetEventRevenueTimelineAsync(int eventId, int organizerId, string period = "daily")
        {
            var eventEntity = await _context.Events
                .FirstOrDefaultAsync(e => e.EventId == eventId && e.OrganizerId == organizerId);

            if (eventEntity == null)
            {
                throw new UnauthorizedAccessException("Event not found or you don't have permission to access it");
            }

            var orders = await _context.Orders
                .Include(o => o.Tickets)
                .Where(o => o.Tickets.Any(t => t.EventId == eventId))
                .OrderBy(o => o.CreatedAt)
                .ToListAsync();

            var groupedData = period.ToLower() switch
            {
                "hourly" => orders.GroupBy(o => new {
                    Date = o.CreatedAt.Date,
                    Hour = o.CreatedAt.Hour
                }).Select(g => new
                {
                    Period = $"{g.Key.Date:yyyy-MM-dd} {g.Key.Hour:00}:00",
                    Date = g.Key.Date.AddHours(g.Key.Hour),
                    Orders = g.Count(),
                    Revenue = g.Sum(o => o.TotalAmount),
                    NetRevenue = g.Sum(o => o.SubTotal),
                    TicketsSold = g.Sum(o => o.Tickets.Count),
                    AverageOrderValue = g.Average(o => o.TotalAmount)
                }).OrderBy(x => x.Date),

                "weekly" => orders.GroupBy(o => new {
                    Year = o.CreatedAt.Year,
                    Week = System.Globalization.CultureInfo.CurrentCulture.Calendar.GetWeekOfYear(
                        o.CreatedAt,
                        System.Globalization.CalendarWeekRule.FirstFourDayWeek,
                        DayOfWeek.Monday)
                }).Select(g => new
                {
                    Period = $"{g.Key.Year}-W{g.Key.Week:00}",
                    Date = FirstDateOfWeek(g.Key.Year, g.Key.Week),
                    Orders = g.Count(),
                    Revenue = g.Sum(o => o.TotalAmount),
                    NetRevenue = g.Sum(o => o.SubTotal),
                    TicketsSold = g.Sum(o => o.Tickets.Count),
                    AverageOrderValue = g.Average(o => o.TotalAmount)
                }).OrderBy(x => x.Date),

                "monthly" => orders.GroupBy(o => new {
                    o.CreatedAt.Year,
                    o.CreatedAt.Month
                }).Select(g => new
                {
                    Period = $"{g.Key.Year}-{g.Key.Month:00}",
                    Date = new DateTime(g.Key.Year, g.Key.Month, 1),
                    Orders = g.Count(),
                    Revenue = g.Sum(o => o.TotalAmount),
                    NetRevenue = g.Sum(o => o.SubTotal),
                    TicketsSold = g.Sum(o => o.Tickets.Count),
                    AverageOrderValue = g.Average(o => o.TotalAmount)
                }).OrderBy(x => x.Date),

                _ => orders.GroupBy(o => o.CreatedAt.Date).Select(g => new // daily (default)
                {
                    Period = g.Key.ToString("yyyy-MM-dd"),
                    Date = g.Key,
                    Orders = g.Count(),
                    Revenue = g.Sum(o => o.TotalAmount),
                    NetRevenue = g.Sum(o => o.SubTotal),
                    TicketsSold = g.Sum(o => o.Tickets.Count),
                    AverageOrderValue = g.Average(o => o.TotalAmount)
                }).OrderBy(x => x.Date)
            };

            var timelineData = groupedData.ToList();

            // Calculate cumulative values
            decimal cumulativeRevenue = 0;
            int cumulativeTickets = 0;

            var enhancedTimeline = timelineData.Select(item =>
            {
                cumulativeRevenue += item.Revenue;
                cumulativeTickets += item.TicketsSold;

                return new
                {
                    item.Period,
                    item.Date,
                    item.Orders,
                    Revenue = item.Revenue,
                    NetRevenue = item.NetRevenue,
                    TicketsSold = item.TicketsSold,
                    AverageOrderValue = item.AverageOrderValue,
                    CumulativeRevenue = cumulativeRevenue,
                    CumulativeTickets = cumulativeTickets
                };
            }).ToList();

            return new
            {
                EventId = eventId,
                EventTitle = eventEntity.Title,
                Period = period,
                Currency = eventEntity.Currency ?? "USD",
                GeneratedAt = DateTime.UtcNow,
                Timeline = enhancedTimeline,
                Summary = new
                {
                    TotalPeriods = timelineData.Count,
                    FirstSale = timelineData.FirstOrDefault()?.Date,
                    LastSale = timelineData.LastOrDefault()?.Date,
                    PeakRevenueDay = timelineData.OrderByDescending(x => x.Revenue).FirstOrDefault(),
                    PeakTicketSalesDay = timelineData.OrderByDescending(x => x.TicketsSold).FirstOrDefault(),
                    TotalRevenue = timelineData.Sum(x => x.Revenue),
                    TotalTickets = timelineData.Sum(x => x.TicketsSold),
                    AverageRevenuePerPeriod = timelineData.Count > 0 ? timelineData.Average(x => x.Revenue) : 0
                }
            };
        }

        private DateTime FirstDateOfWeek(int year, int weekOfYear)
        {
            var jan1 = new DateTime(year, 1, 1);
            var daysOffset = DayOfWeek.Monday - jan1.DayOfWeek;
            var firstMonday = jan1.AddDays(daysOffset);
            var cal = System.Globalization.CultureInfo.CurrentCulture.Calendar;
            var firstWeek = cal.GetWeekOfYear(jan1, System.Globalization.CalendarWeekRule.FirstFourDayWeek, DayOfWeek.Monday);

            if (firstWeek <= 1)
            {
                weekOfYear -= 1;
            }

            return firstMonday.AddDays(weekOfYear * 7);
        }

        public async Task<List<TicketResponseDto>> GetTicketsByEventAsync(int eventId, int organizerId)
        {
            // Verify the organizer owns this event
            var eventEntity = await _context.Events
                .FirstOrDefaultAsync(e => e.EventId == eventId && e.OrganizerId == organizerId);

            if (eventEntity == null)
            {
                throw new UnauthorizedAccessException("Event not found or you don't have permission to access it");
            }

            var tickets = await _context.Tickets
                .Include(t => t.TicketType)
                .Include(t => t.User)
                .Include(t => t.TicketType.Event)
                .Include(t => t.TicketType.Event.Venue)
                .Where(t => t.TicketType.EventId == eventId)
                .Select(t => new TicketResponseDto
                {
                    TicketId = t.TicketId,
                    EventId = t.TicketType.EventId,
                    EventTitle = t.TicketType.Event.Title,
                    TicketTypeId = t.TicketTypeId,
                    TicketTypeName = t.TicketType.Name,
                    TicketNumber = t.TicketNumber,
                    QrCode = t.QrCode,
                    PricePaid = t.PricePaid,
                    Currency = t.TicketType.Event.Currency ?? "USD", // Get currency from Event, not Ticket
                    Status = t.Status.ToString(), // Convert enum to string
                    PurchaseDate = t.PurchaseDate,
                    CheckInDate = t.CheckInDate,
                    AttendeeFirstName = t.AttendeeFirstName,
                    AttendeeLastName = t.AttendeeLastName,
                    AttendeeEmail = t.AttendeeEmail,
                    EventStartDateTime = t.TicketType.Event.StartDateTime.ToString(),
                    VenueName = t.TicketType.Event.Venue != null ? t.TicketType.Event.Venue.Name : "TBD",
                    VenueAddress = t.TicketType.Event.Venue != null ? t.TicketType.Event.Venue.Address : "TBD"
                })
                .ToListAsync();

            return tickets;
        }

        public async Task<TicketTypeResponseDto> CreateTicketTypeAsync(CreateTicketTypeDto createTicketTypeDto, int organizerId)
        {
            // Fetch the event with related data for validation
            var eventEntity = await _context.Events
                .Include(e => e.TicketTypes)
                .ThenInclude(tt => tt.Tickets)
                .FirstOrDefaultAsync(e => e.EventId == createTicketTypeDto.EventId);

            if (eventEntity == null)
                throw new Exception("Event not found");

            // Verify the organizer owns the event
            if (eventEntity.OrganizerId != organizerId)
                throw new Exception("You can only create ticket types for your own events");

            // Business rule: Check if event is published
            if (eventEntity.IsPublished)
                throw new Exception("Cannot create ticket types for published events. Ticket types must be created before publishing to preserve sales data integrity.");

            // Business rule: Check if any tickets have been sold for this event
            var totalTicketsSold = eventEntity.TicketTypes.Sum(tt => tt.QuantitySold);
            if (totalTicketsSold > 0)
                throw new Exception($"Cannot create new ticket types. {totalTicketsSold} ticket(s) have already been sold for this event. Create ticket types before any sales occur.");

            // Business rule: Check if event is in draft status
            if (eventEntity.Status != EventStatus.Draft)
                throw new Exception("Ticket types can only be created when the event is in DRAFT status");

            // Additional validation: Check for duplicate ticket type names within the same event
            var existingTicketType = eventEntity.TicketTypes
                .FirstOrDefault(tt => tt.Name.ToLower() == createTicketTypeDto.Name.ToLower() && tt.IsActive);

            if (existingTicketType != null)
                throw new Exception($"A ticket type with the name '{createTicketTypeDto.Name}' already exists for this event");

            var ticketType = new TicketType
            {
                EventId = createTicketTypeDto.EventId,
                Name = createTicketTypeDto.Name,
                Description = createTicketTypeDto.Description,
                Price = createTicketTypeDto.Price,
                QuantityAvailable = createTicketTypeDto.QuantityAvailable,
                QuantitySold = 0,
                SaleStartDate = createTicketTypeDto.SaleStartDate,
                SaleEndDate = createTicketTypeDto.SaleEndDate,
                MinQuantityPerOrder = createTicketTypeDto.MinQuantityPerOrder,
                MaxQuantityPerOrder = createTicketTypeDto.MaxQuantityPerOrder,
                IsActive = true,
                SortOrder = createTicketTypeDto.SortOrder,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.TicketTypes.Add(ticketType);
            await _context.SaveChangesAsync();

            return await GetTicketTypeByIdAsync(ticketType.TicketTypeId);
        }

        public async Task<List<TicketTypeResponseDto>> GetTicketTypesByEventAsync(int eventId)
        {
            var ticketTypes = await _context.TicketTypes
                .Include(tt => tt.Event)
                .Where(tt => tt.EventId == eventId && tt.IsActive)
                .OrderBy(tt => tt.SortOrder)
                .ToListAsync();

            return ticketTypes.Select(tt => new TicketTypeResponseDto
            {
                TicketTypeId = tt.TicketTypeId,
                EventId = tt.EventId,
                EventTitle = tt.Event.Title,
                Name = tt.Name,
                Description = tt.Description,
                Price = tt.Price,
                QuantityAvailable = tt.QuantityAvailable,
                QuantitySold = tt.QuantitySold,
                QuantityRemaining = tt.QuantityAvailable - tt.QuantitySold,
                SaleStartDate = tt.SaleStartDate,
                SaleEndDate = tt.SaleEndDate,
                MinQuantityPerOrder = tt.MinQuantityPerOrder,
                MaxQuantityPerOrder = tt.MaxQuantityPerOrder,
                IsActive = tt.IsActive,
                IsOnSale = IsTicketTypeOnSale(tt),
                SortOrder = tt.SortOrder,
                // NEW: Smart editing support fields
                IsEventPublished = tt.Event.IsPublished,
                EventStatus = tt.Event.Status.ToString(),
                CreatedAt = tt.CreatedAt,
                UpdatedAt = tt.UpdatedAt
            }).ToList();
        }

        public async Task<TicketTypeResponseDto> GetTicketTypeByIdAsync(int ticketTypeId)
        {
            var ticketType = await _context.TicketTypes
                .Include(tt => tt.Event)
                .FirstOrDefaultAsync(tt => tt.TicketTypeId == ticketTypeId);

            if (ticketType == null)
                throw new Exception("Ticket type not found");

            return new TicketTypeResponseDto
            {
                TicketTypeId = ticketType.TicketTypeId,
                EventId = ticketType.EventId,
                EventTitle = ticketType.Event.Title,
                Name = ticketType.Name,
                Description = ticketType.Description,
                Price = ticketType.Price,
                QuantityAvailable = ticketType.QuantityAvailable,
                QuantitySold = ticketType.QuantitySold,
                QuantityRemaining = ticketType.QuantityAvailable - ticketType.QuantitySold,
                SaleStartDate = ticketType.SaleStartDate,
                SaleEndDate = ticketType.SaleEndDate,
                MinQuantityPerOrder = ticketType.MinQuantityPerOrder,
                MaxQuantityPerOrder = ticketType.MaxQuantityPerOrder,
                IsActive = ticketType.IsActive,
                IsOnSale = IsTicketTypeOnSale(ticketType),
                SortOrder = ticketType.SortOrder,
                // NEW: Smart editing support fields
                IsEventPublished = ticketType.Event.IsPublished,
                EventStatus = ticketType.Event.Status.ToString(),
                CreatedAt = ticketType.CreatedAt,
                UpdatedAt = ticketType.UpdatedAt
            };
        }

        public async Task<OrderSummaryDto> CalculateOrderSummaryAsync(PurchaseTicketsDto purchaseDto)
        {
            var summary = new OrderSummaryDto
            {
                EventId = purchaseDto.EventId,
                Items = purchaseDto.TicketItems,
                Currency = "USD"
            };

            decimal subTotal = 0;

            // Get event details
            var eventEntity = await _context.Events.FindAsync(purchaseDto.EventId);
            if (eventEntity == null)
                throw new Exception("Event not found");

            summary.EventTitle = eventEntity.Title;

            // Calculate subtotal
            foreach (var item in purchaseDto.TicketItems)
            {
                var ticketType = await _context.TicketTypes.FindAsync(item.TicketTypeId);
                if (ticketType == null)
                    throw new Exception($"Ticket type {item.TicketTypeId} not found");

                // Validate quantity available
                if (ticketType.QuantityAvailable - ticketType.QuantitySold < item.Quantity)
                    throw new Exception($"Not enough tickets available for {ticketType.Name}");

                subTotal += ticketType.Price * item.Quantity;
            }

            summary.SubTotal = subTotal;

            // Calculate fees and taxes (customize as needed)
            summary.ServiceFee = subTotal * 0.05m; // 5% service fee
            summary.TaxAmount = subTotal * 0.08m; // 8% tax

            // Apply promo code discount if provided
            summary.DiscountAmount = 0;
            if (!string.IsNullOrEmpty(purchaseDto.PromoCode))
            {
                summary.DiscountAmount = await CalculatePromoCodeDiscountAsync(purchaseDto.PromoCode, subTotal, purchaseDto.EventId);
            }

            summary.TotalAmount = summary.SubTotal + summary.ServiceFee + summary.TaxAmount - summary.DiscountAmount;

            return summary;
        }

        public async Task<OrderResponseDto> PurchaseTicketsAsync(PurchaseTicketsDto purchaseDto, int userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Calculate order summary
                var summary = await CalculateOrderSummaryAsync(purchaseDto);

                // Create order
                var order = new Order
                {
                    UserId = userId,
                    OrderNumber = GenerateOrderNumber(),
                    SubTotal = summary.SubTotal,
                    TaxAmount = summary.TaxAmount,
                    ServiceFee = summary.ServiceFee,
                    TotalAmount = summary.TotalAmount,
                    Currency = summary.Currency,
                    Status = OrderStatus.Completed,
                    CreatedAt = DateTime.UtcNow,
                    CompletedAt = DateTime.UtcNow,
                    BillingEmail = purchaseDto.BillingEmail,
                    BillingFirstName = purchaseDto.BillingFirstName,
                    BillingLastName = purchaseDto.BillingLastName,
                    BillingAddress = purchaseDto.BillingAddress,
                    BillingCity = purchaseDto.BillingCity,
                    BillingState = purchaseDto.BillingState,
                    BillingZipCode = purchaseDto.BillingZipCode,
                    PromoCode = purchaseDto.PromoCode,
                    DiscountAmount = summary.DiscountAmount
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                // Create tickets
                var tickets = new List<Ticket>();
                int attendeeIndex = 0;

                foreach (var item in purchaseDto.TicketItems)
                {
                    var ticketType = await _context.TicketTypes.FindAsync(item.TicketTypeId);

                    for (int i = 0; i < item.Quantity; i++)
                    {
                        var attendee = attendeeIndex < purchaseDto.Attendees.Count
                            ? purchaseDto.Attendees[attendeeIndex]
                            : null;

                        var ticketNumber = _qrCodeService.GenerateTicketNumber();
                        var qrCode = _qrCodeService.GenerateQrCodeData(ticketNumber, purchaseDto.EventId, summary.EventTitle);

                        // ENHANCED: Calculate actual price paid per ticket (considering discounts)
                        var basePricePerTicket = ticketType.Price;
                        var totalTickets = purchaseDto.TicketItems.Sum(ti => ti.Quantity);
                        var discountPerTicket = totalTickets > 0 ? summary.DiscountAmount / totalTickets : 0;
                        var actualPricePaid = basePricePerTicket - discountPerTicket;

                        var ticket = new Ticket
                        {
                            EventId = purchaseDto.EventId,
                            TicketTypeId = item.TicketTypeId,
                            OrderId = order.OrderId,
                            UserId = userId,
                            TicketNumber = ticketNumber,
                            QrCode = qrCode,
                            PricePaid = actualPricePaid, // This reflects the actual amount paid after discounts
                            Status = TicketStatus.Valid,
                            PurchaseDate = DateTime.UtcNow,
                            AttendeeFirstName = attendee?.FirstName ?? purchaseDto.BillingFirstName,
                            AttendeeLastName = attendee?.LastName ?? purchaseDto.BillingLastName,
                            AttendeeEmail = attendee?.Email ?? purchaseDto.BillingEmail
                        };

                        tickets.Add(ticket);
                        attendeeIndex++;
                    }

                    // Update ticket type sold quantity
                    ticketType.QuantitySold += item.Quantity;
                }

                _context.Tickets.AddRange(tickets);
                await _context.SaveChangesAsync();

                if (!string.IsNullOrEmpty(purchaseDto.PromoCode) && summary.DiscountAmount > 0)
                {
                    try
                    {
                        // Find the promo code using the SAME context
                        var promoCode = await _context.PromoCodes
                            .FirstOrDefaultAsync(pc => pc.Code.ToUpper() == purchaseDto.PromoCode.ToUpper());

                        if (promoCode == null)
                        {
                            throw new Exception("Promo code not found during usage recording");
                        }

                        // Create usage record
                        var usage = new PromoCodeUsage
                        {
                            PromoCodeId = promoCode.PromoCodeId,
                            OrderId = order.OrderId,
                            UserId = userId,
                            EventId = purchaseDto.EventId,
                            DiscountAmount = summary.DiscountAmount,
                            OrderSubtotal = summary.SubTotal,
                            UsedAt = DateTime.UtcNow
                        };

                        _context.PromoCodeUsages.Add(usage);

                        // Update usage count - FIXED: Check if property exists
                        if (promoCode.GetType().GetProperty("CurrentUsageCount") != null)
                        {
                            var currentUsageProperty = promoCode.GetType().GetProperty("CurrentUsageCount");
                            var currentUsage = (int)(currentUsageProperty.GetValue(promoCode) ?? 0);
                            currentUsageProperty.SetValue(promoCode, currentUsage + 1);
                        }

                        // Save changes within the same transaction
                        await _context.SaveChangesAsync();

                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error handling promo code: {ex.Message}");
                        // Don't throw - continue with transaction
                    }
                }

                // Commit the transaction (includes order, tickets, AND promo code usage)
                await transaction.CommitAsync();
                Console.WriteLine($"🏷️ ✅ Transaction committed successfully");

                // Return order details
                return await GetOrderByIdAsync(order.OrderId, userId);
            }
            catch
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"🏷️ ❌ Transaction rolled back");
                throw;
            }
        }

        public async Task<List<OrderResponseDto>> GetUserOrdersAsync(int userId)
        {
            var orders = await _context.Orders
                .Include(o => o.Tickets)
                    .ThenInclude(t => t.Event)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return orders.Select(MapToOrderResponseDto).ToList();
        }

        public async Task<OrderResponseDto> GetOrderByIdAsync(int orderId, int userId)
        {
            var order = await _context.Orders
                .Include(o => o.Tickets)
                    .ThenInclude(t => t.Event)
                .Include(o => o.Tickets)
                    .ThenInclude(t => t.TicketType)
                .FirstOrDefaultAsync(o => o.OrderId == orderId && o.UserId == userId);

            if (order == null)
                throw new Exception("Order not found");

            return MapToOrderResponseDto(order);
        }

        public async Task<List<TicketResponseDto>> GetUserTicketsAsync(int userId)
        {
            var tickets = await _context.Tickets
                .Include(t => t.Event)
                    .ThenInclude(e => e.Venue)
                .Include(t => t.TicketType)
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.PurchaseDate)
                .ToListAsync();

            return tickets.Select(MapToTicketResponseDto).ToList();
        }

        public async Task<TicketResponseDto> GetTicketByIdAsync(int ticketId, int userId)
        {
            var ticket = await _context.Tickets
                .Include(t => t.Event)
                    .ThenInclude(e => e.Venue)
                .Include(t => t.TicketType)
                .FirstOrDefaultAsync(t => t.TicketId == ticketId && t.UserId == userId);

            if (ticket == null)
                throw new Exception("Ticket not found");

            return MapToTicketResponseDto(ticket);
        }

        public async Task<TicketValidationDto> ValidateTicketAsync(string ticketNumber)
        {
            var ticket = await _context.Tickets
                .Include(t => t.Event)
                .FirstOrDefaultAsync(t => t.TicketNumber == ticketNumber);

            if (ticket == null)
            {
                return new TicketValidationDto
                {
                    IsValid = false,
                    Message = "Ticket not found"
                };
            }

            if (ticket.Status == TicketStatus.Used)
            {
                return new TicketValidationDto
                {
                    IsValid = false,
                    Message = "Ticket has already been used",
                    Ticket = MapToTicketResponseDto(ticket)
                };
            }

            if (ticket.Status != TicketStatus.Valid)
            {
                return new TicketValidationDto
                {
                    IsValid = false,
                    Message = $"Ticket status is {ticket.Status}",
                    Ticket = MapToTicketResponseDto(ticket)
                };
            }

            return new TicketValidationDto
            {
                IsValid = true,
                Message = "Ticket is valid",
                Ticket = MapToTicketResponseDto(ticket)
            };
        }

        public async Task<TicketResponseDto> CheckInTicketAsync(CheckInTicketDto checkInDto, int organizerId)
        {
            var ticket = await _context.Tickets
                .Include(t => t.Event)
                    .ThenInclude(e => e.Venue)
                .Include(t => t.TicketType)
                .FirstOrDefaultAsync(t => t.TicketNumber == checkInDto.TicketNumber);

            if (ticket == null)
                throw new Exception("Ticket not found");

            // Verify organizer owns the event
            if (ticket.Event.OrganizerId != organizerId)
                throw new Exception("You can only check in tickets for your own events");

            if (ticket.Status == TicketStatus.Used)
                throw new Exception("Ticket has already been checked in");

            if (ticket.Status != TicketStatus.Valid)
                throw new Exception($"Ticket is not valid. Status: {ticket.Status}");


            ticket.Status = TicketStatus.Used;
            ticket.CheckInDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToTicketResponseDto(ticket);
        }


        private bool IsTicketTypeOnSale(TicketType ticketType)
        {
            var now = DateTime.UtcNow;

            if (ticketType.SaleStartDate.HasValue && now < ticketType.SaleStartDate.Value)
                return false;

            if (ticketType.SaleEndDate.HasValue && now > ticketType.SaleEndDate.Value)
                return false;

            return ticketType.IsActive && (ticketType.QuantityAvailable - ticketType.QuantitySold) > 0;
        }

        private async Task<decimal> CalculatePromoCodeDiscountAsync(string promoCode, decimal subTotal, int eventId)
        {
            if (string.IsNullOrEmpty(promoCode))
                return 0;

            try
            {
                var promoCodeService = new PromoCodeService(_context);
                var userId = 0;
                return await promoCodeService.CalculateDiscountAsync(promoCode, eventId, subTotal, userId);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error calculating promo code discount: {ex.Message}");
                return 0; // Return 0 discount if there's an error
            }
        }

        private string GenerateOrderNumber()
        {
            var prefix = "ORD";
            var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
            var random = new Random().Next(1000, 9999);

            return $"{prefix}-{timestamp}-{random}";
        }

        private OrderResponseDto MapToOrderResponseDto(Order order)
        {
            return new OrderResponseDto
            {
                OrderId = order.OrderId,
                OrderNumber = order.OrderNumber,
                UserId = order.UserId,
                EventId = order.Tickets.First().EventId,
                EventTitle = order.Tickets.First().Event.Title,
                SubTotal = order.SubTotal,
                TaxAmount = order.TaxAmount,
                ServiceFee = order.ServiceFee,
                TotalAmount = order.TotalAmount,
                Currency = order.Currency,
                Status = order.Status.ToString(),
                CreatedAt = order.CreatedAt,
                CompletedAt = order.CompletedAt,
                BillingEmail = order.BillingEmail,
                BillingFirstName = order.BillingFirstName,
                BillingLastName = order.BillingLastName,
                PromoCode = order.PromoCode,
                DiscountAmount = order.DiscountAmount,
                Tickets = order.Tickets.Select(MapToTicketResponseDto).ToList()
            };
        }

        private TicketResponseDto MapToTicketResponseDto(Ticket ticket)
        {
            return new TicketResponseDto
            {
                TicketId = ticket.TicketId,
                EventId = ticket.EventId,
                EventTitle = ticket.Event?.Title ?? "",
                TicketTypeId = ticket.TicketTypeId,
                TicketTypeName = ticket.TicketType?.Name ?? "",
                TicketNumber = ticket.TicketNumber,
                QrCode = ticket.QrCode,
                PricePaid = ticket.PricePaid,
                Currency = ticket.Event?.Currency ?? "USD",
                Status = ticket.Status.ToString(),
                PurchaseDate = ticket.PurchaseDate,
                CheckInDate = ticket.CheckInDate,
                AttendeeFirstName = ticket.AttendeeFirstName,
                AttendeeLastName = ticket.AttendeeLastName,
                AttendeeEmail = ticket.AttendeeEmail,
                EventStartDateTime = ticket.Event?.StartDateTime.ToString("yyyy-MM-ddTHH:mm:ss") ?? "",
                VenueName = ticket.Event?.Venue?.Name ?? "",
                VenueAddress = ticket.Event?.Venue?.Address ?? ""
            };
        }

        // Implement remaining interface methods...
        public async Task<TicketTypeResponseDto> UpdateTicketTypeAsync(int ticketTypeId, UpdateTicketTypeDto updateTicketTypeDto, int organizerId)
        {
            // Fetch the ticket type with related event data
            var ticketType = await _context.TicketTypes
                .Include(tt => tt.Event)
                .FirstOrDefaultAsync(tt => tt.TicketTypeId == ticketTypeId);

            if (ticketType == null)
                throw new Exception("Ticket type not found");

            // Verify the organizer owns the event
            if (ticketType.Event.OrganizerId != organizerId)
                throw new Exception("You can only modify ticket types for your own events");

            // Business rule: Check if event is published
            if (ticketType.Event.IsPublished)
                throw new Exception("Cannot modify ticket types for published events. Ticket types are locked to preserve existing sales data.");

            // Business rule: Check if any tickets have been sold
            if (ticketType.QuantitySold > 0)
                throw new Exception($"Cannot modify ticket type. {ticketType.QuantitySold} ticket(s) have already been sold. Editing is locked to preserve purchase data.");

            // Business rule: Check if event is in draft status
            if (ticketType.Event.Status != EventStatus.Draft)
                throw new Exception("Ticket types can only be modified when the event is in DRAFT status");

            // Apply updates only if values are provided (partial update)
            if (!string.IsNullOrEmpty(updateTicketTypeDto.Name))
                ticketType.Name = updateTicketTypeDto.Name;

            if (updateTicketTypeDto.Description != null)
                ticketType.Description = updateTicketTypeDto.Description;

            if (updateTicketTypeDto.Price.HasValue)
                ticketType.Price = updateTicketTypeDto.Price.Value;

            if (updateTicketTypeDto.QuantityAvailable.HasValue)
            {
                if (updateTicketTypeDto.QuantityAvailable.Value < ticketType.QuantitySold)
                    throw new Exception($"New quantity ({updateTicketTypeDto.QuantityAvailable.Value}) cannot be less than tickets already sold ({ticketType.QuantitySold})");

                ticketType.QuantityAvailable = updateTicketTypeDto.QuantityAvailable.Value;
            }

            if (updateTicketTypeDto.SaleStartDate.HasValue)
                ticketType.SaleStartDate = updateTicketTypeDto.SaleStartDate;

            if (updateTicketTypeDto.SaleEndDate.HasValue)
                ticketType.SaleEndDate = updateTicketTypeDto.SaleEndDate;

            if (updateTicketTypeDto.MinQuantityPerOrder.HasValue)
                ticketType.MinQuantityPerOrder = updateTicketTypeDto.MinQuantityPerOrder.Value;

            if (updateTicketTypeDto.MaxQuantityPerOrder.HasValue)
                ticketType.MaxQuantityPerOrder = updateTicketTypeDto.MaxQuantityPerOrder.Value;

            if (updateTicketTypeDto.SortOrder.HasValue)
                ticketType.SortOrder = updateTicketTypeDto.SortOrder.Value;

            if (updateTicketTypeDto.IsActive.HasValue)
                ticketType.IsActive = updateTicketTypeDto.IsActive.Value;

            ticketType.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return await GetTicketTypeByIdAsync(ticketTypeId);
        }

        public async Task<bool> DeleteTicketTypeAsync(int ticketTypeId, int organizerId)
        {
            var ticketType = await _context.TicketTypes
                .Include(tt => tt.Event)
                .FirstOrDefaultAsync(tt => tt.TicketTypeId == ticketTypeId);

            if (ticketType == null)
                return false;

            if (ticketType.Event.OrganizerId != organizerId)
                throw new Exception("You can only delete ticket types for your own events");

            if (ticketType.QuantitySold > 0)
            {
                ticketType.IsActive = false;
            }
            else
            {
                _context.TicketTypes.Remove(ticketType);
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<OrderResponseDto>> GetEventOrdersAsync(int eventId, int organizerId)
        {
            var eventEntity = await _context.Events.FindAsync(eventId);
            if (eventEntity == null)
                throw new Exception("Event not found");

            if (eventEntity.OrganizerId != organizerId)
                throw new Exception("You can only view orders for your own events");

            var orders = await _context.Orders
                .Include(o => o.Tickets)
                    .ThenInclude(t => t.Event)
                .Include(o => o.Tickets)
                    .ThenInclude(t => t.TicketType)
                .Where(o => o.Tickets.Any(t => t.EventId == eventId))
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return orders.Select(MapToOrderResponseDto).ToList();
        }

        public async Task<List<TicketResponseDto>> GetEventTicketsAsync(int eventId, int organizerId)
        {
            var eventEntity = await _context.Events.FindAsync(eventId);
            if (eventEntity == null)
                throw new Exception("Event not found");

            if (eventEntity.OrganizerId != organizerId)
                throw new Exception("You can only view tickets for your own events");

            var tickets = await _context.Tickets
                .Include(t => t.Event)
                    .ThenInclude(e => e.Venue)
                .Include(t => t.TicketType)
                .Where(t => t.EventId == eventId)
                .OrderByDescending(t => t.PurchaseDate)
                .ToListAsync();

            return tickets.Select(MapToTicketResponseDto).ToList();
        }

        public async Task<List<TicketResponseDto>> GetCheckedInTicketsAsync(int eventId, int organizerId)
        {
            var eventEntity = await _context.Events.FindAsync(eventId);
            if (eventEntity == null)
                throw new Exception("Event not found");

            if (eventEntity.OrganizerId != organizerId)
                throw new Exception("You can only view tickets for your own events");

            var tickets = await _context.Tickets
                .Include(t => t.Event)
                    .ThenInclude(e => e.Venue)
                .Include(t => t.TicketType)
                .Where(t => t.EventId == eventId && t.Status == TicketStatus.Used)
                .OrderByDescending(t => t.CheckInDate)
                .ToListAsync();

            return tickets.Select(MapToTicketResponseDto).ToList();
        }

        public async Task<object> GetTicketSalesAnalyticsAsync(int eventId, int organizerId)
        {
            var eventEntity = await _context.Events.FindAsync(eventId);
            if (eventEntity == null)
                throw new Exception("Event not found");

            if (eventEntity.OrganizerId != organizerId)
                throw new Exception("You can only view analytics for your own events");

            var ticketTypes = await _context.TicketTypes
                .Where(tt => tt.EventId == eventId)
                .ToListAsync();

            var orders = await _context.Orders
                .Include(o => o.Tickets)
                .Where(o => o.Tickets.Any(t => t.EventId == eventId))
                .ToListAsync();

            var tickets = await _context.Tickets
                .Where(t => t.EventId == eventId)
                .ToListAsync();

            return new
            {
                EventId = eventId,
                EventTitle = eventEntity.Title,
                TotalTicketTypes = ticketTypes.Count,
                TotalTicketsAvailable = ticketTypes.Sum(tt => tt.QuantityAvailable),
                TotalTicketsSold = ticketTypes.Sum(tt => tt.QuantitySold),
                TotalRevenue = orders.Sum(o => o.TotalAmount),
                TotalOrders = orders.Count,
                CheckedInTickets = tickets.Count(t => t.Status == TicketStatus.Used),
                TicketTypeBreakdown = ticketTypes.Select(tt => new
                {
                    TicketTypeName = tt.Name,
                    Price = tt.Price,
                    Available = tt.QuantityAvailable,
                    Sold = tt.QuantitySold,
                    Revenue = tt.QuantitySold * tt.Price
                }),
                SalesByDay = orders.GroupBy(o => o.CreatedAt.Date)
                    .Select(g => new
                    {
                        Date = g.Key,
                        Orders = g.Count(),
                        Revenue = g.Sum(o => o.TotalAmount),
                        TicketsSold = g.Sum(o => o.Tickets.Count())
                    })
                    .OrderBy(x => x.Date)
            };
        }
    }
}