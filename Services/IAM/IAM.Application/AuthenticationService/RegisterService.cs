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

    public AuthenticationResult Handle(string firstName, string lastName)
    {
        if (_userRepository.GetByName(firstName) is not null)
        {
            throw new Exception("User already exists!");
        }
        var user = new User
        {
            FirstName = firstName,
            LastName = lastName
        };
        _userRepository.Add(user);

        var token = _jwtTokenGenerator.GenerateToken(user);

        return new AuthenticationResult(user, token);
    }
}