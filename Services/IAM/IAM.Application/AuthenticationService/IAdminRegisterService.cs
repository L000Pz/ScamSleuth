using IAM.Contracts;

namespace IAM.Application.AuthenticationService;

public interface IAdminRegisterService
{
    Task<AdminAuthenticationResult?> Handle(AdminRegisterDetails adminRegisterDetails);

}