using Core.Domain;

namespace Core.Application.UserManagement;

public interface IChangePassword
{
    public Task<string?> Handle(Users users,string password);

}