using Core.Domain;

namespace Core.Application.UserManagement;

public interface IChangePassword
{
    public Task<string?> Handle(string email,string password);

}