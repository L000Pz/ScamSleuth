using User.Domain;
using User.Application.Common;
using User.Contracts;

namespace User.Application.UserManagement;

public class EditUserInfo : IEditUserInfo
{
    private readonly IUserRepository _userRepository;
    private readonly IHasher _hasher;

    public EditUserInfo(IUserRepository userRepository,IHasher hasher)
    {
        _userRepository = userRepository;
        _hasher = hasher;
    }
    public async Task<string?> Handle(EditInfo editInfo)
    {
        Users? user = await _userRepository.GetUserByEmail(editInfo.email);
        if (user is null)
        {
            return null;
        }
        if (user.password != _hasher.Hash(editInfo.old_password))
        {
            return "password";
        }
        
        if (editInfo.new_username != null)
        {
            Users? username_check_user = await _userRepository.GetUserByUsername(editInfo.new_username);
            Admins? username_check_admin = await _userRepository.GetAdminByUsername(editInfo.new_username);
            if ((username_check_user != null) || (username_check_admin != null)) 
            {
                return "username";
            }

            Users? newUsername = await _userRepository.ChangeUsername(user, editInfo.new_username);
        }

        if (editInfo.new_name != null)
        {
            Users? newName = await _userRepository.ChangeName(user, editInfo.new_name);
        }

        if (editInfo.new_password != null)
        {
            if (editInfo.new_password.Length < 6)
            {
                return "format";
            }
                    
            Users? newPass = await _userRepository.ChangePassword(user, _hasher.Hash(editInfo.new_password));
        }
        
        return "User's information has been changed successfully!";
    }

}