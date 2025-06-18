using Public.Application.Common;
using Public.Domain;

namespace Public.Application.PublicManagement;

public class ShowUrlComments : IShowUrlComments
{
    private readonly IPublicRepository _publicRepository;

    public ShowUrlComments(IPublicRepository publicRepository)
    {
        _publicRepository = publicRepository;
    }

    public async Task<List<UrlComment>?> Handle(int url_id)
    {
        UrlStorage? url = await _publicRepository.GetUrlById(url_id);
        if (url is null)
        {
            return null;
        }

        var comments = await _publicRepository.GetAllUrlComments(url_id);
        return comments;
    }
}