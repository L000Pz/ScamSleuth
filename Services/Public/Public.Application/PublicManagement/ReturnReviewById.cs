using Public.Application.Common;
using Public.Contracts;
using Public.Domain;

namespace Public.Application.PublicManagement;

public class ReturnReviewById : IReturnReviewById
{
    private readonly IPublicRepository _publicRepository;

    public ReturnReviewById(IPublicRepository publicRepository)
    {
        _publicRepository = publicRepository;
    }

    public async Task<ReviewDetails?> Handle(int review_id)
    {
        var review = await _publicRepository.GetReviewById(review_id);
        if (review is null)
        {
            return null;
        }
        var content = await _publicRepository.GetReviewContent(review.review_content_id);
        if (content is null)
        {
            return null;
        }

        var writer = await _publicRepository.GetAdminById(review.writer_id);
        if (writer is null)
        {
            return null;
        }
        var media = await _publicRepository.GetReviewContentMedia(review.review_id);
        var writerDetails = new ReviewWriterDetails(writer.username, writer.name, writer.profile_picture_id,writer.contact_info);
        return new ReviewDetails
        {
            Review = review,
            Content = content.review_content,
            Media=media,
            ReviewWriterDetails = writerDetails
        };
    }
}