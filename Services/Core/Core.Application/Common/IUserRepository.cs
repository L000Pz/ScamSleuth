using Core.Domain;

namespace Core.Application.Common;

public interface IUserRepository
{
    public Task<Domain.Users?> GetUserByUsername(String username);
    public Task<Domain.Users?> ChangePassword(Users users, string password);
}