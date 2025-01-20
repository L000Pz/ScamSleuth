using Admin.Domain;

namespace Admin.Application.AdminManagement;

public interface IShowAllReports
{
    public Task<List<Report>?> Handle();

}