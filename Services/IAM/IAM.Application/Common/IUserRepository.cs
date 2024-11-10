using IAM.Domain;
namespace IAM.Application.Common;

public interface IUserRepository
{
    void Add(Users users);
    Task<Users?> GetByEmail(string email);
    Task<Users?> GetByUsername(String username);
}