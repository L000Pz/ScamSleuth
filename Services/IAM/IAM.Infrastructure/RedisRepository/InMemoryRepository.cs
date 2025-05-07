using IAM.Application.Common;

namespace IAM.Infrastructure.RedisRepository;

public class InMemoryRepository : IInMemoryRepository
{
        private readonly IRedisCache _db;

        public InMemoryRepository(IRedisCache db)
        {
            _db = db;
        }

        public async Task Add(string key,String code)
        {
            await _db.Set(key,code);
            Console.WriteLine("📳  New code: '" + code + "' generated for sign up.");
        }

        public async Task<String?> Get(string key)
        {
            return await _db.Get(key);
        }
}