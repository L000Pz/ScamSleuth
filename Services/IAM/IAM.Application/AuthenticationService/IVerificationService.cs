using IAM.Application.Common;
using IAM.Contracts;

namespace IAM.Application.AuthenticationService;

public interface IVerificationService
{
    Task<AuthenticationResult> Handle(VerificationDetails verificationDetails);
}