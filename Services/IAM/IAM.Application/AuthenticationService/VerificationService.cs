using IAM.Application.Common;
using IAM.Domain;
using Microsoft.AspNetCore.Http.HttpResults;

namespace IAM.Application.AuthenticationService;

public class VerificationService : IVerificationService
{
    private readonly IInMemoryRepository _inMemoryRepository;
    private readonly IJwtTokenGenerator _jwtGenerator;
    private readonly IUserRepository _userRepository;

    public VerificationService(IInMemoryRepository inMemoryRepository, IJwtTokenGenerator jwtGenerator, IUserRepository userRepository)
    {
        _inMemoryRepository = inMemoryRepository;
        _jwtGenerator = jwtGenerator;
        _userRepository = userRepository;
    }

    public async Task<AuthenticationResult> Handle(string token, string code)
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
        // get code from cache database
        String? result = await _inMemoryRepository.Get(user.username.ToString());
        // check if code exists
        if (result is null)
        {
            return new AuthenticationResult(null,"codeExpired");
        }
        // check if code is correct
        if (!result.Equals(code))
        {
            return new AuthenticationResult(null, "invalidCode");
        }
        // veify user
        user.verify();
        await _userRepository.Update(user);
        return new AuthenticationResult(user,token);
    }
}