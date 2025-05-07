using Public.Application.Common;
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
        return new ReviewDetails
        {
            Review = review,
            Content = content.review_content,
        };
    }
}