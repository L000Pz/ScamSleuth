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

        // Add retry logic for initial connection
        int retryCount = 0;
        const int maxRetries = 5;
        Exception? lastException = null;

        while (retryCount < maxRetries)
        {
            try
            {
                Console.WriteLine($"Attempting to connect to RabbitMQ at {factory.HostName}:{factory.Port} (Attempt {retryCount + 1})");
                _connection = factory.CreateConnection();
                _channel = _connection.CreateModel();

                _channel.ExchangeDeclare(ExchangeName, ExchangeType.Direct, durable: true);
                _channel.QueueDeclare(QueueName, durable: true, exclusive: false, autoDelete: false);
                _channel.QueueBind(QueueName, ExchangeName, RoutingKey);
                
                Console.WriteLine("Successfully connected to RabbitMQ publisher");
                return;
            }
            catch (Exception ex)
            {
                lastException = ex;
                retryCount++;
                if (retryCount < maxRetries)
                {
                    Console.WriteLine($"Failed to connect to RabbitMQ (Attempt {retryCount}). Retrying in 5 seconds...");
                    Thread.Sleep(5000); // Wait 5 seconds before retrying
                }
            }
        }

        throw new Exception($"Failed to connect to RabbitMQ after {maxRetries} attempts", lastException);
    }

    public void PublishMediaDeletion(int mediaId)
    {
        try
        {
            var body = BitConverter.GetBytes(mediaId);

            _channel.BasicPublish(
                exchange: ExchangeName,
                routingKey: RoutingKey,
                basicProperties: null,
                body: body);
        
            Console.WriteLine($"Published deletion message for media ID: {mediaId}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error publishing message for media ID {mediaId}: {ex.Message}");
            throw; // Re-throw to let the caller handle the error
        }
    }

    public void Dispose()
    {
        try
        {
            _channel?.Dispose();
            _connection?.Dispose();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error disposing RabbitMQ connections: {ex.Message}");
        }
    }
}