using Microsoft.OpenApi.Models;
using Public.Application;
using Public.Infrastructure;
using Public.Infrastructure.PublicRepository;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Public API", Version = "v1" });

    // Add this line:
    c.AddServer(new OpenApiServer { Url = "/Public" });
});

builder.Services.AddApplication().AddInfrastructure();
builder.Services.AddDbContext<PostgreSqlContext>();
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();