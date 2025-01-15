using Core.Application.Common;
using Core.Infrastructure.UserRepository;
using Microsoft.Extensions.DependencyInjection;

namespace Core.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<IUserRepository, UserRepository.UserRepository>();
        services.AddScoped<IHasher,Hasher.Hasher>();
        services.AddDbContext<PostgreSqlContext>();
        return services;
    }
}