using IAM.Application.Common;
using IAM.Domain;

namespace IAM.Application.AuthenticationService;

public class RegisterService : IRegisterService
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public RegisterService(IUserRepository userRepository, IJwtTokenGenerator jwtTokenGenerator)
    {
        _userRepository = userRepository;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public AuthenticationResult Handle(string email, string lastName)
    {
        if (_userRepository.GetByEmail(email) is not null)
        {
            throw new Exception("User already exists!");
        }
        var users = new Users
        {
            email = email
                
        };
        _userRepository.Add(users);

        var token = _jwtTokenGenerator.GenerateToken(users);

        return new AuthenticationResult(users, token);
    }
}