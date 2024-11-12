using IAM.Application.Common;
using IAM.Domain;

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

    public async Task<bool> Handle(string token, string code)
    {
        // extract username from token
        String? username = _jwtGenerator.GetUsername(token);
        // check if token or phone number is valid
        if (username is null)
        {
            throw new Exception("Token is invalid!");
        }
        Users? user = await _userRepository.GetByUsername(username);
        if (user is null)
        {
            throw new Exception("User doesn't exist!");
        }
        // get code from cache database
        String? result = await _inMemoryRepository.Get(user.user_id.ToString());
        // check if code exists
        if (result is null)
        {
            throw new Exception("Code expired. Please request for a new code.");
        }
        // check if code is correct
        else if (!result.Equals(code))
        {
            throw new Exception("Invalid code!");
        }
        // veify user
        user.verify();
        await _userRepository.Update(user);
        return true;
    }
}