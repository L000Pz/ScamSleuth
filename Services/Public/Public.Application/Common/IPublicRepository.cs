using Public.Domain;

namespace Public.Application.Common;

public interface IPublicRepository
{
    public Task<List<Review>?> GetAllReviews();
    public Task<List<Review>?> GetRecentReviews(int numberOfReviews);
    public  Task<Review_Banner?> GetReviewBanner(int review_id);
    public Task<List<Review_Content_Media?>> GetReviewContentMedia(int review_content_id);
    public Task<Review_Content?> GetReviewContent(int review_content_id);
    public Task<Admin_Review?> GetReviewWriter(int review_id);
    public Task<Review?> GetReviewById(int review_id);
    public Task<List<Scam_Type>?> GetAllScamTypes();
    public Task<Scam_Type?> GetScamTypeById(int scam_type_id);
}