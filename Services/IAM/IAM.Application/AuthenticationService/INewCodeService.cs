using IAM.Contracts;

namespace IAM.Application.AuthenticationService;

public interface INewCodeService
{
    Task<AuthenticationResult> Generate(string token);
}