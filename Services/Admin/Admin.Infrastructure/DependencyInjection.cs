using Admin.Application.Common;
using Admin.Infrastructure.AdminRepository;
using Microsoft.Extensions.DependencyInjection;

namespace Admin.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<IAdminRepository,AdminRepository.AdminRepository>();
        services.AddDbContext<PostgreSqlContext>();
        services.AddDbContext<MongoContext>();
        return services;
    }
}