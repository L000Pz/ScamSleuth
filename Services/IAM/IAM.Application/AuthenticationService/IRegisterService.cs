namespace IAM.Application.AuthenticationService;

public interface IRegisterService
{
    Task<AuthenticationResult?> Handle(string email, string username, string password, string name);
}