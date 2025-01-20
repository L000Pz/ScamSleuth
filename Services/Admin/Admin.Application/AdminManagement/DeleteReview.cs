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
        // First verify the admin exists
        Admins? admin = await _adminRepository.GetAdminByEmail(token);
        if (admin is null)
        {
            return ("writer", null);
        }

        // Get the review to verify it exists and get its content ID
        Review? review = await _adminRepository.GetReviewById(reviewId);
        if (review is null)
        {
            return ("review", null);
        }

        // Get media IDs before deleting the review
        List<int>? mediaIds = await _adminRepository.GetReviewMediaIds(review.review_content_id);
        
        // Delete in reverse order of creation to maintain referential integrity
        
        // 1. Delete from Admin_Review
        bool adminReviewDeleted = await _adminRepository.DeleteAdminReview(reviewId);
        if (!adminReviewDeleted)
        {
            return ("admin_review", null);
        }

        // 2. Delete from Review_Content_Media
        bool mediaDeleted = await _adminRepository.DeleteReviewMedia(review.review_content_id);
        if (!mediaDeleted)
        {
            return ("media", null);
        }

        // 3. Delete the Review
        bool reviewDeleted = await _adminRepository.DeleteReview(reviewId);
        if (!reviewDeleted)
        {
            return ("review", null);
        }

        // 4. Finally delete the Review_Content
        bool contentDeleted = await _adminRepository.DeleteReviewContent(review.review_content_id);
        if (!contentDeleted)
        {
            return ("content", null);
        }

        return ("ok", mediaIds);
    }
}