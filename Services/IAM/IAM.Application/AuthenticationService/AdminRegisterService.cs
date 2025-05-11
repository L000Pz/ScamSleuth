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
            return new AdminAuthenticationResult(null,null,null,null,null,null,null, "emailFormat",null);
        }

        // Validate password length
        if (adminRegisterDetails.password.Length < 6)
        {
            return new AdminAuthenticationResult(null,null,null,null,null,null,null, "passwordFormat",null);
        }



        if ((await _userRepository.GetAdminByUsername(adminRegisterDetails.username) is not null) || (await _userRepository.GetUserByUsername(adminRegisterDetails.username) is not null))
        { 
            return new AdminAuthenticationResult(null,null,null,null,null,null,null, "username",null);
        }
        if ((await _userRepository.GetAdminByEmail(adminRegisterDetails.email) is not null) || (await _userRepository.GetUserByEmail(adminRegisterDetails.email) is not null))
        { 
            return new AdminAuthenticationResult(null,null,null,null,null,null,null, "email",null);
        }

        Random random = new Random();
        int default_pfp = random.Next(1, 4);
        var admin = Admins.Create(adminRegisterDetails.username, adminRegisterDetails.name, adminRegisterDetails.email,adminRegisterDetails.contact_info, _hasher.Hash(adminRegisterDetails.password),default_pfp);
        _userRepository.AddAdmin(admin);
        String token = _jwtGenerator.GenerateToken(admin);
        return new AdminAuthenticationResult(admin.admin_id,admin.username,admin.email,admin.name,admin.contact_info,admin.bio,admin.profile_picture_id, token,"admin");
    }
}