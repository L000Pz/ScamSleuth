using Microsoft.EntityFrameworkCore;
using Public.Domain;

namespace Public.Infrastructure.PublicRepository;

public class PostgreSqlContext : DbContext
{
    public PostgreSqlContext(DbContextOptions<PostgreSqlContext> options) : base(options)
    {
        
    }
    public DbSet<Review> review { get; set; }
    public DbSet<Review_Banner> review_banner { get; set; }
    public DbSet<Admin_Review> admin_review { get; set; }
    public DbSet<Review_Content> review_content { get; set; }
    public DbSet<Review_Content_Media> review_content_media { get; set; }
    public DbSet<Scam_Type> scam_type { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Review>()
            .HasKey(r => new { r.review_id});
        modelBuilder.Entity<Scam_Type>()
            .HasKey(st => new { st.scam_type_id});
        modelBuilder.Entity<Review_Banner>()
            .HasKey(rb => new { rb.review_id,rb.media_id});
        modelBuilder.Entity<Admin_Review>()
            .HasKey(ar => new { ar.admin_id, ar.review_id });
        modelBuilder.Entity<Review_Content>()
            .HasKey(rc => new { rc.review_content_id});
        modelBuilder.Entity<Review_Content_Media>()
            .HasKey(rcm => new { rcm.review_content_id, rcm.media_id });
        
        base.OnModelCreating(modelBuilder);
    }
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseNpgsql(
            "Host=localhost;Database=ScamSleuth_db;Username=postgres;Password=admin");
    }
}