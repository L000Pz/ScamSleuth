using Public.Contracts;

namespace Public.Application.PublicManagement;

public interface IGetUrlRating
{
    public Task<UrlRatings?> Handle(string url_path);
}