using IAM.Application.Common;
using IAM.Domain;

namespace IAM.Application.AuthenticationService;

public class RegisterService : IRegisterService
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtTokenGenerator _jwtGenerator;
    private readonly IHasher _hasher;

    public RegisterService(IUserRepository userRepository, IJwtTokenGenerator jwtGenerator, IHasher hasher)
    {
        _userRepository = userRepository;
        _jwtGenerator = jwtGenerator;
        _hasher = hasher;
    }

    public async Task<AuthenticationResult?> Handle(string email, string username, string password, string name)
    {
        // check if user exists
        // check with username
        if (await _userRepository.GetByUsername(username) is not null)
        {
            return new AuthenticationResult(new Users(), "username");
            //throw new Exception("user with this username already exists");
        }
        // check with email
        if (await _userRepository.GetByEmail(email) is not null)
        {
            return new AuthenticationResult(new Users(), "email");
            //throw new Exception("user with this email address already exists");
        }
        
        var user = Users.Create(username, name, email, _hasher.Hash(password));
        // add user to database
         _userRepository.Add(user);
        // create token
        String token = _jwtGenerator.GenerateToken(user);

        // return newly created user
        return new AuthenticationResult(user, token);
    }

    
}