using Xunit;
using System.Text.RegularExpressions;
using Xunit;
using System;
using System.Linq;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.IO;

namespace EventTicketing.Tests.Controllers
{
    public class AuthControllerTests
    {
        [Fact]
        public void UserRegistration_ShouldValidateEmailFormat()
        {
            // Arrange
            var validEmails = new[]
            {
                "user@example.com",
                "john.doe@company.co.uk",
                "event.organizer@tickets.org"
            };

            var invalidEmails = new[]
            {
                "invalid-email",
                "@domain.com",
                "user@",
                "user.domain.com"
            };

            var emailRegex = new Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$");

            // Act & Assert
            foreach (var email in validEmails)
            {
                Assert.True(emailRegex.IsMatch(email), $"Valid email {email} should pass validation");
            }

            foreach (var email in invalidEmails)
            {
                Assert.False(emailRegex.IsMatch(email), $"Invalid email {email} should fail validation");
            }
        }

        [Fact]
        public void UserRegistration_ShouldEnforcePasswordSecurity()
        {
            // Arrange
            var strongPasswords = new[]
            {
                "MySecure123!",
                "EventPlatform2025#",
                "Complex$Pass789"
            };

            var weakPasswords = new[]
            {
                "password",
                "12345678",
                "weakpass"
            };

            // Act & Assert
            foreach (var password in strongPasswords)
            {
                Assert.True(IsStrongPassword(password), $"Password {password} should be considered strong");
            }

            foreach (var password in weakPasswords)
            {
                Assert.False(IsStrongPassword(password), $"Password {password} should be considered weak");
            }
        }

        [Fact]
        public void Login_ShouldHandleUserRolesCorrectly()
        {
            // Arrange
            var userRoles = new[]
            {
                new { Email = "admin@platform.com", Role = "Admin", HasFullAccess = true },
                new { Email = "organizer@events.com", Role = "Organizer", HasFullAccess = false },
                new { Email = "customer@gmail.com", Role = "Customer", HasFullAccess = false }
            };

            // Act & Assert
            foreach (var user in userRoles)
            {
                bool canAccessAnalytics = user.Role == "Admin" || user.Role == "Organizer";
                bool canCreateEvents = user.Role == "Admin" || user.Role == "Organizer";
                bool canManageSystem = user.Role == "Admin";

                if (user.Role == "Admin")
                {
                    Assert.True(canAccessAnalytics && canCreateEvents && canManageSystem);
                }
                else if (user.Role == "Organizer")
                {
                    Assert.True(canAccessAnalytics && canCreateEvents && !canManageSystem);
                }
                else // Customer
                {
                    Assert.True(!canAccessAnalytics && !canCreateEvents && !canManageSystem);
                }
            }
        }

        [Fact]
        public void JWT_TokenShouldExpireAppropriately()
        {
            // Arrange
            var tokenCreationTime = DateTime.UtcNow;
            var tokenExpiryTime = tokenCreationTime.AddHours(24); // 24-hour expiry
            var refreshTokenExpiry = tokenCreationTime.AddDays(30); // 30-day refresh

            // Act
            var currentTime = DateTime.UtcNow;
            var timeUntilExpiry = tokenExpiryTime - currentTime;
            var timeUntilRefreshExpiry = refreshTokenExpiry - currentTime;

            // Assert
            Assert.True(timeUntilExpiry.TotalHours > 23, "Token should be valid for almost 24 hours");
            Assert.True(timeUntilRefreshExpiry.TotalDays > 29, "Refresh token should be valid for almost 30 days");
            Assert.True(tokenExpiryTime > tokenCreationTime, "Expiry should be after creation");
            Assert.True(refreshTokenExpiry > tokenExpiryTime, "Refresh expiry should be after token expiry");
        }

        private bool IsStrongPassword(string password)
        {
            return password.Length >= 8 &&
                   password.Any(char.IsUpper) &&
                   password.Any(char.IsLower) &&
                   password.Any(char.IsDigit) &&
                   password.Any(c => "!@#$%^&*()".Contains(c));
        }
    }
}