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
        List<Review_Content_Media> reviewMedia = Review_Content_Media.Create(newReview.review_content_id, reviewCreation.media);
        await _adminRepository.SubmitReviewMedia(reviewMedia);
        Admins? writer = await _adminRepository.GetAdminByEmail(token);
        if (writer is null)
        {
            return "writer";
        }
        Admin_Review userReport = Admin_Review.Create(newReview.review_id, writer.admin_id);
        await _adminRepository.SubmitAdminReview(userReport);
        return "ok";
    }
}