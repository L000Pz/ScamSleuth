using Public.Application.Common;
using Public.Domain;

namespace Public.Application.PublicManagement;

public class ShowRecentReviews : IShowRecentReviews
{
    private readonly IPublicRepository _publicRepository;

    public ShowRecentReviews(IPublicRepository publicRepository)
    {
        _publicRepository = publicRepository;
    }

    public async Task<List<Review>?> Handle(int numberOfReviews)
    {
        var reviews = await _publicRepository.GetRecentReviews(numberOfReviews);
        return reviews;
    }
}