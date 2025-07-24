using Public.Application.Common;
using Public.Domain;

namespace Public.Application.PublicManagement;

public class SearchReviews : ISearchReviews
{
    private readonly IPublicRepository _publicRepository;

    public SearchReviews(IPublicRepository publicRepository)
    {
        _publicRepository = publicRepository;
    }

    public async Task<List<Review>?> Handle(string input)
    {
        var result = await _publicRepository.SearchReviewTitle(input);
        if (result is null)
        {
            return null;
        }

        return result;
    }

}