using IAM.Application.Common;
using IAM.Domain;

namespace IAM.Application.AuthenticationService;

public class LoginService : ILoginService
{    
    private readonly IUserRepository _userRepository;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IHasher _hasher;
    public LoginService(IUserRepository userRepository, IJwtTokenGenerator jwtTokenGenerator,IHasher hasher)
    {
        _userRepository = userRepository;
        _jwtTokenGenerator = jwtTokenGenerator;
        _hasher = hasher;
    }
    public async Task <AuthenticationResult?> Handle(string email, string password)
    {
        Users? existingUser = await _userRepository.GetByEmail(email);       
        if (existingUser is null)
        {
            throw new Exception("User not found!");
        }
        if (!existingUser.password.Equals(_hasher.Hash(password))) 
        {
            return new AuthenticationResult(new Users(), "Incorrect Password!");
        }
        string token = _jwtTokenGenerator.GenerateToken(existingUser);
        return new AuthenticationResult(existingUser, token);
    }
}