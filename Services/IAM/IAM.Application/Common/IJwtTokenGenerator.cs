using IAM.Domain;

namespace IAM.Application.Common;

public interface IJwtTokenGenerator
{
    string GenerateToken(Users user);
    public string? GetUsername(string token);

}