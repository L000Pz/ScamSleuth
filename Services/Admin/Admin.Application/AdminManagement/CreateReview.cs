using Admin.Application.Common;
using Admin.Contracts;
using Admin.Domain;

namespace Admin.Application.AdminManagement;

public class CreateReview:ICreateReview
{
    private readonly IAdminRepository _adminRepository;

    public CreateReview(IAdminRepository adminRepository)
    {
        _adminRepository = adminRepository;
    }
    public async Task<string> Handle(ReviewCreation reviewCreation, string token)
    {
        Review_Content content = Review_Content.Create(reviewCreation.content);
        Review_Content? reviewContent = await _adminRepository.SubmitReviewContent(content);
        if (reviewContent is null)
        {
            return "content";
        }
        Review review = Review.Create(reviewCreation.title,reviewCreation.scam_type_id,reviewCreation.review_date,reviewContent.review_content_id);
        Review? newReview=  await _adminRepository.SubmitReview(review);
        if (newReview is null)
        {
            return "review";
        }
        Admins? writer = await _adminRepository.GetAdminByEmail(token);
        if (writer is null)
        {
            return "writer";
        }
        return "ok";
    }
}