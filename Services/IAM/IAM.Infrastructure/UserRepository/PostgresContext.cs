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
        
        base.OnModelCreating(modelBuilder);
    }
    
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseNpgsql(
            "Host=postgres_container;Database=ScamSleuth_db;Username=postgres;Password=admin");
    }
}