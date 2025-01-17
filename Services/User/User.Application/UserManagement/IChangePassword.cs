using User.Domain;

namespace User.Application.UserManagement;

public interface IChangePassword
{
    public Task<string?> Handle(string email,string password);

}