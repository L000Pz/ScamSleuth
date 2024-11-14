using IAM.Contracts;

namespace IAM.Application.AuthenticationService;

public interface ILoginService
{
    Task <AuthenticationResult?> Handle(LoginDetails loginDetails);
    Task <AdminAuthenticationResult?> HandleAdmin(LoginDetails loginDetails);

}