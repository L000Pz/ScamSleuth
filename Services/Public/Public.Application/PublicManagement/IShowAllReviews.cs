using Public.Domain;

namespace Public.Application.PublicManagement;

public interface IShowAllReviews
{
    public Task<List<Review>?> Handle();
}