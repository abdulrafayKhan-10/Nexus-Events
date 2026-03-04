using EventTicketing.API.Data;
using EventTicketing.API.Models.DTOs;
using EventTicketing.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace EventTicketing.API.Services
{
    public class PromoCodeService : IPromoCodeService
    {
        private readonly ApplicationDbContext _context;

        public PromoCodeService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PromoCodeResponseDto> CreatePromoCodeAsync(CreatePromoCodeDto createDto, int organizerId)
        {
            var organizer = await _context.Users
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.UserId == organizerId);

            if (organizer == null || !organizer.UserRoles.Any(ur => ur.Role == RoleType.Organizer && ur.IsActive))
                throw new UnauthorizedAccessException("Only organizers can create promo codes");

            var existingCode = await _context.PromoCodes
                .FirstOrDefaultAsync(pc => pc.Code.ToLower() == createDto.Code.ToLower());

            if (existingCode != null)
                throw new Exception($"Promo code '{createDto.Code}' already exists. Please choose a different code.");

            if (createDto.Scope == PromoCodeScope.EventSpecific)
            {
                if (!createDto.EventId.HasValue)
                    throw new Exception("Event ID is required for event-specific promo codes");

                var eventEntity = await _context.Events.FindAsync(createDto.EventId.Value);
                if (eventEntity == null)
                    throw new Exception("Event not found");

                if (eventEntity.OrganizerId != organizerId)
                    throw new Exception("You can only create promo codes for your own events");
            }

            if (createDto.StartDate >= createDto.EndDate)
                throw new Exception("End date must be after start date");

            if (createDto.StartDate < DateTime.UtcNow.Date)
                throw new Exception("Start date cannot be in the past");

            if (createDto.Type == PromoCodeType.Percentage && (createDto.Value <= 0 || createDto.Value > 100))
                throw new Exception("Percentage value must be between 0.01 and 100");

            var promoCode = new PromoCode
            {
                Code = createDto.Code.ToUpper(),
                Description = createDto.Description,
                Type = createDto.Type,
                Value = createDto.Value,
                MinimumOrderAmount = createDto.MinimumOrderAmount,
                MaximumDiscountAmount = createDto.MaximumDiscountAmount,
                Scope = createDto.Scope,
                OrganizerId = organizerId,
                EventId = createDto.Scope == PromoCodeScope.EventSpecific ? createDto.EventId : null,
                StartDate = createDto.StartDate,
                EndDate = createDto.EndDate,
                MaxUsageCount = createDto.MaxUsageCount,
                MaxUsagePerUser = createDto.MaxUsagePerUser,
                CreatedAt = DateTime.UtcNow
            };

            _context.PromoCodes.Add(promoCode);
            await _context.SaveChangesAsync();

            return await GetPromoCodeByIdAsync(promoCode.PromoCodeId, organizerId);
        }

        public async Task<PromoCodeValidationDto> ValidatePromoCodeAsync(string code, int eventId, decimal orderSubtotal, int userId)
        {
            var promoCode = await _context.PromoCodes
                .Include(pc => pc.Organizer)
                .Include(pc => pc.Event)
                .Include(pc => pc.PromoCodeUsages)
                .FirstOrDefaultAsync(pc => pc.Code.ToUpper() == code.ToUpper());

            if (promoCode == null)
            {
                return new PromoCodeValidationDto
                {
                    IsValid = false,
                    Message = "Promo code not found"
                };
            }

            if (!promoCode.IsActive || promoCode.Status != PromoCodeStatus.Active)
            {
                return new PromoCodeValidationDto
                {
                    IsValid = false,
                    Message = "This promo code is no longer active"
                };
            }

            var now = DateTime.UtcNow;
            if (now < promoCode.StartDate)
            {
                return new PromoCodeValidationDto
                {
                    IsValid = false,
                    Message = $"This promo code will be valid from {promoCode.StartDate:MMM dd, yyyy}"
                };
            }

            if (now > promoCode.EndDate)
            {
                return new PromoCodeValidationDto
                {
                    IsValid = false,
                    Message = "This promo code has expired"
                };
            }

            if (promoCode.CurrentUsageCount >= promoCode.MaxUsageCount)
            {
                return new PromoCodeValidationDto
                {
                    IsValid = false,
                    Message = "This promo code has reached its usage limit"
                };
            }

            if (promoCode.MaxUsagePerUser.HasValue && userId > 0)
            {
                var userUsageCount = promoCode.PromoCodeUsages.Count(u => u.UserId == userId);
                if (userUsageCount >= promoCode.MaxUsagePerUser.Value)
                {
                    return new PromoCodeValidationDto
                    {
                        IsValid = false,
                        Message = "You have already used this promo code the maximum number of times"
                    };
                }
            }

            if (promoCode.MinimumOrderAmount.HasValue && orderSubtotal < promoCode.MinimumOrderAmount.Value)
            {
                return new PromoCodeValidationDto
                {
                    IsValid = false,
                    Message = $"Minimum order amount of ${promoCode.MinimumOrderAmount.Value:F2} required"
                };
            }

            var eventEntity = await _context.Events.FindAsync(eventId);
            if (eventEntity == null)
            {
                return new PromoCodeValidationDto
                {
                    IsValid = false,
                    Message = "Invalid event"
                };
            }

            switch (promoCode.Scope)
            {
                case PromoCodeScope.EventSpecific:
                    if (promoCode.EventId != eventId)
                    {
                        return new PromoCodeValidationDto
                        {
                            IsValid = false,
                            Message = "This promo code is not valid for this event"
                        };
                    }
                    break;

                case PromoCodeScope.OrganizerWide:
                    if (promoCode.OrganizerId != eventEntity.OrganizerId)
                    {
                        return new PromoCodeValidationDto
                        {
                            IsValid = false,
                            Message = "This promo code is not valid for events by this organizer"
                        };
                    }
                    break;
            }

            var discountAmount = CalculateDiscount(promoCode, orderSubtotal);

            return new PromoCodeValidationDto
            {
                IsValid = true,
                Message = "Promo code applied successfully!",
                DiscountAmount = discountAmount,
                FormattedDiscount = $"${discountAmount:F2}",
                PromoCode = MapToResponseDto(promoCode)
            };
        }

        public async Task<decimal> CalculateDiscountAsync(string code, int eventId, decimal orderSubtotal, int userId)
        {
            var validation = await ValidatePromoCodeAsync(code, eventId, orderSubtotal, userId);
            return validation.IsValid ? validation.DiscountAmount : 0;
        }

        private decimal CalculateDiscount(PromoCode promoCode, decimal orderSubtotal)
        {

            decimal discount = 0;

            switch (promoCode.Type)
            {
                case PromoCodeType.Percentage:
                    discount = orderSubtotal * (promoCode.Value / 100m);
                    break;

                case PromoCodeType.FixedAmount:
                    discount = Math.Min(promoCode.Value, orderSubtotal);
                    break;
            }

            // Apply maximum discount limit if specified
            if (promoCode.MaximumDiscountAmount.HasValue)
            {
                decimal originalDiscount = discount;
                discount = Math.Min(discount, promoCode.MaximumDiscountAmount.Value);
            }

            return discount;
        }

        public async Task<PromoCodeUsageResponseDto> RecordPromoCodeUsageAsync(string code, int orderId, int eventId, decimal discountAmount, decimal orderSubtotal, int userId)
        {
            var promoCode = await _context.PromoCodes
                .FirstOrDefaultAsync(pc => pc.Code.ToUpper() == code.ToUpper());

            if (promoCode == null)
                throw new Exception("Promo code not found");

            // Record usage
            var usage = new PromoCodeUsage
            {
                PromoCodeId = promoCode.PromoCodeId,
                OrderId = orderId,
                UserId = userId,
                EventId = eventId,
                DiscountAmount = discountAmount,
                OrderSubtotal = orderSubtotal,
                UsedAt = DateTime.UtcNow
            };

            _context.PromoCodeUsages.Add(usage);

            // Update usage count
            promoCode.CurrentUsageCount++;

            await _context.SaveChangesAsync();

            return await GetUsageByIdAsync(usage.PromoCodeUsageId);
        }

        public async Task<List<PromoCodeResponseDto>> GetOrganizerPromoCodesAsync(int organizerId)
        {
            var promoCodes = await _context.PromoCodes
                .Include(pc => pc.Event)
                .Where(pc => pc.OrganizerId == organizerId)
                .OrderByDescending(pc => pc.CreatedAt)
                .ToListAsync();

            return promoCodes.Select(MapToResponseDto).ToList();
        }

        public async Task<List<PromoCodeResponseDto>> GetEventPromoCodesAsync(int eventId, int organizerId)
        {
            // Verify organizer owns the event
            var eventEntity = await _context.Events.FindAsync(eventId);
            if (eventEntity == null || eventEntity.OrganizerId != organizerId)
                throw new Exception("Event not found or access denied");

            var promoCodes = await _context.PromoCodes
                .Include(pc => pc.Event)
                .Where(pc => pc.OrganizerId == organizerId &&
                           (pc.EventId == eventId || pc.Scope == PromoCodeScope.OrganizerWide))
                .OrderByDescending(pc => pc.CreatedAt)
                .ToListAsync();

            return promoCodes.Select(MapToResponseDto).ToList();
        }

        public async Task<PromoCodeResponseDto> GetPromoCodeByIdAsync(int promoCodeId, int organizerId)
        {
            var promoCode = await _context.PromoCodes
                .Include(pc => pc.Event)
                .Include(pc => pc.Organizer)
                .FirstOrDefaultAsync(pc => pc.PromoCodeId == promoCodeId && pc.OrganizerId == organizerId);

            if (promoCode == null)
                throw new Exception("Promo code not found");

            return MapToResponseDto(promoCode);
        }

        public async Task<PromoCodeResponseDto> UpdatePromoCodeAsync(int promoCodeId, UpdatePromoCodeDto updateDto, int organizerId)
        {
            var promoCode = await _context.PromoCodes
                .FirstOrDefaultAsync(pc => pc.PromoCodeId == promoCodeId && pc.OrganizerId == organizerId);

            if (promoCode == null)
                throw new Exception("Promo code not found");

            if (promoCode.CurrentUsageCount > 0)
                throw new Exception("Cannot modify promo code that has already been used");

            if (updateDto.Description != null)
                promoCode.Description = updateDto.Description;

            if (updateDto.Type.HasValue)
                promoCode.Type = updateDto.Type.Value;

            if (updateDto.Value.HasValue)
            {
                if (updateDto.Type == PromoCodeType.Percentage && (updateDto.Value <= 0 || updateDto.Value > 100))
                    throw new Exception("Percentage value must be between 0.01 and 100");
                promoCode.Value = updateDto.Value.Value;
            }

            if (updateDto.MinimumOrderAmount.HasValue)
                promoCode.MinimumOrderAmount = updateDto.MinimumOrderAmount;

            if (updateDto.MaximumDiscountAmount.HasValue)
                promoCode.MaximumDiscountAmount = updateDto.MaximumDiscountAmount;

            if (updateDto.StartDate.HasValue)
            {
                if (updateDto.StartDate < DateTime.UtcNow.Date)
                    throw new Exception("Start date cannot be in the past");
                promoCode.StartDate = updateDto.StartDate.Value;
            }

            if (updateDto.EndDate.HasValue)
                promoCode.EndDate = updateDto.EndDate.Value;

            if (updateDto.MaxUsageCount.HasValue)
                promoCode.MaxUsageCount = updateDto.MaxUsageCount.Value;

            if (updateDto.MaxUsagePerUser.HasValue)
                promoCode.MaxUsagePerUser = updateDto.MaxUsagePerUser;

            if (updateDto.Status.HasValue)
                promoCode.Status = updateDto.Status.Value;

            if (updateDto.IsActive.HasValue)
                promoCode.IsActive = updateDto.IsActive.Value;

            // Validate date range if either date was updated
            if (promoCode.StartDate >= promoCode.EndDate)
                throw new Exception("End date must be after start date");

            promoCode.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return await GetPromoCodeByIdAsync(promoCodeId, organizerId);
        }

        public async Task<bool> DeletePromoCodeAsync(int promoCodeId, int organizerId)
        {
            var promoCode = await _context.PromoCodes
                .Include(pc => pc.PromoCodeUsages)
                .FirstOrDefaultAsync(pc => pc.PromoCodeId == promoCodeId && pc.OrganizerId == organizerId);

            if (promoCode == null)
                return false;

            // If promo code has been used, deactivate instead of delete
            if (promoCode.PromoCodeUsages.Any())
            {
                promoCode.IsActive = false;
                promoCode.Status = PromoCodeStatus.Inactive;
                promoCode.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                _context.PromoCodes.Remove(promoCode);
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<object> GetPromoCodeAnalyticsAsync(int promoCodeId, int organizerId)
        {
            var promoCode = await _context.PromoCodes
                .Include(pc => pc.PromoCodeUsages)
                    .ThenInclude(u => u.Order)
                .Include(pc => pc.PromoCodeUsages)
                    .ThenInclude(u => u.Event)
                .FirstOrDefaultAsync(pc => pc.PromoCodeId == promoCodeId && pc.OrganizerId == organizerId);

            if (promoCode == null)
                throw new Exception("Promo code not found");

            return new
            {
                PromoCodeId = promoCode.PromoCodeId,
                Code = promoCode.Code,
                TotalUsages = promoCode.CurrentUsageCount,
                MaxUsages = promoCode.MaxUsageCount,
                RemainingUsages = promoCode.MaxUsageCount - promoCode.CurrentUsageCount,
                TotalDiscountGiven = promoCode.PromoCodeUsages.Sum(u => u.DiscountAmount),
                AverageDiscountAmount = promoCode.PromoCodeUsages.Any()
                    ? promoCode.PromoCodeUsages.Average(u => u.DiscountAmount)
                    : 0,
                TotalOrderValue = promoCode.PromoCodeUsages.Sum(u => u.OrderSubtotal),
                ConversionRate = promoCode.MaxUsageCount > 0
                    ? (decimal)promoCode.CurrentUsageCount / promoCode.MaxUsageCount * 100
                    : 0,
                UsageByDay = promoCode.PromoCodeUsages
                    .GroupBy(u => u.UsedAt.Date)
                    .Select(g => new
                    {
                        Date = g.Key.ToString("yyyy-MM-dd"),
                        Usages = g.Count(),
                        TotalDiscount = g.Sum(u => u.DiscountAmount),
                        TotalOrderValue = g.Sum(u => u.OrderSubtotal)
                    })
                    .OrderBy(x => x.Date),
                UsageByEvent = promoCode.PromoCodeUsages
                    .GroupBy(u => new { u.Event.EventId, u.Event.Title })
                    .Select(g => new
                    {
                        EventId = g.Key.EventId,
                        EventTitle = g.Key.Title,
                        Usages = g.Count(),
                        TotalDiscount = g.Sum(u => u.DiscountAmount),
                        TotalOrderValue = g.Sum(u => u.OrderSubtotal)
                    })
                    .OrderByDescending(x => x.Usages)
            };
        }

        // Helper methods
        private async Task<PromoCodeUsageResponseDto> GetUsageByIdAsync(int usageId)
        {
            var usage = await _context.PromoCodeUsages
                .Include(u => u.PromoCode)
                .Include(u => u.Order)
                .Include(u => u.User)
                .Include(u => u.Event)
                .FirstOrDefaultAsync(u => u.PromoCodeUsageId == usageId);

            if (usage == null)
                throw new Exception("Usage record not found");

            return new PromoCodeUsageResponseDto
            {
                PromoCodeUsageId = usage.PromoCodeUsageId,
                PromoCode = usage.PromoCode.Code,
                OrderNumber = usage.Order.OrderNumber,
                CustomerName = $"{usage.User.FirstName} {usage.User.LastName}",
                CustomerEmail = usage.User.Email,
                EventTitle = usage.Event.Title,
                DiscountAmount = usage.DiscountAmount,
                OrderSubtotal = usage.OrderSubtotal,
                UsedAt = usage.UsedAt
            };
        }

        private PromoCodeResponseDto MapToResponseDto(PromoCode promoCode)
        {
            var now = DateTime.UtcNow;
            var isValid = promoCode.IsActive &&
                         promoCode.Status == PromoCodeStatus.Active &&
                         now >= promoCode.StartDate &&
                         now <= promoCode.EndDate &&
                         promoCode.CurrentUsageCount < promoCode.MaxUsageCount;

            string? invalidReason = null;
            if (!isValid)
            {
                if (!promoCode.IsActive || promoCode.Status != PromoCodeStatus.Active)
                    invalidReason = "Inactive";
                else if (now < promoCode.StartDate)
                    invalidReason = "Not yet active";
                else if (now > promoCode.EndDate)
                    invalidReason = "Expired";
                else if (promoCode.CurrentUsageCount >= promoCode.MaxUsageCount)
                    invalidReason = "Usage limit reached";
            }

            // FIXED: Use updated enum values (Percentage = 0, FixedAmount = 1)
            var formattedValue = promoCode.Type == PromoCodeType.Percentage
                ? $"{promoCode.Value}% off"
                : $"${promoCode.Value:F2} off";

            return new PromoCodeResponseDto
            {
                PromoCodeId = promoCode.PromoCodeId,
                Code = promoCode.Code,
                Description = promoCode.Description,
                Type = ((int)promoCode.Type).ToString(),
                Value = promoCode.Value,
                FormattedValue = formattedValue, // This should now show "25% off"
                MinimumOrderAmount = promoCode.MinimumOrderAmount,
                MaximumDiscountAmount = promoCode.MaximumDiscountAmount,
                Scope = promoCode.Scope.ToString(),
                OrganizerId = promoCode.OrganizerId,
                OrganizerName = promoCode.Organizer != null ? $"{promoCode.Organizer.FirstName} {promoCode.Organizer.LastName}" : "",
                EventId = promoCode.EventId,
                EventTitle = promoCode.Event?.Title,
                StartDate = promoCode.StartDate,
                EndDate = promoCode.EndDate,
                MaxUsageCount = promoCode.MaxUsageCount,
                CurrentUsageCount = promoCode.CurrentUsageCount,
                RemainingUsage = Math.Max(0, promoCode.MaxUsageCount - promoCode.CurrentUsageCount),
                MaxUsagePerUser = promoCode.MaxUsagePerUser,
                Status = promoCode.Status.ToString(),
                IsActive = promoCode.IsActive,
                IsValid = isValid,
                InvalidReason = invalidReason,
                CreatedAt = promoCode.CreatedAt,
                UpdatedAt = promoCode.UpdatedAt
            };
        }

        public async Task<List<PromoCodeUsageResponseDto>> GetPromoCodeUsageHistoryAsync(int promoCodeId, int organizerId)
        {
            var promoCode = await _context.PromoCodes
                .FirstOrDefaultAsync(pc => pc.PromoCodeId == promoCodeId && pc.OrganizerId == organizerId);

            if (promoCode == null)
                throw new Exception("Promo code not found");

            var usages = await _context.PromoCodeUsages
                .Include(u => u.PromoCode)
                .Include(u => u.Order)
                .Include(u => u.User)
                .Include(u => u.Event)
                .Where(u => u.PromoCodeId == promoCodeId)
                .OrderByDescending(u => u.UsedAt)
                .ToListAsync();

            return usages.Select(u => new PromoCodeUsageResponseDto
            {
                PromoCodeUsageId = u.PromoCodeUsageId,
                PromoCode = u.PromoCode.Code,
                OrderNumber = u.Order.OrderNumber,
                CustomerName = $"{u.User.FirstName} {u.User.LastName}",
                CustomerEmail = u.User.Email,
                EventTitle = u.Event.Title,
                DiscountAmount = u.DiscountAmount,
                OrderSubtotal = u.OrderSubtotal,
                UsedAt = u.UsedAt
            }).ToList();
        }

        public async Task<PromoCodeStatsDto> GetOrganizerPromoCodeStatsAsync(int organizerId)
        {
            var promoCodes = await _context.PromoCodes
                .Include(pc => pc.PromoCodeUsages)
                .Where(pc => pc.OrganizerId == organizerId)
                .ToListAsync();

            var stats = new PromoCodeStatsDto
            {
                TotalPromoCodes = promoCodes.Count,
                ActivePromoCodes = promoCodes.Count(pc => pc.IsActive && pc.Status == PromoCodeStatus.Active),
                TotalUsages = promoCodes.Sum(pc => pc.CurrentUsageCount),
                TotalDiscountGiven = promoCodes.SelectMany(pc => pc.PromoCodeUsages).Sum(u => u.DiscountAmount),
                AverageDiscountAmount = promoCodes.SelectMany(pc => pc.PromoCodeUsages).Any()
                    ? promoCodes.SelectMany(pc => pc.PromoCodeUsages).Average(u => u.DiscountAmount)
                    : 0,
                TopPerformingCodes = promoCodes
                    .Where(pc => pc.CurrentUsageCount > 0)
                    .OrderByDescending(pc => pc.CurrentUsageCount)
                    .Take(5)
                    .Select(pc => new PromoCodePerformanceDto
                    {
                        Code = pc.Code,
                        Usages = pc.CurrentUsageCount,
                        TotalDiscount = pc.PromoCodeUsages.Sum(u => u.DiscountAmount)
                    })
                    .ToList()
            };

            return stats;
        }

        public async Task<List<PromoCodeResponseDto>> GetAllPromoCodesAsync(int adminUserId)
        {
            var admin = await _context.Users
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.UserId == adminUserId);

            if (admin == null || !admin.UserRoles.Any(ur => ur.Role == RoleType.Admin && ur.IsActive))
                throw new UnauthorizedAccessException("Only admins can view all promo codes");

            var promoCodes = await _context.PromoCodes
                .Include(pc => pc.Organizer)
                .Include(pc => pc.Event)
                .OrderByDescending(pc => pc.CreatedAt)
                .ToListAsync();

            return promoCodes.Select(MapToResponseDto).ToList();
        }

        public async Task<object> GetSystemPromoCodeStatsAsync(int adminUserId)
        {
            var admin = await _context.Users
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.UserId == adminUserId);

            if (admin == null || !admin.UserRoles.Any(ur => ur.Role == RoleType.Admin && ur.IsActive))
                throw new UnauthorizedAccessException("Only admins can view system stats");

            var promoCodes = await _context.PromoCodes
                .Include(pc => pc.PromoCodeUsages)
                .Include(pc => pc.Organizer)
                .ToListAsync();

            return new
            {
                TotalPromoCodes = promoCodes.Count,
                ActivePromoCodes = promoCodes.Count(pc => pc.IsActive && pc.Status == PromoCodeStatus.Active),
                TotalUsages = promoCodes.Sum(pc => pc.CurrentUsageCount),
                TotalDiscountGiven = promoCodes.SelectMany(pc => pc.PromoCodeUsages).Sum(u => u.DiscountAmount),
                UniqueOrganizers = promoCodes.Select(pc => pc.OrganizerId).Distinct().Count(),
                TopOrganizersByPromoUsage = promoCodes
                    .GroupBy(pc => new { pc.OrganizerId, pc.Organizer.FirstName, pc.Organizer.LastName })
                    .Select(g => new
                    {
                        OrganizerId = g.Key.OrganizerId,
                        OrganizerName = $"{g.Key.FirstName} {g.Key.LastName}",
                        TotalPromoCodes = g.Count(),
                        TotalUsages = g.Sum(pc => pc.CurrentUsageCount),
                        TotalDiscountGiven = g.SelectMany(pc => pc.PromoCodeUsages).Sum(u => u.DiscountAmount)
                    })
                    .OrderByDescending(x => x.TotalUsages)
                    .Take(10)
            };
        }
    }
}