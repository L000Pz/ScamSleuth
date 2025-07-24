using Public.Contracts;

namespace Public.Application.PublicManagement;

public interface IShowRecentComments
{
    public Task<List<RecentCommentDetails>?> Handle(int numberOfComments);
}