using System.Text;
using KingMetal.MessageBus.RabbitMQ.MessageBus;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace Media.Presentation.Services;

public class RabbitMqConsumer:BackgroundService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<RabbitMQConsumer> _logger;
    private readonly IConfiguration _configuration;
    private IConnection _connection;
    private IModel _channel;

    
    public RabbitMqConsumer(IConfiguration configuration, ILogger<RabbitMQConsumer> logger, IServiceProvider serviceProvider, IHttpClientFactory httpClientFactory)
    {
        _configuration = configuration;
        _logger = logger;

        _serviceProvider = serviceProvider;
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
            try
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);
                
                // Parse the numeric ID from the message
                if (int.TryParse(message.Split(" ")[1], out int id))
                {
                    _logger.LogInformation("Received delete request for media ID: {id}", id);
                    CallControllerMethod(id);
                }
                else
                {
                    _logger.LogError("Invalid media ID format received");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing message");
            }
        };
        
        _channel.BasicConsume(queue: _configuration["RabbitMQ:Queue"],
            autoAck: true,
            consumer: consumer);

        return Task.CompletedTask;
    }
    
    private async Task CallControllerMethod(int id)
    {
        var client = _httpClientFactory.CreateClient();
        var url = $"http://localhost:8080/Media/mediaManager/Delete/{id}";

        var response = await client.DeleteAsync(url);
        if (response.IsSuccessStatusCode)
        {
            _logger.LogInformation($"Successfully deleted media with ID: {id}");
        }
        else
        {
            _logger.LogError(await response.Content.ReadAsStringAsync());
            _logger.LogError($"Failed to delete media with ID: {id}");
        }
    }
    
    public override void Dispose()
    {
        _channel.Close();
        _connection.Close();
        base.Dispose();
    }
}