using IAM.Application.Common;
using IAM.Domain;

namespace IAM.Application.AuthenticationService;

public class RegisterService : IRegisterService
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtTokenGenerator _jwtGenerator;
    private readonly IHasher _hasher;
    private readonly ICodeGenerator _codeGenerator;
    private readonly IInMemoryRepository _inMemoryRepository;

    public RegisterService(IUserRepository userRepository, IJwtTokenGenerator jwtGenerator, IHasher hasher,ICodeGenerator codeGenerator, IInMemoryRepository inMemoryRepository)
    {
        _userRepository = userRepository;
        _jwtGenerator = jwtGenerator;
        _hasher = hasher;
        _codeGenerator = codeGenerator;
        _inMemoryRepository = inMemoryRepository;
    }

    public async Task<AuthenticationResult?> Handle(string email, string username, string password, string name)
    {

        if (await _userRepository.GetByUsername(username) is not null)
        {
            return new AuthenticationResult(new Users(), "username");
        }
        if (await _userRepository.GetByEmail(email) is not null)
        {
            return new AuthenticationResult(new Users(), "email");
        }
        
        String code = _codeGenerator.GenerateCode();
        await _inMemoryRepository.Add(username,code);
        var user = Users.Create(username, name, email, _hasher.Hash(password));
        _userRepository.Add(user);
        String token = _jwtGenerator.GenerateToken(user);
        return new AuthenticationResult(user, token);
    }

    
}