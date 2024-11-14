namespace IAM.Infrastructure.RedisRepository;

public interface IRedisCache
{
    Task Set(String key,String value);
    Task<String?> Get(String key);
}