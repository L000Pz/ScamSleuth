﻿using IAM.Application.AuthenticationService;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace IAM.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IRegisterService, RegisterService>();
        services.AddScoped<IAdminRegisterService, AdminRegisterService>();
        services.AddScoped<ILoginService, LoginService>();
        services.AddScoped<IVerificationService, VerificationService>();
        services.AddScoped<INewCodeService, NewCodeService>();
        services.AddScoped<ITokenCheck, TokenCheck>();
        services.AddScoped<IReturnByTokenService, ReturnByTokenService>();
        return services;
    }
}