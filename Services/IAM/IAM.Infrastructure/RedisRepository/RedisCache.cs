using StackExchange.Redis;

namespace IAM.Infrastructure.RedisRepository;

public class RedisCache : IRedisCache
{
    private readonly IDatabase db;
    private readonly ConnectionMultiplexer redis;

    public RedisCache()
    {
        var retryCount = 0;
        const int maxRetries = 5;

        while (retryCount < maxRetries)
        {
            try
            {
                redis = ConnectionMultiplexer.Connect("redis:6379,password=admin,abortConnect=false");
                db = redis.GetDatabase();
                break;
            }
            catch (Exception ex)
            {
                retryCount++;
                if (retryCount == maxRetries)
                    throw new Exception($"Could not connect to Redis after {maxRetries} attempts", ex);
                
                Console.WriteLine($"Failed to connect to Redis (Attempt {retryCount}). Retrying in 5 seconds...");
                Thread.Sleep(5000);
            }
        }
    }

    public async Task Set(string key, string value)
    {
        TimeSpan timeSpan = TimeSpan.FromMinutes(3);
        await db.StringSetAsync(key, value, timeSpan);
    }

    public async Task<String?> Get(string key)
    {
        return await db.StringGetAsync(key);
    }

    public void Dispose()
    {
        redis?.Dispose();
    }
}