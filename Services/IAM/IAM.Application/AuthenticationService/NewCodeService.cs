using IAM.Application.Common;
using IAM.Contracts;
using IAM.Domain;

namespace IAM.Application.AuthenticationService;

public class NewCodeService : INewCodeService
{
    private readonly IJwtTokenGenerator _jwtGenerator;
    private readonly IInMemoryRepository _inMemoryRepository;
    private readonly ICodeGenerator _codeGenerator;
    private readonly IUserRepository _userRepository;

    public NewCodeService( IJwtTokenGenerator jwtGenerator, IInMemoryRepository inMemoryRepository, ICodeGenerator codeGenerator, IUserRepository userRepository)
    {
        _jwtGenerator = jwtGenerator;
        _inMemoryRepository = inMemoryRepository;
        _codeGenerator = codeGenerator;
        _userRepository = userRepository;
    }

    public async Task<AuthenticationResult> Generate(string token)
    {
        // extract username from token
        String? username = _jwtGenerator.GetUsername(token);
        // check if token or phone number is valid
        if (username is null)
        {
            return new AuthenticationResult(null,"invalidToken");
        }
        Users? user = await _userRepository.GetByUsername(username);
        if (user is null)
        {
            return new AuthenticationResult(null, "invalidUser");
        }
        return new AuthenticationResult(user,token);
    }
}