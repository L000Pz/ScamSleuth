using Admin.Application.Common;
using Admin.Contracts;
using Admin.Domain;

namespace Admin.Application.AdminManagement;

public class WriteReviewComment : IWriteReviewComment
{
    private readonly IAdminRepository _adminRepository;
    private readonly ICommentRepository _commentRepository;

    public WriteReviewComment(IAdminRepository adminRepository, ICommentRepository commentRepository)
    {
        _adminRepository = adminRepository;
        _commentRepository = commentRepository;
    }

    public async Task<string> Handle(ReviewCommentContent reviewCommentContent, string token)
    {
        var writer = await _adminRepository.GetAdminByEmail(token);
        if (writer is null) return "writer";
        var review = await _adminRepository.GetReviewById(reviewCommentContent.review_id);
        if (review is null) return "review";
        if (reviewCommentContent.root_id != null)
        {
            var root_comment = await _commentRepository.GetReviewCommentById(reviewCommentContent.root_id);
            if (root_comment is null) return "root";
        }

        var now = DateTime.Now;
        var rc = ReviewComment.Create(reviewCommentContent.root_id, reviewCommentContent.review_id, writer.admin_id,
            "admin",
            reviewCommentContent.comment_content, now);
        var newComment = await _commentRepository.WriteReviewComment(rc);
        if (newComment is null) return "comment";
        return "ok";
    }
}