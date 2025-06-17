using User.Application.Common;
using User.Contracts;
using User.Domain;

namespace User.Application.UserManagement;

public class WriteComment : IWriteComment
{
    private readonly IUserRepository _userRepository;

    public WriteComment(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<string> Handle(CommentContent commentContent, string token)
    {
        var writer = await _userRepository.GetUserByEmail(token);
        if (writer is null) return "writer";
        var review = await _userRepository.GetReviewById(commentContent.review_id);
        if (review is null) return "review";
        if (commentContent.root_id != null)
        {
            var root_comment = await _userRepository.GetCommentById(commentContent.root_id);
            if (root_comment is null) return "root";
        }

        var now = DateTime.Now;
        var rc = ReviewComment.Create(commentContent.root_id, commentContent.review_id, writer.user_id,
            commentContent.comment_content, now);
        var newComment = await _userRepository.WriteComment(rc);
        if (newComment is null) return "comment";
        return "ok";
    }
}