using User.Domain;

namespace User.Application.Common;

public interface IUserRepository
{
    public Task<Users?> GetUserByUsername(String username);
    public Task<Users?> ChangePassword(Users users, string password);
    public Task<Users?> GetUserByEmail(string email);
    public Task<Report?> SubmitReport(Report report);
    public Task<Report_Media?> SubmitReportMedia(Report_Media report_media);
    public Task<List<Report>> GetUserReports(string username);
    public Task<User_Report?> SubmitUserReport(User_Report user_report);
}