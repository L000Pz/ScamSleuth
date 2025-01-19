using User.Contracts;
using User.Domain;

namespace User.Application.UserManagement;

public interface IChangePassword
{
    public Task<string?> Handle(PasswordChange passwordChange);

}