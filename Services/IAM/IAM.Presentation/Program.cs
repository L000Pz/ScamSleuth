using System.Text;
using IAM.Application;
using IAM.Infrastructure;
using IAM.Infrastructure.UserRepository;
using IAM.Infrastructure.JwtTokenGenerator;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MojoAuth.NET;

var builder = WebApplication.CreateBuilder(args);

// Add JWT Configuration
builder.Services.Configure<JwtTokenSettings>(
    builder.Configuration.GetSection("JwtSettings"));

// Add JWT Authentication
builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
            ValidAudience = builder.Configuration["JwtSettings:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:SecretKey"]!))
        };
    });
var mojoAuthConfig = builder.Configuration.GetSection("MojoAuth");
var apiKey = mojoAuthConfig["ApiKey"];
var apiSecret = mojoAuthConfig["ApiSecret"];

builder.Services.AddSingleton(new MojoAuthHttpClient(apiKey, apiSecret));


builder.Services.AddApplication().AddInfrastructure();
builder.Services.AddDbContext<PostgreSqlContext>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "IAM API", Version = "v1" });

    // Add this line:
    c.AddServer(new OpenApiServer { Url = "/IAM" });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Add authentication middleware BEFORE authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();