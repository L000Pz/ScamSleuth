using IAM.Application.Common;
using IAM.Domain;

namespace IAM.Application.AuthenticationService;

public class RegisterService : IRegisterService
{
    private readonly IUserRepository _userRepository;

    public RegisterService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
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

        var token = "123";

        return new AuthenticationResult(user, token);
    }
}