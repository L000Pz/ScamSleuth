using IAM.Application.Common;

namespace IAM.Application.AuthenticationService;

public interface IVerificationService
{
    Task<AuthenticationResult> Handle(string token, string code);
}