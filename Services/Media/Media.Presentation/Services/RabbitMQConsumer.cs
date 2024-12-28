/*using RabbitMQ.Client;
using System.Text;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.ServiceModel.Channels.Common;
namespace Media.Presentation.Services;

public class RabbitMQConsumer : BackgroundService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<RabbitMQConsumer> _logger;
    private readonly IConfiguration _configuration;
    private IConnection _connection;
    private IModel _channel;

    
    public RabbitMQConsumer(IConfiguration configuration, ILogger<RabbitMQConsumer> logger, IHttpClientFactory httpClientFactory)
    {
        _configuration = configuration;
        _logger = logger;

        _httpClientFactory = httpClientFactory;

        var factory = new ConnectionFactory() { HostName = _configuration["RabbitMQ:Host"] };
        _connection = factory.CreateConnection();
        _channel = _connection.CreateModel();
        _channel.QueueDeclare(queue: _configuration["RabbitMQ:Queue"],
            durable: false,
            exclusive: false,
            autoDelete: false,
            arguments: null);
    }
    
    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var consumer = new EventingBasicConsumer(_channel);
        consumer.Received += (model, ea) =>
        {
            var body = ea.Body.ToArray();
            var message = Encoding.UTF8.GetString(body);
            _logger.LogInformation("Received message: {message}", message);
            CallControllerMethod(message.Split(" ")[1]);
            Console.WriteLine(message.Split(" ")[1]);
        };
        _channel.BasicConsume(queue: _configuration["RabbitMQ:Queue"],
            autoAck: true,
            consumer: consumer);

        return Task.CompletedTask;
    }
    
    private async Task CallControllerMethod(string message)
    {
        var client = _httpClientFactory.CreateClient();

        // Adjust the URL as necessary for your specific controller and method
        var url = $"http://host.docker.internal:5002/Media/DeleteAll?username={message}";

        var response = await client.DeleteAsync(url); // or GetAsync based on your method
        if (response.IsSuccessStatusCode)
        {
            _logger.LogInformation("Successfully deleted files");
        }
        else
        {
            _logger.LogError(await response.Content.ReadAsStringAsync());
            _logger.LogError("Failed to call controller method");
        }
    }
    
    public override void Dispose()
    {
        _channel.Close();
        _connection.Close();
        base.Dispose();
    }
}*/