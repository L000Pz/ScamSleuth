using IAM.Application.Common;
using IAM.Contracts;
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

    public async Task<String> Handle(VerificationDetails verificationDetails)
    {
        String? email = _jwtGenerator.GetEmail(verificationDetails.token);
        if (email is null)
        {
            return "invalidToken";
        }
        Users? user = await _userRepository.GetUserByEmail(email);
        if (user is null)
        {
            return "invalidUser";
        }
        String? result = await _inMemoryRepository.Get(user.email);
        if (result is null)
        {
            return "codeExpired";
        }
        if (!result.Equals(verificationDetails.code))
        {
            return"invalidCode";
        }
        user.verify();
        await _userRepository.Update(user);
        return "ok";
    }
}