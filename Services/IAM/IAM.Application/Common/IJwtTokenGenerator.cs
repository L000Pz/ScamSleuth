using IAM.Domain;

namespace IAM.Application.Common;

public interface IJwtTokenGenerator
{
    string GenerateToken(Users user);
    string GenerateToken(Admins admin);

    public string? GetEmail(string token);

}