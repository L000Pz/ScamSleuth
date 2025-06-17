using Public.Domain;

namespace Public.Application.PublicManagement;

public interface IShowReviewComments
{
    public Task<List<ReviewComment>?> Handle(int review_id);
}