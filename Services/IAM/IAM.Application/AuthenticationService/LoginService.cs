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
            return new AuthenticationResult(null, "incorrect");
        }

        // Generate token
        string token = _jwtTokenGenerator.GenerateToken(existingUser);
        return new AuthenticationResult(existingUser, token);
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
            return new AdminAuthenticationResult(null, "incorrect");
        }

        // Generate token
        string token = _jwtTokenGenerator.GenerateToken(existingAdmin);
        return new AdminAuthenticationResult(existingAdmin, token);
    }
}