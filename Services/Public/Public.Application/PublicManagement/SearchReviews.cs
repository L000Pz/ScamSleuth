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
        var titleResult = await _publicRepository.SearchReviewTitle(input);
        var contentResult = await _publicRepository.SearchReviewContent(input);
        if (titleResult is null && contentResult is null)
        {
            return null;
        }

        if (titleResult is not null && contentResult is null)
        {
            return titleResult;
        }

        if (titleResult is null && contentResult is not null)
        {
            return contentResult;
        }

        var combinedResults = titleResult.Concat(contentResult).ToList();
        return combinedResults;
    }

}