using IAM.Application.Common;
using IAM.Contracts;

namespace IAM.Application.AuthenticationService;

public interface IVerificationService
{
    Task<String> Handle(VerificationDetails verificationDetails);
}