using IAM.Contracts;

namespace IAM.Application.AuthenticationService;

public interface IRegisterService
{
    Task<AuthenticationResult?> Handle(RegisterDetails registerDetails);
}