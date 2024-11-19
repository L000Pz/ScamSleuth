using IAM.Contracts;

namespace IAM.Application.AuthenticationService;

public interface INewCodeService
{
    Task<String> Generate(string token);
}