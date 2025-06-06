using Admin.Application.Common;
using Admin.Domain;

namespace Admin.Application.AdminManagement;

public class DeleteReview : IDeleteReview
{
    private readonly IAdminRepository _adminRepository;

    public DeleteReview(IAdminRepository adminRepository)
    {
        _adminRepository = adminRepository;
    }
    public async Task<(string status, List<int>? mediaIds)> Handle(int reviewId, string token)
    {
        Admins? admin = await _adminRepository.GetAdminByEmail(token);
        if (admin is null)
        {
            return ("writer", null);
        }

        Review? review = await _adminRepository.GetReviewById(reviewId);
        if (review is null)
        {
            return ("review", null);
            
        }
        List<int>? mediaIds = await _adminRepository.GetReviewMediaIds(review.review_content_id);

        bool mediaDeleted = await _adminRepository.DeleteReviewMedia(review.review_id);
        if (!mediaDeleted)
        {
            return ("media", null);
        }
        bool reviewDeleted = await _adminRepository.DeleteReview(reviewId);
        if (!reviewDeleted)
        {
            return ("review",null);
        }

        bool contentDeleted = await _adminRepository.DeleteReviewContent(review.review_content_id);
        if (!contentDeleted)
        {
            return ("content",null);
        }

        return ("ok",mediaIds);
    }
}