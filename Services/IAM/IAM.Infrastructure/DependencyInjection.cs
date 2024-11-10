using IAM.Application.Common;
using IAM.Infrastructure.JwtTokenGenerator;
using IAM.Infrastructure.UserRepository;
using Microsoft.Extensions.DependencyInjection;

namespace IAM.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<IUserRepository, UserRepository.UserRepository>();
        services.AddScoped<IJwtTokenGenerator, JwtGenerator>();
        services.AddScoped<IHasher,Hasher>();
        services.AddDbContext<PostgreSqlContext>();
        return services;
    }
}