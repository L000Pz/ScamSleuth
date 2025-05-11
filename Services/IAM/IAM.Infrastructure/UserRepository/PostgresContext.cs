using Microsoft.EntityFrameworkCore;
using IAM.Infrastructure.UserRepository;
using IAM.Domain;
namespace IAM.Infrastructure.UserRepository;

public class PostgreSqlContext : DbContext
{
    public PostgreSqlContext() {}

    public PostgreSqlContext(DbContextOptions<PostgreSqlContext> options) : base(options)
    {
        
    }
    public DbSet<Users> users { get; set; }
    public DbSet<Admins> admins { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Admins>()
            .HasKey(a => new { a.admin_id });
        modelBuilder.Entity<Admins>()
            .Property(a => a.bio)
            .IsRequired(false);
        modelBuilder.Entity<Admins>()
            .Property(a => a.profile_picture_id)
            .IsRequired(false);
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
            "Host=postgres_container;Database=ScamSleuth_db;Username=postgres;Password=admin");
    }
}