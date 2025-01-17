using Microsoft.Extensions.DependencyInjection;
using User.Application.UserManagement;

namespace User.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IChangePassword, ChangePassword>();
        services.AddScoped<ISubmitReport, SubmitReport>();
        services.AddScoped<IGetUserReports, GetUserReports>();
        return services;
    }
}