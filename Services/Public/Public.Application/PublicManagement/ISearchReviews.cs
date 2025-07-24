using Public.Domain;

namespace Public.Application.PublicManagement;

public interface ISearchReviews
{
    public Task<List<Review>?> Handle(string input);
}