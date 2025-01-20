using User.Domain;
using Microsoft.EntityFrameworkCore;
namespace User.Infrastructure.UserRepository;

public class PostgreSqlContext : DbContext
{
    public PostgreSqlContext(DbContextOptions<PostgreSqlContext> options) : base(options)
    {
        
    }
    public DbSet<Users> users { get; set; }
    public DbSet<Report> report { get; set; }
    public DbSet<Report_Media> report_media { get; set; }
    public DbSet<User_Report> user_report { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Report>()
            .HasKey(r => new { r.report_id});
        modelBuilder.Entity<Report_Media>()
            .HasKey(rm => new { rm.report_id,rm.media_id });
        modelBuilder.Entity<User_Report>()
            .HasKey(ur => new { ur.user_id,ur.review_id});
        modelBuilder.Entity<Users>()
            .HasKey(u => new { u.user_id });
        modelBuilder.Entity<Users>()
            .Property(u => u.profile_picture_id)
            .IsRequired(false);
        
        base.OnModelCreating(modelBuilder);
    }
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseNpgsql(
            "Host=localhost;Database=ScamSleuth_db;Username=postgres;Password=admin");
    }
}