using Core.Domain;
using Microsoft.EntityFrameworkCore;
namespace Core.Infrastructure.UserRepository;

public class PostgreSqlContext : DbContext
{
    public PostgreSqlContext(DbContextOptions<PostgreSqlContext> options) : base(options)
    {
        
    }
    public DbSet<Users> users { get; set; }
    public DbSet<Admins> admins { get; set; }
    public DbSet<Report> report { get; set; }
    public DbSet<Report_Media> report_media { get; set; }
    public DbSet<User_Report> user_report { get; set; }
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseNpgsql(
            "Host=localhost;Database=ScamSleuth_db;Username=postgres;Password=admin");
    }
}