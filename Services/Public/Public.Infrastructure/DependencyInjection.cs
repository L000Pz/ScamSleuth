using Microsoft.Extensions.DependencyInjection;
using Public.Application.Common;
using Public.Infrastructure.PublicRepository;

namespace Public.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<IPublicRepository, PublicRepository.PublicRepository>();
        services.AddDbContext<PostgreSqlContext>();
        return services;
    }
}