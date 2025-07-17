using Public.Contracts;
using Public.Domain;

namespace Public.Application.PublicManagement;

public interface IShowReviewComments
{
    public Task<List<ReviewCommentDetails>?> Handle(int review_id);
}