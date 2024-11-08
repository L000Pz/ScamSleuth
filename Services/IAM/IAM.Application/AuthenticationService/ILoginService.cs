namespace IAM.Application.AuthenticationService;

public interface ILoginService
{
    AuthenticationResult Handle(string firstName, int code);
}