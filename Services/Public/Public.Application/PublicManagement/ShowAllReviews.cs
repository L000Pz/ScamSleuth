using Public.Application.Common;
using Public.Domain;

namespace Public.Application.PublicManagement;

public class ShowAllReviews : IShowAllReviews
{
    private readonly IPublicRepository _publicRepository;

    public ShowAllReviews(IPublicRepository publicRepository)
    {
        _publicRepository = publicRepository;
    }

    public async Task<List<Review>?> Handle()
    {
        var reviews = await _publicRepository.GetAllReviews();
        return reviews;
    }

}