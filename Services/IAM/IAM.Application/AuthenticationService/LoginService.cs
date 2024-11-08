using IAM.Application.Common;

namespace IAM.Application.AuthenticationService;

public class LoginService : ILoginService
{
    public LoginService(IUserRepository userRepository, IJwtTokenGenerator jwtTokenGenerator)
    {
        _userRepository = userRepository;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    private readonly IUserRepository _userRepository;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    public AuthenticationResult Handle(string firstName, int code)
    {
        var existingUser = _userRepository.GetByName(firstName);
        if (existingUser is null)
        {
            throw new Exception("User not found!");
        }

        var token = _jwtTokenGenerator.GenerateToken(existingUser);
        return new AuthenticationResult(existingUser, token);
    }
}