using System.Text.RegularExpressions;
using IAM.Application.Common;
using IAM.Contracts;
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

    public async Task<AuthenticationResult?> Handle(RegisterDetails registerDetails)
    {
        if (!Regex.IsMatch(registerDetails.email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
        {
            return new AuthenticationResult(null,null,null,null,null,false, "emailFormat",null);
        }

        // Validate password length
        if (registerDetails.password.Length < 6)
        {
            return new AuthenticationResult(null,null,null,null,null,false, "passwordFormat",null);
        }



        if (await _userRepository.GetUserByUsername(registerDetails.username) is not null)
        {
            if (await _userRepository.GetAdminByUsername(registerDetails.username) is not null)
            {
                return new AuthenticationResult(null,null,null,null,null,false, "username",null);
            }
        }
        if (await _userRepository.GetUserByEmail(registerDetails.email) is not null)
        {
            if (await _userRepository.GetAdminByEmail(registerDetails.email) is not null)
            {
                return new AuthenticationResult(null,null,null,null,null,false, "username",null);
            }        
        }
        String code = _codeGenerator.GenerateCode();
        await _inMemoryRepository.Add(registerDetails.email,code);
        var user = Users.Create(registerDetails.username, registerDetails.name, registerDetails.email, _hasher.Hash(registerDetails.password));
        _userRepository.Add(user);
        String token = _jwtGenerator.GenerateToken(user);
        return new AuthenticationResult(user.user_id,user.username,user.email,user.name,null,user.is_verified, token,"user");
    }

    
}