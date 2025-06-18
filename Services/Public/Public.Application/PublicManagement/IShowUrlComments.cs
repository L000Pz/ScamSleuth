using Public.Domain;

namespace Public.Application.PublicManagement;

public interface IShowUrlComments
{
    public Task<List<UrlComment>?> Handle(int url_id);
}