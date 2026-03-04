using Microsoft.EntityFrameworkCore;
using EventTicketing.API.Models.Entities;

namespace EventTicketing.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // User Management
        public DbSet<User> Users { get; set; }
        public DbSet<UserProfile> UserProfiles { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<UserNotification> UserNotifications { get; set; }

        // Events
        public DbSet<Event> Events { get; set; }
        public DbSet<EventCategory> EventCategories { get; set; }
        public DbSet<EventReview> EventReviews { get; set; }

        // Venues
        public DbSet<Venue> Venues { get; set; }

        // Ticketing
        public DbSet<TicketType> TicketTypes { get; set; }
        public DbSet<Ticket> Tickets { get; set; }

        // Orders
        public DbSet<Order> Orders { get; set; }

        // Favorites
        public DbSet<UserFavoriteEvent> UserFavoriteEvents { get; set; }
        public DbSet<UserPreferences> UserPreferences { get; set; }

        //Promo 
        public DbSet<PromoCode> PromoCodes { get; set; }
        public DbSet<PromoCodeUsage> PromoCodeUsages { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<UserPreferences>()
            .HasOne(up => up.User)
            .WithOne(u => u.UserPreferences)
            .HasForeignKey<UserPreferences>(up => up.UserId);

            // User - UserProfile (One-to-One)
            modelBuilder.Entity<User>()
                .HasOne(u => u.UserProfile)
                .WithOne(up => up.User)
                .HasForeignKey<UserProfile>(up => up.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Event relationships - PREVENT CASCADING DELETES
            modelBuilder.Entity<Event>()
                .HasOne(e => e.Organizer)
                .WithMany(u => u.OrganizedEvents)
                .HasForeignKey(e => e.OrganizerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Event>()
                .HasOne(e => e.Venue)
                .WithMany(v => v.Events)
                .HasForeignKey(e => e.VenueId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Event>()
                .HasOne(e => e.Category)
                .WithMany(c => c.Events)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // Ticket relationships - FIX CASCADING ISSUES
            modelBuilder.Entity<Ticket>()
                .HasOne(t => t.Event)
                .WithMany(e => e.Tickets)
                .HasForeignKey(t => t.EventId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Ticket>()
                .HasOne(t => t.TicketType)
                .WithMany(tt => tt.Tickets)
                .HasForeignKey(t => t.TicketTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Ticket>()
                .HasOne(t => t.Order)
                .WithMany(o => o.Tickets)
                .HasForeignKey(t => t.OrderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Ticket>()
                .HasOne(t => t.User)
                .WithMany(u => u.Tickets)
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // TicketType relationship
            modelBuilder.Entity<TicketType>()
                .HasOne(tt => tt.Event)
                .WithMany(e => e.TicketTypes)
                .HasForeignKey(tt => tt.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            // Order relationship
            modelBuilder.Entity<Order>()
                .HasOne(o => o.User)
                .WithMany(u => u.Orders)
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Review relationships
            modelBuilder.Entity<EventReview>()
                .HasOne(er => er.Event)
                .WithMany(e => e.Reviews)
                .HasForeignKey(er => er.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<EventReview>()
                .HasOne(er => er.User)
                .WithMany(u => u.Reviews)
                .HasForeignKey(er => er.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // UserFavoriteEvent (Many-to-Many)
            modelBuilder.Entity<UserFavoriteEvent>()
                .HasKey(ufe => new { ufe.UserId, ufe.EventId });

            modelBuilder.Entity<UserFavoriteEvent>()
                .HasOne(ufe => ufe.User)
                .WithMany(u => u.FavoriteEvents)
                .HasForeignKey(ufe => ufe.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<UserFavoriteEvent>()
                .HasOne(ufe => ufe.Event)
                .WithMany(e => e.FavoritedBy)
                .HasForeignKey(ufe => ufe.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            // Decimal precision settings
            modelBuilder.Entity<Event>()
                .Property(e => e.BasePrice)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<TicketType>()
                .Property(tt => tt.Price)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Ticket>()
                .Property(t => t.PricePaid)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Order>()
                .Property(o => o.SubTotal)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Order>()
                .Property(o => o.TaxAmount)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Order>()
                .Property(o => o.ServiceFee)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Order>()
                .Property(o => o.TotalAmount)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Order>()
                .Property(o => o.DiscountAmount)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Venue>()
                .Property(v => v.Latitude)
                .HasColumnType("decimal(18,6)");

            modelBuilder.Entity<Venue>()
                .Property(v => v.Longitude)
                .HasColumnType("decimal(18,6)");

            // PromoCode configuration
            modelBuilder.Entity<PromoCode>(entity =>
            {
                entity.HasKey(e => e.PromoCodeId);

                entity.Property(e => e.Code)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.Description)
                    .HasMaxLength(200);

                entity.Property(e => e.Value)
                    .HasColumnType("decimal(18,2)")
                    .IsRequired();

                entity.Property(e => e.MinimumOrderAmount)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.MaximumDiscountAmount)
                    .HasColumnType("decimal(18,2)");

                entity.HasIndex(e => e.Code)
                    .IsUnique();

                entity.HasIndex(e => new { e.OrganizerId, e.Code })
                    .HasDatabaseName("IX_PromoCodes_Organizer_Code");

                // Foreign key relationships
                entity.HasOne(e => e.Organizer)
                    .WithMany()
                    .HasForeignKey(e => e.OrganizerId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Event)
                    .WithMany()
                    .HasForeignKey(e => e.EventId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // PromoCodeUsage configuration
            modelBuilder.Entity<PromoCodeUsage>(entity =>
            {
                entity.HasKey(e => e.PromoCodeUsageId);

                entity.Property(e => e.DiscountAmount)
                    .HasColumnType("decimal(18,2)")
                    .IsRequired();

                entity.Property(e => e.OrderSubtotal)
                    .HasColumnType("decimal(18,2)")
                    .IsRequired();

                entity.HasIndex(e => new { e.PromoCodeId, e.UsedAt })
                    .HasDatabaseName("IX_PromoCodeUsages_PromoCode_Date");

                entity.HasIndex(e => new { e.UserId, e.PromoCodeId })
                    .HasDatabaseName("IX_PromoCodeUsages_User_PromoCode");

                // Foreign key relationships
                entity.HasOne(e => e.PromoCode)
                    .WithMany(pc => pc.PromoCodeUsages)
                    .HasForeignKey(e => e.PromoCodeId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Order)
                    .WithMany()
                    .HasForeignKey(e => e.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Event)
                    .WithMany()
                    .HasForeignKey(e => e.EventId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}