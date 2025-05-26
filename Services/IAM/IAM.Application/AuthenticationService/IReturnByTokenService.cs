using IAM.Contracts;

namespace IAM.Application.AuthenticationService;

public interface IReturnByTokenService
{
    Task <AuthenticationResult?> Handle(string token);
    Task <AdminAuthenticationResult?> HandleAdmin(string token);
}