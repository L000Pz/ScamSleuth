using User.Domain;

namespace User.Application.Common;

public interface IUserRepository
{
    public Task<Users?> GetUserByUsername(String username);
    public Task<Users?> GetUserById(int user_id);
    public Task<Users?> ChangePassword(Users users, string password);
    public Task<Users?> GetUserByEmail(string email);
    public Task<Report?> SubmitReport(Report report);
    public Task<List<Report_Media>> SubmitReportMedia(List<Report_Media> report_media_list);
    public Task<List<Report>> GetUserReports(int user_id);
    public Task<bool> DeleteReport(int review_id);
    public Task<List<int>?> FindMediaId(int report_id);
    public Task<Report?> GetReportById(int report_id);
    public Task<List<Report_Media?>> GetReportMedia(int report_id);

}