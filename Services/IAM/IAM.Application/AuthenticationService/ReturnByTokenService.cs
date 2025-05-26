using IAM.Application.Common;
using IAM.Contracts;
using IAM.Domain;

namespace IAM.Application.AuthenticationService;

public class ReturnByTokenService : IReturnByTokenService
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public ReturnByTokenService(IUserRepository userRepository,IJwtTokenGenerator jwtTokenGenerator)
    {
        _userRepository = userRepository;
        _jwtTokenGenerator = jwtTokenGenerator;
    }
    
    public async Task<AuthenticationResult?> Handle(string token)
    {
        String? email = _jwtTokenGenerator.GetEmail(token);
        if (email is null)
        {
            return null;
        }
        Users? user = await _userRepository.GetUserByEmail(email);
        if (user is null)
        {
            return null;
        }
        return new AuthenticationResult(user.user_id,user.username,user.email,user.name,user.profile_picture_id,user.is_verified,token,"user");
    }
    
    public async Task<AdminAuthenticationResult?> HandleAdmin(string token)
    {
        String? email = _jwtTokenGenerator.GetEmail(token);
        if (email is null)
        {
            return null;
        }
        Admins? admin = await _userRepository.GetAdminByEmail(email);
        if (admin is null)
        {
            return null;
        }
        return new AdminAuthenticationResult(admin.admin_id,admin.username,admin.email,admin.name,admin.contact_info,admin.bio,admin.profile_picture_id,token,"admin");
    }
}