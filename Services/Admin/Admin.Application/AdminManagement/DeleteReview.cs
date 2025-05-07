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
    public async Task<string> Handle(int reviewId, string token)
    {
        Admins? admin = await _adminRepository.GetAdminByEmail(token);
        if (admin is null)
        {
            return "writer";
        }

        Review? review = await _adminRepository.GetReviewById(reviewId);
        if (review is null)
        {
            return "review";
        }

        bool reviewDeleted = await _adminRepository.DeleteReview(reviewId);
        if (!reviewDeleted)
        {
            return "review";
        }

        bool contentDeleted = await _adminRepository.DeleteReviewContent(review.review_content_id);
        if (!contentDeleted)
        {
            return "content";
        }

        return "ok";
    }
}