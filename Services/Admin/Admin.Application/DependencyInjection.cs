using Admin.Application.AdminManagement;
using Microsoft.Extensions.DependencyInjection;

namespace Admin.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IShowAllReports, ShowAllReports>();
        services.AddScoped<IGetAdminReviews, GetAdminReviews>();
        return services;
    }
}