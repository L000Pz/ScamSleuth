using Admin.Application.Common;
using Admin.Domain;

namespace Admin.Application.AdminManagement;

public class ShowAllReports:IShowAllReports
{
    private readonly IAdminRepository _adminRepository;

    public ShowAllReports(IAdminRepository adminRepository)
    {
        _adminRepository = adminRepository;
    }

    public async Task<List<Report>?> Handle()
    {
        var reviews = await _adminRepository.GetAllReports();
        return reviews;
    }
}