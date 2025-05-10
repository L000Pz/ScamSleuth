using IAM.Application.Common;
using IAM.Contracts;
using IAM.Domain;

namespace IAM.Application.AuthenticationService;

public class LoginService : ILoginService
{    
    private readonly IUserRepository _userRepository;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IHasher _hasher;

    public LoginService(IUserRepository userRepository, IJwtTokenGenerator jwtTokenGenerator, IHasher hasher)
    {
        _userRepository = userRepository;
        _jwtTokenGenerator = jwtTokenGenerator;
        _hasher = hasher;
    }

    public async Task<AuthenticationResult?> Handle(LoginDetails loginDetails)
    {
        Users? existingUser = await _userRepository.GetUserByEmail(loginDetails.email);

        if (existingUser is null)
        {
            return null;
        }
        
        // Verify password
        if (!existingUser.password.Equals(_hasher.Hash(loginDetails.password)))
        {
            return new AuthenticationResult(null,null,null,null,null,false,"incorrect", null);
        }

        // Generate token
        string token = _jwtTokenGenerator.GenerateToken(existingUser);
        return new AuthenticationResult(existingUser.user_id,existingUser.username,existingUser.email,existingUser.name,existingUser.profile_picture_id,existingUser.is_verified, token,"user");
    }
    
    public async Task<AdminAuthenticationResult?> HandleAdmin(LoginDetails loginDetails)
    {
        Admins? existingAdmin = await _userRepository.GetAdminByEmail(loginDetails.email);

        if (existingAdmin is null)
        {
            return null;
        }
        
        // Verify password
        if (!existingAdmin.password.Equals(_hasher.Hash(loginDetails.password)))
        {
            return new AdminAuthenticationResult(null,null,null,null,null,null,null,"incorrect", null);
        }

        // Generate token
        string token = _jwtTokenGenerator.GenerateToken(existingAdmin);
        return new AdminAuthenticationResult(existingAdmin.admin_id,existingAdmin.username,existingAdmin.email,existingAdmin.name,existingAdmin.contact_info,existingAdmin.bio,existingAdmin.profile_picture_id, token,"admin");
    }
}