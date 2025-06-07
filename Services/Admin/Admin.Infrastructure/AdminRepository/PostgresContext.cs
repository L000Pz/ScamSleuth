using Admin.Domain;
using Microsoft.EntityFrameworkCore;
namespace Admin.Infrastructure.AdminRepository;

public class PostgreSqlContext : DbContext
{
    public PostgreSqlContext(DbContextOptions<PostgreSqlContext> options) : base(options)
    {
        
    }
    public DbSet<Admins> admins { get; set; }
    public DbSet<Report> report { get; set; }
    public DbSet<Users> users { get; set; }
    public DbSet<Report_Media> report_media { get; set; }
    public DbSet<Review_Content_Media> review_content_media { get; set; }
    public DbSet<Review> review { get; set; }
    public DbSet<Review_Banner> review_banner { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Report>()
            .HasKey(r => new { r.report_id});
        modelBuilder.Entity<Report_Media>()
            .HasKey(rm => new { rm.report_id,rm.media_id });
        modelBuilder.Entity<Users>()
            .HasKey(u => new { u.user_id });
        modelBuilder.Entity<Users>()
            .Property(u => u.profile_picture_id)
            .IsRequired(false);
        modelBuilder.Entity<Review>()
            .HasKey(r => new { r.review_id});
        modelBuilder.Entity<Review_Content_Media>()
            .HasKey(rcm => new { rcm.review_id,rcm.media_id });
        modelBuilder.Entity<Review_Banner>()
            .HasKey(rb => new { rb.review_id });
        modelBuilder.Entity<Admins>()
            .HasKey(a => new { a.admin_id });
        modelBuilder.Entity<Admins>()
            .Property(a => a.profile_picture_id)
            .IsRequired(false);
        
        base.OnModelCreating(modelBuilder);
    }
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseNpgsql(
            "Host=postgres_container;Database=ScamSleuth_db;Username=postgres;Password=admin");
    }
}