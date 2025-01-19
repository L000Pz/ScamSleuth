using User.Domain;
using User.Application.Common;
using User.Contracts;

namespace User.Application.UserManagement;

public class ChangePassword : IChangePassword
{
    private readonly IUserRepository _userRepository;
    private readonly IHasher _hasher;

    public ChangePassword(IUserRepository userRepository,IHasher hasher)
    {
        _userRepository = userRepository;
        _hasher = hasher;
    }
    public async Task<string?> Handle(PasswordChange passwordChange)
    {
        Users? user = await _userRepository.GetUserByEmail(passwordChange.email);
        if (user is null)
        {
            return null;
        }
        if (passwordChange.password.Length < 6)
        {
            return "format";
        }
        Users? newPassUser = await _userRepository.ChangePassword(user, _hasher.Hash(passwordChange.password));
        return "Password has been changed successfully!";
    }

}