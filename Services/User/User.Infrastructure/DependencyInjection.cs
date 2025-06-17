using Microsoft.Extensions.DependencyInjection;
using User.Application.Common;
using User.Infrastructure.UserRepository;

namespace User.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<IUserRepository, UserRepository.UserRepository>();
        services.AddScoped<IHasher, Hasher.Hasher>();
        services.AddDbContext<PostgreSqlContext>();
        return services;
    }
}