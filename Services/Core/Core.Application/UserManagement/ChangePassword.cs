using Core.Application.Common;
using Core.Domain;

namespace Core.Application.UserManagement;

public class ChangePassword : IChangePassword
{
    private readonly IUserRepository _userRepository;
    private readonly IHasher _hasher;

    public ChangePassword(IUserRepository userRepository,IHasher hasher)
    {
        _userRepository = userRepository;
        _hasher = hasher;
    }
    public async Task<string?> Handle(Users users, string password)
    {
        Users? user = await _userRepository.GetUserByUsername(users.username);
        if (user is null)
        {
            return null;
        }
        if (password.Length < 6)
        {
            return "format";
        }
        Users? newPassUser = await _userRepository.ChangePassword(user, _hasher.Hash(password));
        return "ok";
    }

}