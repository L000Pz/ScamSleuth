using IAM.Application.Common;
using IAM.Domain;
using Microsoft.EntityFrameworkCore;

namespace IAM.Infrastructure.UserRepository;

public class UserRepository : IUserRepository
{
    private readonly PostgreSqlContext _context;

    public UserRepository(PostgreSqlContext context)
    {
        _context = context;
    }

    public void Add(Users users)
    {
        _context.users.Add(users);
        _context.SaveChanges();
    }


    public async Task<Users?> GetByEmail(string email)
    {
        return _context.users.SingleOrDefault(user => user.email == email);

    }
    
    public async Task<Users?> GetByUsername(string username)
    {
        return _context.users.SingleOrDefault(user => user.username == username);

    }
    
    public async Task<Users?> GetByUserId(int user_id)
    {
        return _context.users.SingleOrDefault(user => user.user_id == user_id);

    }
    
}