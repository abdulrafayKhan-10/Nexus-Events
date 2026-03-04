using Xunit;
using Xunit;
using System;
using System.Linq;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.IO;

namespace EventTicketing.Tests.Controllers
{
    public class AnalyticsControllerTests
    {
        [Fact]
        public void RevenueAnalytics_ShouldCalculateCorrectMetrics()
        {
            // Arrange
            var salesData = new[]
            {
                new { EventId = 1, Revenue = 15000m, TicketsSold = 300, Date = DateTime.Now.AddDays(-5) },
                new { EventId = 2, Revenue = 25000m, TicketsSold = 500, Date = DateTime.Now.AddDays(-10) },
                new { EventId = 3, Revenue = 8000m, TicketsSold = 160, Date = DateTime.Now.AddDays(-15) }
            };

            // Act
            var totalRevenue = salesData.Sum(s => s.Revenue);
            var totalTicketsSold = salesData.Sum(s => s.TicketsSold);
            var averageTicketPrice = totalRevenue / totalTicketsSold;
            var averageRevenuePerEvent = totalRevenue / salesData.Length;

            // Assert
            Assert.Equal(48000m, totalRevenue);
            Assert.Equal(960, totalTicketsSold);
            Assert.Equal(50m, averageTicketPrice);
            Assert.Equal(16000m, averageRevenuePerEvent);
        }

        [Fact]
        public void PaymentMethodAnalytics_ShouldTrackDistribution()
        {
            // Arrange
            var payments = new[]
            {
                new { Method = "Credit Card", Amount = 5000m, Count = 100 },
                new { Method = "Debit Card", Amount = 3000m, Count = 75 },
                new { Method = "PayPal", Amount = 2000m, Count = 40 },
                new { Method = "Bank Transfer", Amount = 1000m, Count = 20 }
            };

            var totalAmount = payments.Sum(p => p.Amount);
            var totalTransactions = payments.Sum(p => p.Count);

            // Act & Assert
            foreach (var payment in payments)
            {
                var percentageByAmount = (payment.Amount / totalAmount) * 100;
                var percentageByCount = ((decimal)payment.Count / totalTransactions) * 100;

                if (payment.Method == "Credit Card")
                {
                    Assert.True(percentageByAmount > 40, "Credit cards should be the dominant payment method by amount");
                    Assert.True(percentageByCount > 40, "Credit cards should be the dominant payment method by count");
                }
            }

            Assert.Equal(11000m, totalAmount);
            Assert.Equal(235, totalTransactions);
        }

        [Fact]
        public void CapacityAnalytics_ShouldIdentifyTrends()
        {
            // Arrange
            var events = new[]
            {
                new { Name = "Rock Concert", Capacity = 5000, SoldTickets = 4800, SellOutRate = 0.96 },
                new { Name = "Tech Conference", Capacity = 500, SoldTickets = 450, SellOutRate = 0.90 },
                new { Name = "Art Exhibition", Capacity = 200, SoldTickets = 120, SellOutRate = 0.60 }
            };

            // Act
            var averageSellOutRate = events.Average(e => e.SellOutRate);
            var highPerformingEvents = events.Where(e => e.SellOutRate >= 0.90).ToArray();
            var underPerformingEvents = events.Where(e => e.SellOutRate < 0.70).ToArray();

            // Assert
            Assert.True(averageSellOutRate > 0.80, "Overall sell-out rate should be healthy");
            Assert.Equal(2, highPerformingEvents.Length);
            Assert.Single(underPerformingEvents);

            // Verify capacity utilization
            var totalCapacity = events.Sum(e => e.Capacity);
            var totalSold = events.Sum(e => e.SoldTickets);
            var overallUtilization = totalSold / (decimal)totalCapacity;

            Assert.True(overallUtilization > 0.80m, "Overall capacity utilization should be strong");
        }

        [Fact]
        public void DemographicsAnalytics_ShouldCategorizeAgeGroups()
        {
            // Arrange
            var attendees = new[]
            {
                new { Age = 22, EventType = "Music" },
                new { Age = 28, EventType = "Music" },
                new { Age = 35, EventType = "Business" },
                new { Age = 42, EventType = "Business" },
                new { Age = 19, EventType = "Music" },
                new { Age = 55, EventType = "Cultural" },
                new { Age = 31, EventType = "Tech" }
            };

            // Act - Categorize by age groups
            var ageGroups = attendees.GroupBy(a =>
                a.Age < 25 ? "18-24" :
                a.Age < 35 ? "25-34" :
                a.Age < 45 ? "35-44" :
                a.Age < 55 ? "45-54" : "55+"
            ).ToDictionary(g => g.Key, g => g.Count());

            // Assert
            Assert.True(ageGroups.ContainsKey("18-24"));
            Assert.True(ageGroups.ContainsKey("25-34"));
            Assert.True(ageGroups.ContainsKey("35-44"));
            Assert.Equal(2, ageGroups["18-24"]); // Ages 22, 19
            Assert.Equal(2, ageGroups["25-34"]); // Ages 28, 31
            Assert.Equal(2, ageGroups["35-44"]); // Ages 35, 42
        }
    }
}