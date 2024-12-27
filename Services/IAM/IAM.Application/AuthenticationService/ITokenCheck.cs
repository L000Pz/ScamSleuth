using IAM.Domain;

namespace IAM.Application.AuthenticationService;

public interface ITokenCheck
{
    public Task<Users?> Handle(String token);
}