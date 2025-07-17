using Public.Contracts;
using Public.Domain;

namespace Public.Application.PublicManagement;

public interface IShowUrlComments
{
    public Task<List<UrlCommentDetails>?> Handle(string url);
}