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

    public async Task<String> Generate(string token)
    {
        // extract username from token
        String? email = _jwtGenerator.GetEmail(token);
        Console.WriteLine("here");
        Console.WriteLine(email);
        // check if token or phone number is valid
        if (email is null)
        {
            return "invalidToken";
        }
        
        Users? user = await _userRepository.GetUserByEmail(email);
        if (user is null)
        {
            return "invalidUser";
        }
        string code = _codeGenerator.GenerateCode();
        await _inMemoryRepository.Add(email,code);
        return "ok";
    }
}