using Microsoft.Extensions.DependencyInjection;
using Public.Application.PublicManagement;

namespace Public.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IShowAllReviews, ShowAllReviews>();
        services.AddScoped<IGetScamTypes, GetScamTypes>();
        services.AddScoped<IShowRecentReviews, ShowRecentReviews>();
        services.AddScoped<IReturnReviewById, ReturnReviewById>();
        services.AddScoped<IShowReviewComments, ShowReviewComments>();
        services.AddScoped<IShowUrlComments, ShowUrlComments>();
        return services;
    }
}