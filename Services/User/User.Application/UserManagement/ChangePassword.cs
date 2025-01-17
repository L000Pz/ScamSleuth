using User.Domain;
using User.Application.Common;

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
    public async Task<string?> Handle(string email,string password)
    {
        Users? user = await _userRepository.GetUserByEmail(email);
        if (user is null)
        {
            return null;
        }
        if (password.Length < 6)
        {
            return "format";
        }
        Users? newPassUser = await _userRepository.ChangePassword(user, _hasher.Hash(password));
        return "Password has been changed successfully!";
    }

}