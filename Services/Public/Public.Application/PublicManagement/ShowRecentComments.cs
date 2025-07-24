using Public.Application.Common;
using Public.Contracts;

namespace Public.Application.PublicManagement;

public class ShowRecentComments : IShowRecentComments
{
    private readonly IPublicRepository _publicRepository;

    public ShowRecentComments(IPublicRepository publicRepository)
    {
        _publicRepository = publicRepository;
    }

    public async Task<List<RecentCommentDetails>?> Handle(int numberOfComments)
    {
        var comments = await _publicRepository.GetRecentUrlComments(numberOfComments);
        if  (comments is null)
        {
            return null;
        }
        var comments_with_details = new List<RecentCommentDetails>();
        foreach (var comment in comments)
        {
            var url = await _publicRepository.GetUrlById(comment.url_id);
            var writer = await _publicRepository.GetUserById(comment.writer_id);
            var commentWithDetail =
                new RecentCommentDetails(writer.username, comment.comment_content, url.url, comment.rating);
            comments_with_details.Add(commentWithDetail);
        }

        return comments_with_details;
    }

}