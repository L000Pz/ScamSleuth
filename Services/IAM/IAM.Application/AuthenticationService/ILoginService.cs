namespace IAM.Application.AuthenticationService;

public interface ILoginService
{
    Task <AuthenticationResult?> Handle(string email, string password);
}