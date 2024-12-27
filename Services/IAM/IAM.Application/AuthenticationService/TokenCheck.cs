using IAM.Application.Common;
using IAM.Domain;

namespace IAM.Application.AuthenticationService;

public class TokenCheck : ITokenCheck
{
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IUserRepository _userRepository;

    public TokenCheck(IJwtTokenGenerator jwtGenerator, IUserRepository userRepository)
    {
        _jwtTokenGenerator = jwtGenerator;
        _userRepository = userRepository;
    }

    public async Task<Users?> Handle(string token)
    {
        String? email = _jwtTokenGenerator.GetEmail(token);
        if (email is null)
        {
            return null;
        }
        Users? user = await _userRepository.GetUserByEmail(email);
        return user;
    }
}