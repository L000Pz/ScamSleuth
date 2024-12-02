using System.Text.RegularExpressions;
using IAM.Application.Common;
using IAM.Contracts;
using IAM.Domain;

namespace IAM.Application.AuthenticationService;

public class AdminRegisterService : IAdminRegisterService
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtTokenGenerator _jwtGenerator;
    private readonly IHasher _hasher;


    public AdminRegisterService(IUserRepository userRepository, IJwtTokenGenerator jwtGenerator, IHasher hasher)
    {
        _userRepository = userRepository;
        _jwtGenerator = jwtGenerator;
        _hasher = hasher;
    }

    public async Task<AdminAuthenticationResult?> Handle(AdminRegisterDetails adminRegisterDetails)
    {
        if (!Regex.IsMatch(adminRegisterDetails.email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
        {
            return new AdminAuthenticationResult(null, "emailFormat");
        }

        // Validate password length
        if (adminRegisterDetails.password.Length < 6)
        {
            return new AdminAuthenticationResult(null, "passwordFormat");
        }



        if (await _userRepository.GetAdminByUsername(adminRegisterDetails.username) is not null)
        {
            if (await _userRepository.GetUserByUsername(adminRegisterDetails.username) is not null)
            {
                return new AdminAuthenticationResult(null, "username");
            }
        }
        if (await _userRepository.GetAdminByEmail(adminRegisterDetails.email) is not null)
        {
            if (await _userRepository.GetUserByEmail(adminRegisterDetails.email) is not null)
            {
                return new AdminAuthenticationResult(null, "email");
            }        
        }

        var admin = Admins.Create(adminRegisterDetails.username, adminRegisterDetails.name, adminRegisterDetails.email,adminRegisterDetails.contact_info, _hasher.Hash(adminRegisterDetails.password));
        _userRepository.AddAdmin(admin);
        String token = _jwtGenerator.GenerateToken(admin);
        return new AdminAuthenticationResult(admin, token);
    }
}