using Microsoft.Extensions.DependencyInjection;
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
        return services;
    }
}