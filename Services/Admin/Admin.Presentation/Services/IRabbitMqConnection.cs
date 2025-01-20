using RabbitMQ.Client;

namespace Admin.Presentation.Services;

public interface IRabbitMqConnection
{
    IConnection Connection { get; }
}