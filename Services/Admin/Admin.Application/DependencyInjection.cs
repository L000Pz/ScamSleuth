using Admin.Application.AdminManagement;
using Microsoft.Extensions.DependencyInjection;

namespace Admin.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IShowAllReports, ShowAllReports>();
        services.AddScoped<IGetAdminReviews, GetAdminReviews>();
        services.AddScoped<ICreateReview, CreateReview>();
        services.AddScoped<IDeleteReview, DeleteReview>();
        services.AddScoped<IGetReportById, GetReportById>();
        services.AddScoped<IUpdateReview, UpdateReview>();
        services.AddScoped<IDeleteReviewComment, DeleteReviewComment>();
        services.AddScoped<IDeleteUrlComment, DeleteUrlComment>();
        services.AddScoped<IWriteReviewComment, WriteReviewComment>();
        services.AddScoped<IWriteUrlComment, WriteUrlComment>();
        services.AddScoped<IDeleteReport, DeleteReport>();
        return services;
    }
}