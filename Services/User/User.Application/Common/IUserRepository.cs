using User.Domain;

namespace User.Application.Common;

public interface IUserRepository
{
    public Task<Users?> GetUserByUsername(string username);
    public Task<Users?> GetUserById(int user_id);
    public Task<Users?> ChangePassword(Users users, string password);
    public Task<Users?> ChangeUsername(Users users, string username);
    public Task<Users?> ChangeName(Users users, string name);
    public Task<Users?> ChangeProfilePicture(Users users, int profile_picture_id);
    public Task<Users?> GetUserByEmail(string email);
    public Task<Report?> SubmitReport(Report report);
    public Task<List<Report_Media>> SubmitReportMedia(List<Report_Media> report_media_list);
    public Task<List<Report>> GetUserReports(int user_id);
    public Task<bool> DeleteReport(int review_id);
    public Task<Report?> GetReportById(int report_id);
    public Task<List<int>> GetReportMedia(int report_id);
    Task<Admins?> GetAdminByUsername(string username);
    public Task<ReviewComment?> WriteReviewComment(ReviewComment reviewComment);
    Task<Review?> GetReviewById(int review_id);
    Task<ReviewComment?> GetReviewCommentById(int? comment_id);
    Task<UrlComment?> WriteUrlComment(UrlComment urlComment);
    Task<UrlStorage?> GetUrlById(int url_id);
    Task<UrlComment?> GetUrlCommentById(int? comment_id);
}