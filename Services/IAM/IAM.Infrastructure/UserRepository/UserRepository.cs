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

    public async Task Update(Users users)
    { 
        _context.users.Update(users);
        await _context.SaveChangesAsync();
    }

    public async Task DelUser(Users users)
    {
        _context.users.Remove(users);
        await _context.SaveChangesAsync();
    }

}