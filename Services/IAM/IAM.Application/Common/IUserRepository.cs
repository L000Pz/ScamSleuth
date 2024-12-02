using IAM.Domain;
namespace IAM.Application.Common;

public interface IUserRepository
{
    void Add(Users users);
    Task<Users?> GetUserByEmail(string email);
    Task<Admins?> GetAdminByEmail(string email);

    Task<Users?> GetUserByUsername(String username);
    Task<Admins?> GetAdminByUsername(String username);

    Task Update(Users user);
    void AddAdmin(Admins admins);


}