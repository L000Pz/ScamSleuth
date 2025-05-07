using Admin.Application.Common;
using Admin.Domain;

namespace Admin.Application.AdminManagement;

public class GetAdminReviews:IGetAdminReviews
{
    private readonly IAdminRepository _adminRepository;

    public GetAdminReviews(IAdminRepository adminRepository)
    {
        _adminRepository = adminRepository;
    }

    public async Task<List<Review>?> Handle(string token)
    {
        var admin = await _adminRepository.GetAdminByEmail(token);
        if (admin is null)
        {
            return null;
        }
        return await _adminRepository.GetAdminReviews(admin.admin_id);
    }
}