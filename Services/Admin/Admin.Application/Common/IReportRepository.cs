using Admin.Domain;

namespace Admin.Application.Common;

public interface IReportRepository
{
    public Task<Users?> GetUserById(int user_id);
    public Task<List<int>> GetReportMedia(int report_id);
    public Task<Report?> GetReportById(int report_id);
}