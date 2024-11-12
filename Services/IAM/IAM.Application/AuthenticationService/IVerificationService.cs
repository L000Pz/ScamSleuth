using IAM.Application.Common;

namespace IAM.Application.AuthenticationService;

public interface IVerificationService
{
    Task<bool> Handle(string token, string code);
}