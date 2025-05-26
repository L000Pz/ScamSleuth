using Admin.Domain;

namespace Admin.Application.Common;

public interface IAdminRepository
{
    public Task<Admins?> GetAdminByEmail(string email);
    public Task<List<Report>?> GetAllReports();
    public Task<Review?> SubmitReview(Review review);
    public Task<Review_Content?> SubmitReviewContent(Review_Content reviewContent);
    public Task<Review_Banner?> SubmitReviewBanner(Review_Banner reviewBanner);
    public Task<List<Review>> GetAdminReviews(int writer_id);
    Task<Review?> GetReviewById(int review_id);
    Task<bool> DeleteReview(int review_id);
    Task<bool> DeleteReviewContent(int review_content_id);
    public Task<int> GetLastContentId();
    public Task<bool> UpdateReviewContent(Review_Content new_content);
    public Task<bool> UpdateReviewTitle(int review_id, string new_title);

}