using Public.Application.Common;
using Public.Contracts;
using Public.Domain;

namespace Public.Application.PublicManagement;

public class GetUrlRating : IGetUrlRating
{
    private readonly IPublicRepository _publicRepository;

    public GetUrlRating(IPublicRepository publicRepository)
    {
        _publicRepository = publicRepository;
    }

    public async Task<UrlRatings?> Handle(string url_path)
    {
        UrlStorage? url = await _publicRepository.GetUrl(url_path);
        if (url is null)
        {
            return null;
        }

        double average = await _publicRepository.GetAverageRatingUrl(url.url_id);
        int count = await _publicRepository.GetNumberOfCommentsUrl(url.url_id);
        int five = await _publicRepository.GetNumberOf5Url(url.url_id);
        int four = await _publicRepository.GetNumberOf4Url(url.url_id);
        int three = await _publicRepository.GetNumberOf3Url(url.url_id);
        int two = await _publicRepository.GetNumberOf2Url(url.url_id);
        int one = await _publicRepository.GetNumberOf1Url(url.url_id);
        var ratings = new UrlRatings(average, count, five, four, three, two, one);
        return ratings;
    }
}