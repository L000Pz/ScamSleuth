using Media.Infrastructure.MediaRepository;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Media.Infrastructure.Seeding;

public static class DatabaseSeederExtensions
{
    public static IHost SeedDatabase(this IHost host)
    {
        using (var scope = host.Services.CreateScope())
        {
            var services = scope.ServiceProvider;
            try
            {
                var repository = services.GetRequiredService<IMongoRepository>();
                repository.SeedDefaultProfilePictures().GetAwaiter().GetResult();
                Console.WriteLine("Database seeding process completed");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error during database seeding: {ex.Message}");
            }
        }
        
        return host;
    }
}