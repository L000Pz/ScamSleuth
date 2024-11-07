using IAM.Application.Common;
using IAM.Domain;
namespace IAM.Infrastructure;

public class UserRepositoryInMemory : IUserRepository
{
    private static readonly List<User> _users = new();

    public void Add(User user)
    {
        _users.Add(user);
    }

    public User? GetByName(string firstName)
    {
        return _users.SingleOrDefault(x => x.FirstName == firstName);
    }
}