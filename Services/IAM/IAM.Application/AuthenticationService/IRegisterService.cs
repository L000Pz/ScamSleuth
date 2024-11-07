namespace IAM.Application.AuthenticationService;

public interface IRegisterService
{
    AuthenticationResult Handle(string firstName, string lastName);
}