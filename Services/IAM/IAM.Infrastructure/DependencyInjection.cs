using IAM.Application.Common;
using Microsoft.Extensions.DependencyInjection;

namespace IAM.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<IUserRepository, UserRepositoryInMemory>();
        services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();
        return services;
    }
}