﻿using Admin.Application.AdminManagement;
using Microsoft.Extensions.DependencyInjection;

namespace Admin.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IShowAllReports, ShowAllReports>();
        services.AddScoped<IGetAdminReviews, GetAdminReviews>();
        services.AddScoped<ICreateReview, CreateReview>();
        return services;
    }
}