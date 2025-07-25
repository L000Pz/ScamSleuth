using User.Application;
using User.Infrastructure;
using User.Presentation;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddPresentation(builder.Configuration).AddApplication().AddInfrastructure();
builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddHostedService<RabbitMQConsumer>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowOrigin",
        builder => builder.WithOrigins("http://localhost:3000").AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior",true);

// Configure the HTTP request pipeline.

app.UseSwagger();
app.UseSwaggerUI();


app.UseHttpsRedirection();
app.UseCors("AllowOrigin");
app.UseAuthorization();

app.MapControllers();

app.Run();