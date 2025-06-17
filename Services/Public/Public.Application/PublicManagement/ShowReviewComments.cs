using Public.Application.Common;
using Public.Domain;

namespace Public.Application.PublicManagement;

public class ShowReviewComments : IShowReviewComments
{
    private readonly IPublicRepository _publicRepository;

    public ShowReviewComments(IPublicRepository publicRepository)
    {
        _publicRepository = publicRepository;
    }

    public async Task<List<ReviewComment>?> Handle(int review_id)
    {
        Review? review = await _publicRepository.GetReviewById(review_id);
        if (review is null)
        {
            return null;
        }
        var comments = await _publicRepository.GetAllReviewComments(review_id);
        return comments;
    }
}