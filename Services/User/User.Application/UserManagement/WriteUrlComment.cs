using User.Application.Common;
using User.Contracts;
using User.Domain;

namespace User.Application.UserManagement;

public class WriteUrlComment : IWriteUrlComment
{
    private readonly IUserRepository _userRepository;

    public WriteUrlComment(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<string> Handle(UrlCommentContent urlCommentContent, string token)
    {
        if (urlCommentContent.rating > 5 || urlCommentContent.rating < 1)
        {
            return "rating";
        }

        var writer = await _userRepository.GetUserByEmail(token);
        if (writer is null) return "writer";
        var url = await _userRepository.GetUrlById(urlCommentContent.url_id);
        if (url is null) return "url";
        if (urlCommentContent.root_id != null)
        {
            var root_comment = await _userRepository.GetUrlCommentById(urlCommentContent.root_id);
            if (root_comment is null) return "root";
        }

        var now = DateTime.Now;
        var uc = UrlComment.Create(urlCommentContent.url_id, writer.user_id, "user", urlCommentContent.root_id,
            urlCommentContent.rating, urlCommentContent.comment_content, now);
        var newComment = await _userRepository.WriteUrlComment(uc);
        if (newComment is null) return "comment";
        return "ok";
    }
}