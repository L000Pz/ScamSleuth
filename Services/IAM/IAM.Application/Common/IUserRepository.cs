using IAM.Domain;
namespace IAM.Application.Common;

public interface IUserRepository
{
    void Add(User user);
    User? GetByName(string firstName);
}