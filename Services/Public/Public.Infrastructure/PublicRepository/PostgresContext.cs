using Microsoft.EntityFrameworkCore;
using Public.Domain;

namespace Public.Infrastructure.PublicRepository;

public class PostgreSqlContext : DbContext
{
    public PostgreSqlContext(DbContextOptions<PostgreSqlContext> options) : base(options)
    {
    }

    public DbSet<Review> review { get; set; }
    public DbSet<Review_Content> review_content { get; set; }
    public DbSet<ReviewComment> review_comment { get; set; }
    public DbSet<UrlStorage> url_storage { get; set; }
    public DbSet<UrlComment> url_comment { get; set; }
    public DbSet<Scam_Type> scam_type { get; set; }
    public DbSet<Admins> admins { get; set; }
    public DbSet<Users> users { get; set; }
    public DbSet<Review_Content_Media> review_content_media { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Review>()
            .HasKey(r => new { r.review_id });
        modelBuilder.Entity<Scam_Type>()
            .HasKey(st => new { st.scam_type_id });
        modelBuilder.Entity<Review_Content>()
            .HasKey(rc => new { rc.review_content_id });
        modelBuilder.Entity<ReviewComment>()
            .HasKey(rc => new { rc.comment_id });
        modelBuilder.Entity<UrlComment>()
            .HasKey(uc => new { uc.comment_id });
        modelBuilder.Entity<UrlStorage>()
            .HasKey(us => new { us.url_id });
        modelBuilder.Entity<Admins>()
            .HasKey(a => new { a.admin_id });
        modelBuilder.Entity<Admins>()
            .Property(a => a.profile_picture_id)
            .IsRequired(false);
        modelBuilder.Entity<ReviewComment>()
            .Property(rc => rc.root_id)
            .IsRequired(false);
        modelBuilder.Entity<Review_Content_Media>()
            .HasKey(rcm => new { rcm.review_id, rcm.media_id });
        modelBuilder.Entity<UrlComment>()
            .Property(uc => uc.root_id)
            .IsRequired(false);
        modelBuilder.Entity<Users>()
            .HasKey(u => new { u.user_id });
        modelBuilder.Entity<Users>()
            .Property(u => u.profile_picture_id)
            .IsRequired(false);
        modelBuilder.Entity<Review>()
            .Property(r => r.views)
            .IsRequired(false);

        base.OnModelCreating(modelBuilder);
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseNpgsql(
            "Host=postgres_container;Database=ScamSleuth_db;Username=postgres;Password=admin");
    }
}