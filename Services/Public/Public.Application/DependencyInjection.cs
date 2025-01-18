using Microsoft.Extensions.DependencyInjection;
using Public.Application.PublicManagement;

namespace Public.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IShowAllReviews, ShowAllReviews>();
        services.AddScoped<IShowRecentReviews, ShowRecentReviews>();
        services.AddScoped<IReturnReviewById, ReturnReviewById>();
        return services;
    }
}