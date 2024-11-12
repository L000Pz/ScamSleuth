using StackExchange.Redis;

namespace IAM.Infrastructure.RedisRepository;

public class RedisCache : IRedisCache
{
    static ConnectionMultiplexer redis = ConnectionMultiplexer.Connect("localhost:6379,password=admin,abortConnect=false"
    );
    static IDatabase db = redis.GetDatabase();
    public async Task Set(string key, string value)
    {
        TimeSpan timeSpan = TimeSpan.FromMinutes(3);
        db.StringSet(key, value,timeSpan);
    }

    public async Task<String?> Get(string key)
    {
        String? check = db.StringGet(key);
        return check;
    }
}