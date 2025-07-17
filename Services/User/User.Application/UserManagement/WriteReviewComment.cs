using User.Application.Common;
using User.Contracts;
using User.Domain;

namespace User.Application.UserManagement;

public class WriteReviewComment : IWriteReviewComment
{
    private readonly IUserRepository _userRepository;

    public WriteReviewComment(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<string> Handle(ReviewCommentContent reviewCommentContent, string token)
    {
        var writer = await _userRepository.GetUserByEmail(token);
        if (writer is null) return "writer";
        var review = await _userRepository.GetReviewById(reviewCommentContent.review_id);
        if (review is null) return "review";
        if (reviewCommentContent.root_id != null)
        {
            var root_comment = await _userRepository.GetReviewCommentById(reviewCommentContent.root_id);
            if (root_comment is null) return "root";
        }

        var now = DateTime.Now;
        var rc = ReviewComment.Create(reviewCommentContent.root_id, reviewCommentContent.review_id, writer.user_id,
            "user",
            reviewCommentContent.comment_content, now);
        var newComment = await _userRepository.WriteReviewComment(rc);
        if (newComment is null) return "comment";
        return "ok";
    }
}