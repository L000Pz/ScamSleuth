﻿using Microsoft.Extensions.DependencyInjection;
using User.Application.UserManagement;

namespace User.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IEditUserInfo, EditUserInfo>();
        services.AddScoped<ISubmitReport, SubmitReport>();
        services.AddScoped<IRemoveReport, RemoveReport>();
        services.AddScoped<IReturnReportById, ReturnReportById>();
        services.AddScoped<IGetUserReports, GetUserReports>();
        services.AddScoped<IWriteReviewComment, WriteReviewComment>();
        services.AddScoped<IWriteUrlComment, WriteUrlComment>();
        return services;
    }
}