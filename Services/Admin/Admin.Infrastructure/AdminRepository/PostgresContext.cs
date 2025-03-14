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
    public DbSet<Review> review { get; set; }
    public DbSet<Admin_Review> admin_review { get; set; }
    public DbSet<Review_Banner> review_banner { get; set; }
    public DbSet<Review_Content> review_content { get; set; }
    public DbSet<Review_Content_Media> review_content_media { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Report>()
            .HasKey(r => new { r.report_id});
        modelBuilder.Entity<Review>()
            .HasKey(r => new { r.review_id});
        modelBuilder.Entity<Review_Content>()
            .HasKey(rc => new { rc.review_content_id });
        modelBuilder.Entity<Review_Banner>()
            .HasKey(rb => new { rb.review_id });
        modelBuilder.Entity<Review_Content_Media>()
            .HasKey(rcm => new { rcm.review_content_id,rcm.media_id });
        modelBuilder.Entity<Admin_Review>()
            .HasKey(ar => new { ar.admin_id,ar.review_id});
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