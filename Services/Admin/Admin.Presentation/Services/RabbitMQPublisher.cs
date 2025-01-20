using RabbitMQ.Client;
using System.Text;
using System.Text.Json;

namespace Admin.Presentation.Services;

public interface IMessagePublisher
{
    void PublishMediaDeletion(int mediaId);
}

public class RabbitMQPublisher : IMessagePublisher, IDisposable
{
    private readonly IConnection _connection;
    private readonly IModel _channel;
    private const string ExchangeName = "media_exchange";
    private const string QueueName = "media_deletion_queue";
    private const string RoutingKey = "media.deletion";

    public RabbitMQPublisher(IConfiguration configuration)
    {
        var factory = new ConnectionFactory
        {
            HostName = configuration["RabbitMQ:Host"] ?? "localhost",
            Port = int.Parse(configuration["RabbitMQ:Port"] ?? "5672"),
            UserName = configuration["RabbitMQ:Username"] ?? "guest",
            Password = configuration["RabbitMQ:Password"] ?? "guest"
        };

        _connection = factory.CreateConnection();
        _channel = _connection.CreateModel();

        _channel.ExchangeDeclare(ExchangeName, ExchangeType.Direct, durable: true);
        _channel.QueueDeclare(QueueName, durable: true, exclusive: false, autoDelete: false);
        _channel.QueueBind(QueueName, ExchangeName, RoutingKey);
    }

    public void PublishMediaDeletion(int mediaId)
    {
        // Convert the mediaId directly to bytes
        var body = BitConverter.GetBytes(mediaId);

        _channel.BasicPublish(
            exchange: ExchangeName,
            routingKey: RoutingKey,
            basicProperties: null,
            body: body);
    
        Console.WriteLine($"Published deletion message for media ID: {mediaId}");
    }

    public void Dispose()
    {
        _channel?.Dispose();
        _connection?.Dispose();
    }
}