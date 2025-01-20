using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Microsoft.Extensions.Hosting;
using System.Text;
using System.Text.Json;
using Media.Application.Media;
using Media.Contracts;

namespace Media.Presentation.Services;

public class RabbitMQConsumer : BackgroundService
{
    private readonly IConnection _connection;
    private readonly IModel _channel;
    private readonly IServiceProvider _serviceProvider;
    private const string ExchangeName = "media_exchange";
    private const string QueueName = "media_deletion_queue";
    private const string RoutingKey = "media.deletion";

    public RabbitMQConsumer(IConfiguration configuration, IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
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

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var consumer = new EventingBasicConsumer(_channel);

        consumer.Received += async (model, ea) =>
        {
            try 
            {
                var body = ea.Body.ToArray();
                var message = JsonSerializer.Deserialize<MediaDeletion>(Encoding.UTF8.GetString(body));

                using (var scope = _serviceProvider.CreateScope())
                {
                    var deleteMedia = scope.ServiceProvider.GetRequiredService<IDeleteMedia>();
                    await deleteMedia.Delete(message.media_id);
                }

                // Acknowledge the message
                _channel.BasicAck(ea.DeliveryTag, false);
            }
            catch (Exception ex)
            {
                // Log the error
                Console.WriteLine($"Error processing message: {ex}");
                // Reject the message and requeue it
                _channel.BasicNack(ea.DeliveryTag, false, true);
            }
        };

        _channel.BasicConsume(queue: QueueName,
                            autoAck: false,
                            consumer: consumer);

        return Task.CompletedTask;
    }

    public override void Dispose()
    {
        _channel?.Dispose();
        _connection?.Dispose();
        base.Dispose();
    }
}