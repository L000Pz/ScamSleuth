namespace Admin.Application.Common;

public interface IAdminRepository
{
    public Task<Users?> GetUserByEmail(string email);
    public Task<Report?> SubmitReport(Report report);
    public Task<Report_Media?> SubmitReportMedia(Report_Media report_media);
    public Task<List<Report>> GetAllReports();
    public Task<User_Report?> SubmitUserReport(User_Report user_report);
}