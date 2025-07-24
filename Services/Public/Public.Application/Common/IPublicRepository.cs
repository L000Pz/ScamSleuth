using MongoDB.Bson;
using Public.Domain;

namespace Public.Application.Common;

public interface IPublicRepository
{
    public Task<List<Review>?> GetAllReviews();
    public Task<List<ReviewComment?>> GetAllReviewComments(int review_id);
    public Task<List<UrlComment?>> GetAllUrlComments(int url_id);
    public Task<List<Review>?> GetRecentReviews(int numberOfReviews);
    public Task<List<UrlComment?>> GetRecentUrlComments(int numberOfComments);
    public Task<Review_Content?> GetReviewContent(int review_content_id);
    public Task<Review?> GetReviewById(int review_id);
    public Task<UrlStorage?> GetUrl(string url);
    public Task<List<Scam_Type>?> GetAllScamTypes();
    public Task<Scam_Type?> GetScamTypeById(int scam_type_id);
    public Task<Admins?> GetAdminById(int admin_id);
    public Task<Users?> GetUserById(int user_id);
    public Task<List<Review_Content_Media?>> GetReviewContentMedia(int review_content_id);
    public Task<int> GetNumberOfCommentsUrl(int url_id);
    public Task<int> GetNumberOf5Url(int url_id);
    public Task<int> GetNumberOf4Url(int url_id);
    public Task<int> GetNumberOf3Url(int url_id);
    public Task<int> GetNumberOf2Url(int url_id);
    public Task<int> GetNumberOf1Url(int url_id);
    public Task<double> GetAverageRatingUrl(int url_id);
    public Task<UrlStorage?> GetUrlById(int url_id);
    public Task<bool> IncreaseView(int review_id);

}