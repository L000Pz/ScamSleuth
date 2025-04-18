﻿using System.Text;
using Media.Infrastructure.JWT;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

namespace Media.Presentation;

public static class DependencyInjection
{
    public static IServiceCollection AddPresentation(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSwagger();
        services.AddAuth(configuration);
        services.AddHttpClient();
        return services;
    }

    private static IServiceCollection AddAuth(this IServiceCollection services, IConfiguration configuration)
    {
        // Bind JwtSettings from configuration
        var jwtSettings = configuration.GetSection("JwtSettings").Get<JwtSettings>();

        // Add authentication with JWT bearer token
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(o =>
            {
                if (jwtSettings != null)
                    o.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = jwtSettings.Issuer,
                        ValidAudience = jwtSettings.Audience,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey))
                    };
            });

        return services;
    }

    private static IServiceCollection AddSwagger(this IServiceCollection services)
    {
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo { Title = "Media API", Version = "v1" });

            options.AddServer(new OpenApiServer { Url = "/Media" });

            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                In = ParameterLocation.Header,
                Description = "Please enter a valid JWT token.",
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                BearerFormat = "JWT",
                Scheme = "Bearer"
            });
            options.AddSecurityRequirement(
                new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        new string[] { }
                    }
                }
            );
        });

        return services;
    }
}
