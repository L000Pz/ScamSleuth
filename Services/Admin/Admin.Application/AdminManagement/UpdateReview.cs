using Admin.Application.Common;
using Admin.Domain;

namespace Admin.Application.AdminManagement;

public class UpdateReview : IUpdateReview
{
    private readonly IAdminRepository _adminRepository;

    public UpdateReview(IAdminRepository adminRepository)
    {
        _adminRepository = adminRepository;
    }

    public async Task<String?> HandleReviewContent(int review_id, string new_content, string email)
    {
        Admins? admin = await _adminRepository.GetAdminByEmail(email);
        if (admin is null)
        {
            return "admin";
        }
        Review? review = await _adminRepository.GetReviewById(review_id);
        if (review is null)
        {
            return "review";
        }
        Review_Content new_review_content = Review_Content.Create(review.review_content_id, new_content);
        var result = await _adminRepository.UpdateReviewContent(new_review_content);
        if (result == false)
        {
            return "invalid";
        }
        return "ok";
    }
    public async Task<String?> HandleReviewTitle(int review_id, string new_title, string email)
    {
        Admins? admin = await _adminRepository.GetAdminByEmail(email);
        if (admin is null)
        {
            return "admin";
        }
        Review? review = await _adminRepository.GetReviewById(review_id);
        if (review is null)
        {
            return "review";
        }
        var result = await _adminRepository.UpdateReviewTitle(review_id,new_title);
        if (result == false)
        {
            return "invalid";
        }
        return "ok";
    }
    
}