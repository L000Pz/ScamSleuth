using IAM.Application.Common;
using IAM.Domain;

namespace IAM.Infrastructure;

public class JwtTokenGenerator : IJwtTokenGenerator
{
    public string GenerateToken(User user)
    {
        return Guid.NewGuid().ToString();
    }
}