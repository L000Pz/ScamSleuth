using Public.Domain;

namespace Public.Application.PublicManagement;

public interface IShowRecentReviews
{
    public Task<List<Review>?> Handle(int numberOfReviews);
}