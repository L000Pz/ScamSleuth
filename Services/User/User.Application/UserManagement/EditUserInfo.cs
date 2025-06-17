using User.Application.Common;
using User.Contracts;

namespace User.Application.UserManagement;

public class EditUserInfo : IEditUserInfo
{
    private readonly IHasher _hasher;
    private readonly IUserRepository _userRepository;

    public EditUserInfo(IUserRepository userRepository, IHasher hasher)
    {
        _userRepository = userRepository;
        _hasher = hasher;
    }

    public async Task<string?> Handle(EditInfo editInfo)
    {
        var user = await _userRepository.GetUserByEmail(editInfo.email);
        if (user is null) return null;
        if (user.password != _hasher.Hash(editInfo.old_password)) return "password";

        if (editInfo.new_username != null)
        {
            var username_check_user = await _userRepository.GetUserByUsername(editInfo.new_username);
            var username_check_admin = await _userRepository.GetAdminByUsername(editInfo.new_username);
            if (username_check_user != null || username_check_admin != null) return "username";

            var newUsername = await _userRepository.ChangeUsername(user, editInfo.new_username);
        }

        if (editInfo.new_name != null)
        {
            var newName = await _userRepository.ChangeName(user, editInfo.new_name);
        }

        if (editInfo.new_profile_picture_id != null)
        {
            var newPicture = await _userRepository.ChangeProfilePicture(user, (int)editInfo.new_profile_picture_id);
        }

        if (editInfo.new_password != null)
        {
            if (editInfo.new_password.Length < 6) return "format";

            var newPass = await _userRepository.ChangePassword(user, _hasher.Hash(editInfo.new_password));
        }

        return "User's information has been changed successfully!";
    }
}