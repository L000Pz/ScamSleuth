using Media.Application;
using Media.Infrastructure;
using Media.Infrastructure.Seeding;
using Media.Presentation;
using Media.Presentation.Services;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddPresentation(builder.Configuration).AddApplication().AddInfrastructure();
builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHostedService<RabbitMQConsumer>();
builder.Services.AddCors(options =>{
    options.AddPolicy("AllowOrigin",builder => builder.WithOrigins("http://localhost:3000").AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

// Seed the database
app.Services.CreateScope().ServiceProvider.GetRequiredService<IHost>().SeedDatabase();

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseCors("AllowOrigin");
app.UseAuthorization();

app.MapControllers();

app.Run();