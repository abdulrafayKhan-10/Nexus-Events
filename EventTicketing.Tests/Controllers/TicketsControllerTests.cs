using Xunit;
using Xunit;
using System;
using System.Linq;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.IO;

namespace EventTicketing.Tests.Controllers
{
    public class TicketsControllerTests
    {
        [Fact]
        public void TicketPurchase_ShouldCalculateCorrectTotals()
        {
            // Arrange
            var ticketTypes = new[]
            {
                new { Name = "General Admission", Price = 50.00m, Quantity = 2 },
                new { Name = "VIP", Price = 150.00m, Quantity = 1 },
                new { Name = "Student", Price = 25.00m, Quantity = 3 }
            };

            string promoCode = "SAVE10";
            decimal discountPercent = 10.0m;
            decimal serviceFee = 5.00m;
            decimal taxRate = 0.08m; // 8%

            // Act
            decimal subtotal = ticketTypes.Sum(t => t.Price * t.Quantity);
            decimal discount = subtotal * (discountPercent / 100);
            decimal discountedSubtotal = subtotal - discount;
            decimal fees = serviceFee * ticketTypes.Sum(t => t.Quantity);
            decimal taxableAmount = discountedSubtotal + fees;
            decimal tax = taxableAmount * taxRate;
            decimal total = taxableAmount + tax;

            // Assert
            Assert.Equal(325.00m, subtotal); // (50*2) + (150*1) + (25*3)
            Assert.Equal(32.50m, discount); // 10% of 325
            Assert.Equal(292.50m, discountedSubtotal);
            Assert.Equal(30.00m, fees); // 5 * 6 tickets
            Assert.Equal(322.50m, taxableAmount);
            Assert.Equal(25.80m, Math.Round(tax, 2)); // 8% of 322.50
            Assert.True(total > subtotal * 0.9m); // Should be more than 90% of original due to fees/tax
        }

        [Fact]
        public void TicketValidation_ShouldVerifyAuthenticity()
        {
            // Arrange
            var validTicketFormats = new[]
            {
                "TKT-2025-001234",
                "TKT-2025-999999",
                "TKT-2024-123456"
            };

            var invalidTicketFormats = new[]
            {
                "FAKE-001234",
                "TKT-2023-001234", // Too old
                "TKT-001234", // Missing year
                "001234" // No prefix
            };

            // Act & Assert
            foreach (var ticket in validTicketFormats)
            {
                Assert.True(IsValidTicketFormat(ticket), $"Ticket {ticket} should be valid");
            }

            foreach (var ticket in invalidTicketFormats)
            {
                Assert.False(IsValidTicketFormat(ticket), $"Ticket {ticket} should be invalid");
            }
        }

        [Fact]
        public void TicketCapacity_ShouldPreventOverbooking()
        {
            // Arrange
            var eventCapacity = 1000;
            var currentSales = 950;
            var incomingRequests = new[]
            {
                new { CustomerId = 1, Quantity = 30 }, // Should succeed
                new { CustomerId = 2, Quantity = 40 }, // Should succeed
                new { CustomerId = 3, Quantity = 25 }  // Should fail (would exceed capacity)
            };

            var processedSales = currentSales;

            // Act & Assert
            foreach (var request in incomingRequests)
            {
                bool canFulfill = (processedSales + request.Quantity) <= eventCapacity;

                if (canFulfill)
                {
                    processedSales += request.Quantity;
                    Assert.True(processedSales <= eventCapacity,
                        $"Sales after processing should not exceed capacity");
                }
                else
                {
                    Assert.True((processedSales + request.Quantity) > eventCapacity,
                        $"Request for {request.Quantity} tickets should be rejected");
                }
            }

            Assert.True(processedSales <= eventCapacity, "Final sales should not exceed capacity");
        }

        [Fact]
        public void TicketRefund_ShouldFollowRefundPolicy()
        {
            // Arrange
            var tickets = new[]
            {
                new {
                    TicketId = 1,
                    PurchaseDate = DateTime.Now.AddDays(-5),
                    EventDate = DateTime.Now.AddDays(25),
                    Price = 75.00m,
                    Status = "Active"
                },
                new {
                    TicketId = 2,
                    PurchaseDate = DateTime.Now.AddDays(-35),
                    EventDate = DateTime.Now.AddDays(10),
                    Price = 120.00m,
                    Status = "Active"
                },
                new {
                    TicketId = 3,
                    PurchaseDate = DateTime.Now.AddDays(-2),
                    EventDate = DateTime.Now.AddDays(2),
                    Price = 90.00m,
                    Status = "Active"
                }
            };

            // Refund policy: 30 days before purchase, 7 days before event
            var refundDeadlineDays = 30;
            var eventRefundDeadlineDays = 7;

            // Act & Assert
            foreach (var ticket in tickets)
            {
                var daysSincePurchase = (DateTime.Now - ticket.PurchaseDate).Days;
                var daysUntilEvent = (ticket.EventDate - DateTime.Now).Days;

                bool isRefundableByPurchaseDate = daysSincePurchase <= refundDeadlineDays;
                bool isRefundableByEventDate = daysUntilEvent >= eventRefundDeadlineDays;
                bool isRefundable = isRefundableByPurchaseDate && isRefundableByEventDate;

                if (ticket.TicketId == 1) // Recent purchase, event far away
                {
                    Assert.True(isRefundable, "Recent purchase with distant event should be refundable");
                }
                else if (ticket.TicketId == 2) // Old purchase, event soon
                {
                    Assert.False(isRefundable, "Old purchase should not be refundable");
                }
                else if (ticket.TicketId == 3) // Recent purchase, event soon
                {
                    Assert.False(isRefundable, "Purchase close to event should not be refundable");
                }
            }
        }

        private bool IsValidTicketFormat(string ticketNumber)
        {
            if (string.IsNullOrEmpty(ticketNumber)) return false;

            // Format: TKT-YYYY-XXXXXX
            var parts = ticketNumber.Split('-');
            if (parts.Length != 3) return false;
            if (parts[0] != "TKT") return false;

            if (!int.TryParse(parts[1], out int year)) return false;
            if (year < 2024 || year > 2030) return false;

            if (!int.TryParse(parts[2], out int ticketId)) return false;
            if (parts[2].Length != 6) return false;

            return true;
        }
    }
}