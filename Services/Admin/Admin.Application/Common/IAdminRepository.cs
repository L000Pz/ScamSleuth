using Admin.Domain;

namespace Admin.Application.Common;

public interface IAdminRepository
{
    public Task<Admins?> GetAdminByEmail(string email);
    public Task<List<Report>?> GetAllReports();

    public Task DeleteReview(int review_id);
    public Task<Review?> SubmitReview(Review review);
    public Task<Review_Content?> SubmitReviewContent(Review_Content reviewContent);
    public Task<Review_Banner?> SubmitReviewBanner(Review_Banner reviewBanner);
    public Task<Review_Content_Media?> SubmitReviewMedia(Review_Content_Media reviewContentMedia);
    public Task<Admin_Review?> SubmitAdminReview(Admin_Review adminReview);
}