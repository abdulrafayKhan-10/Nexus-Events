using EventTicketing.API.Models.Entities;
using EventTicketing.API.Services;
using Microsoft.EntityFrameworkCore;

namespace EventTicketing.API.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var authService = scope.ServiceProvider.GetRequiredService<IAuthService>();

            try
            {
                if (context.Database.IsRelational())
                    await context.Database.MigrateAsync();

                // ========================
                // SEED USERS
                // ========================

                int superAdminId = 0, organizerId = 0, attendeeId = 0;

                if (!await context.Users.AnyAsync(u => u.Email == "admin@nexusevents.com"))
                {
                    var admin = new User
                    {
                        Email = "admin@nexusevents.com",
                        PasswordHash = await authService.HashPasswordAsync("Admin123!"),
                        FirstName = "System",
                        LastName = "Administrator",
                        CreatedAt = DateTime.UtcNow,
                        IsActive = true,
                        Status = UserStatus.Active
                    };
                    context.Users.Add(admin);
                    await context.SaveChangesAsync();
                    context.UserRoles.Add(new UserRole { UserId = admin.UserId, Role = RoleType.SuperAdmin, AssignedAt = DateTime.UtcNow, IsActive = true });
                    await context.SaveChangesAsync();
                    superAdminId = admin.UserId;
                }
                else
                {
                    superAdminId = (await context.Users.FirstAsync(u => u.Email == "admin@nexusevents.com")).UserId;
                }

                if (!await context.Users.AnyAsync(u => u.Email == "organizer@nexusevents.com"))
                {
                    var organizer = new User
                    {
                        Email = "organizer@nexusevents.com",
                        PasswordHash = await authService.HashPasswordAsync("Organizer123!"),
                        FirstName = "Event",
                        LastName = "Organizer",
                        CreatedAt = DateTime.UtcNow,
                        IsActive = true,
                        Status = UserStatus.Active
                    };
                    context.Users.Add(organizer);
                    await context.SaveChangesAsync();
                    context.UserRoles.Add(new UserRole { UserId = organizer.UserId, Role = RoleType.Organizer, AssignedAt = DateTime.UtcNow, IsActive = true });
                    await context.SaveChangesAsync();
                    organizerId = organizer.UserId;
                }
                else
                {
                    organizerId = (await context.Users.FirstAsync(u => u.Email == "organizer@nexusevents.com")).UserId;
                }

                if (!await context.Users.AnyAsync(u => u.Email == "attendee@nexusevents.com"))
                {
                    var attendee = new User
                    {
                        Email = "attendee@nexusevents.com",
                        PasswordHash = await authService.HashPasswordAsync("Attendee123!"),
                        FirstName = "Alex",
                        LastName = "Chen",
                        CreatedAt = DateTime.UtcNow,
                        IsActive = true,
                        Status = UserStatus.Active
                    };
                    context.Users.Add(attendee);
                    await context.SaveChangesAsync();
                    context.UserRoles.Add(new UserRole { UserId = attendee.UserId, Role = RoleType.Customer, AssignedAt = DateTime.UtcNow, IsActive = true });
                    await context.SaveChangesAsync();
                    attendeeId = attendee.UserId;
                }
                else
                {
                    attendeeId = (await context.Users.FirstAsync(u => u.Email == "attendee@nexusevents.com")).UserId;
                }

                // ========================
                // SEED CATEGORIES
                // ========================
                if (!await context.Set<EventCategory>().AnyAsync())
                {
                    var categories = new List<EventCategory>
                    {
                        new EventCategory { Name = "Music", Description = "Live music and concerts", IsActive = true },
                        new EventCategory { Name = "Technology", Description = "Tech conferences and hackathons", IsActive = true },
                        new EventCategory { Name = "Sports", Description = "Sports events and competitions", IsActive = true },
                        new EventCategory { Name = "Arts & Culture", Description = "Art exhibitions and cultural events", IsActive = true },
                        new EventCategory { Name = "Business", Description = "Business networking and workshops", IsActive = true },
                        new EventCategory { Name = "Food & Drink", Description = "Food festivals and culinary experiences", IsActive = true },
                        new EventCategory { Name = "Comedy", Description = "Stand-up comedy and improv shows", IsActive = true },
                    };
                    context.Set<EventCategory>().AddRange(categories);
                    await context.SaveChangesAsync();
                }

                // ========================
                // SEED VENUES
                // ========================
                if (!await context.Set<Venue>().AnyAsync())
                {
                    var venues = new List<Venue>
                    {
                        new Venue
                        {
                            Name = "Nexus Arena",
                            Description = "Premier indoor event venue with state-of-the-art sound and lighting systems",
                            Address = "1 Event Drive",
                            City = "San Francisco",
                            State = "CA",
                            ZipCode = "94105",
                            Country = "United States",
                            Capacity = 5000,
                            IsActive = true,
                            ContactEmail = "info@nexusarena.com",
                            ContactPhone = "+1 415-555-0100"
                        },
                        new Venue
                        {
                            Name = "The Grand Hall",
                            Description = "Elegant ballroom venue perfect for galas and corporate events",
                            Address = "250 Grand Ave",
                            City = "New York",
                            State = "NY",
                            ZipCode = "10001",
                            Country = "United States",
                            Capacity = 2000,
                            IsActive = true,
                            ContactEmail = "info@grandhall.com",
                            ContactPhone = "+1 212-555-0200"
                        },
                        new Venue
                        {
                            Name = "Tech Hub Conference Center",
                            Description = "Modern conference center at the heart of Silicon Valley",
                            Address = "500 Innovation Blvd",
                            City = "Palo Alto",
                            State = "CA",
                            ZipCode = "94301",
                            Country = "United States",
                            Capacity = 1500,
                            IsActive = true,
                            ContactEmail = "events@techhub.com",
                            ContactPhone = "+1 650-555-0300"
                        },
                        new Venue
                        {
                            Name = "Rooftop Sessions",
                            Description = "Open-air rooftop venue with panoramic city views",
                            Address = "88 Sky Lane",
                            City = "Los Angeles",
                            State = "CA",
                            ZipCode = "90001",
                            Country = "United States",
                            Capacity = 800,
                            IsActive = true,
                            ContactEmail = "hello@rooftopsessions.com",
                            ContactPhone = "+1 323-555-0400"
                        },
                    };
                    context.Set<Venue>().AddRange(venues);
                    await context.SaveChangesAsync();
                }

                // ========================
                // SEED EVENTS
                // ========================
                if (!await context.Set<Event>().AnyAsync())
                {
                    var musicCatId = (await context.Set<EventCategory>().FirstAsync(c => c.Name == "Music")).CategoryId;
                    var techCatId = (await context.Set<EventCategory>().FirstAsync(c => c.Name == "Technology")).CategoryId;
                    var businessCatId = (await context.Set<EventCategory>().FirstAsync(c => c.Name == "Business")).CategoryId;
                    var artsCatId = (await context.Set<EventCategory>().FirstAsync(c => c.Name == "Arts & Culture")).CategoryId;
                    var comedyCatId = (await context.Set<EventCategory>().FirstAsync(c => c.Name == "Comedy")).CategoryId;

                    var venueArenaId = (await context.Set<Venue>().FirstAsync(v => v.Name == "Nexus Arena")).VenueId;
                    var venueGrandHallId = (await context.Set<Venue>().FirstAsync(v => v.Name == "The Grand Hall")).VenueId;
                    var venueTechHubId = (await context.Set<Venue>().FirstAsync(v => v.Name == "Tech Hub Conference Center")).VenueId;
                    var venueRooftopId = (await context.Set<Venue>().FirstAsync(v => v.Name == "Rooftop Sessions")).VenueId;

                    var events = new List<Event>
                    {
                        new Event
                        {
                            Title = "Nexus Music Festival 2025",
                            Description = "Experience three days of non-stop music across five stages featuring over 60 international artists. From electronic beats to indie rock, this is the festival of the year. Enjoy world-class production, immersive art installations, gourmet food villages, and an unforgettable atmosphere.",
                            ShortDescription = "Three days. 60+ artists. One legendary festival.",
                            OrganizerId = organizerId,
                            VenueId = venueArenaId,
                            CategoryId = musicCatId,
                            StartDateTime = DateTime.UtcNow.AddDays(30),
                            EndDateTime = DateTime.UtcNow.AddDays(33),
                            Status = EventStatus.Published,
                            IsPublished = true,
                            IsFeatured = true,
                            MaxAttendees = 5000,
                            BasePrice = 89.00m,
                            Currency = "USD",
                            Tags = "music,festival,live,outdoor",
                            ImageUrl = "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800"
                        },
                        new Event
                        {
                            Title = "Silicon Summit 2025",
                            Description = "The premier technology conference bringing together innovators, entrepreneurs, and industry leaders for two days of keynotes, workshops, and networking. Topics include AI, blockchain, web3, quantum computing, and the future of software. Connect with thousands of tech professionals from around the globe.",
                            ShortDescription = "The future of tech, today.",
                            OrganizerId = organizerId,
                            VenueId = venueTechHubId,
                            CategoryId = techCatId,
                            StartDateTime = DateTime.UtcNow.AddDays(45),
                            EndDateTime = DateTime.UtcNow.AddDays(47),
                            Status = EventStatus.Published,
                            IsPublished = true,
                            IsFeatured = true,
                            MaxAttendees = 1500,
                            BasePrice = 299.00m,
                            Currency = "USD",
                            Tags = "technology,conference,AI,blockchain,networking",
                            ImageUrl = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800"
                        },
                        new Event
                        {
                            Title = "Midnight Jazz & Blues Night",
                            Description = "Lose yourself in the soulful sounds of jazz and blues as the city lights twinkle around you. This intimate rooftop experience hosts some of the finest jazz musicians in the country. Enjoy curated cocktails, small-plates dining, and pure musical magic under the stars.",
                            ShortDescription = "Jazz & blues under the stars.",
                            OrganizerId = organizerId,
                            VenueId = venueRooftopId,
                            CategoryId = musicCatId,
                            StartDateTime = DateTime.UtcNow.AddDays(14),
                            EndDateTime = DateTime.UtcNow.AddDays(14).AddHours(5),
                            Status = EventStatus.Published,
                            IsPublished = true,
                            IsFeatured = false,
                            MaxAttendees = 800,
                            BasePrice = 65.00m,
                            Currency = "USD",
                            Tags = "jazz,blues,rooftop,intimate,live",
                            ImageUrl = "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800"
                        },
                        new Event
                        {
                            Title = "The Business Growth Summit",
                            Description = "An intensive one-day bootcamp for entrepreneurs and business leaders designed to equip you with actionable strategies for accelerating growth. Sessions cover marketing, fundraising, team building, scaling, and leadership. Featuring 20+ speakers from Fortune 500 companies and fast-growing startups.",
                            ShortDescription = "Scale faster. Lead better. Grow smarter.",
                            OrganizerId = organizerId,
                            VenueId = venueGrandHallId,
                            CategoryId = businessCatId,
                            StartDateTime = DateTime.UtcNow.AddDays(21),
                            EndDateTime = DateTime.UtcNow.AddDays(21).AddHours(9),
                            Status = EventStatus.Published,
                            IsPublished = true,
                            IsFeatured = false,
                            MaxAttendees = 2000,
                            BasePrice = 149.00m,
                            Currency = "USD",
                            Tags = "business,growth,entrepreneurship,networking,startup",
                            ImageUrl = "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800"
                        },
                        new Event
                        {
                            Title = "Stand-Up Spectacular: Comedy Night",
                            Description = "Get ready for an evening of laughter with five of the most hilarious comedians on the circuit. This special showcase features both established headliners and exciting new voices in comedy. Grab your friends, grab your drinks, and prepare for the best night out you've had all year.",
                            ShortDescription = "Five comedians. One unforgettable night.",
                            OrganizerId = organizerId,
                            VenueId = venueRooftopId,
                            CategoryId = comedyCatId,
                            StartDateTime = DateTime.UtcNow.AddDays(10),
                            EndDateTime = DateTime.UtcNow.AddDays(10).AddHours(3),
                            Status = EventStatus.Published,
                            IsPublished = true,
                            IsFeatured = false,
                            MaxAttendees = 800,
                            BasePrice = 35.00m,
                            Currency = "USD",
                            Tags = "comedy,standup,humor,night-out",
                            ImageUrl = "https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=800"
                        },
                    };

                    context.Set<Event>().AddRange(events);
                    await context.SaveChangesAsync();

                    // ========================
                    // SEED TICKET TYPES
                    // ========================
                    var allEvents = await context.Set<Event>().ToListAsync();
                    foreach (var ev in allEvents)
                    {
                        var ticketTypes = new List<TicketType>
                        {
                            new TicketType
                            {
                                EventId = ev.EventId,
                                Name = "General Admission",
                                Description = "Standard access to all areas",
                                Price = ev.BasePrice,
                                QuantityAvailable = (int)(ev.MaxAttendees * 0.6),
                                QuantitySold = 0,
                                MaxQuantityPerOrder = 10,
                                SaleStartDate = DateTime.UtcNow,
                                SaleEndDate = ev.StartDateTime.AddHours(-2),
                                IsActive = true,
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow
                            },
                            new TicketType
                            {
                                EventId = ev.EventId,
                                Name = "VIP",
                                Description = "Premium access with exclusive lounge, meet & greet, and gift bag",
                                Price = ev.BasePrice * 2.5m,
                                QuantityAvailable = (int)(ev.MaxAttendees * 0.15),
                                QuantitySold = 0,
                                MaxQuantityPerOrder = 4,
                                SaleStartDate = DateTime.UtcNow,
                                SaleEndDate = ev.StartDateTime.AddHours(-2),
                                IsActive = true,
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow
                            },
                            new TicketType
                            {
                                EventId = ev.EventId,
                                Name = "Early Bird",
                                Description = "Limited early bird discount — grab before they're gone!",
                                Price = ev.BasePrice * 0.65m,
                                QuantityAvailable = (int)(ev.MaxAttendees * 0.1),
                                QuantitySold = 5,
                                MaxQuantityPerOrder = 6,
                                SaleStartDate = DateTime.UtcNow,
                                SaleEndDate = ev.StartDateTime.AddDays(-7),
                                IsActive = true,
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow
                            },
                        };
                        context.Set<TicketType>().AddRange(ticketTypes);
                    }
                    await context.SaveChangesAsync();
                }

                // ========================
                // SEED PROMO CODES
                // ========================
                if (!await context.Set<PromoCode>().AnyAsync())
                {
                    var firstEvent = await context.Set<Event>().FirstAsync();
                    var promoCodes = new List<PromoCode>
                    {
                        new PromoCode
                        {
                            EventId = firstEvent.EventId,
                            OrganizerId = organizerId,
                            Code = "NEXUS20",
                            Description = "20% off for early supporters",
                            Type = PromoCodeType.Percentage,
                            Value = 20,
                            Scope = PromoCodeScope.EventSpecific,
                            MaxUsageCount = 100,
                            CurrentUsageCount = 0,
                            StartDate = DateTime.UtcNow,
                            EndDate = DateTime.UtcNow.AddDays(60),
                            Status = PromoCodeStatus.Active,
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        },
                        new PromoCode
                        {
                            EventId = firstEvent.EventId,
                            OrganizerId = organizerId,
                            Code = "WELCOME10",
                            Description = "$10 off for any event",
                            Type = PromoCodeType.FixedAmount,
                            Value = 10,
                            Scope = PromoCodeScope.EventSpecific,
                            MaxUsageCount = 500,
                            CurrentUsageCount = 0,
                            StartDate = DateTime.UtcNow,
                            EndDate = DateTime.UtcNow.AddDays(90),
                            Status = PromoCodeStatus.Active,
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        }
                    };
                    context.Set<PromoCode>().AddRange(promoCodes);
                    await context.SaveChangesAsync();
                }

                Console.WriteLine("✅ Database seeded successfully.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error seeding database: {ex.Message}");
            }
        }
    }
}
