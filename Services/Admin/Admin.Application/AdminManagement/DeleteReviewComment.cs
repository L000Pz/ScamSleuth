using Admin.Application.Common;
using Admin.Domain;

namespace Admin.Application.AdminManagement;

public class DeleteReviewComment : IDeleteReviewComment
{
    private readonly IAdminRepository _adminRepository;
    private readonly ICommentRepository _commentRepository;

    public DeleteReviewComment(IAdminRepository adminRepository, ICommentRepository commentRepository)
    {
        _adminRepository = adminRepository;
        _commentRepository = commentRepository;
    }

    public async Task<string> Handle(int comment_id, string token)
    {
        Admins? admin = await _adminRepository.GetAdminByEmail(token);
        if (admin is null)
        {
            return "writer";
        }

        ReviewComment? reviewComment = await _commentRepository.GetReviewCommentById(comment_id);
        if (reviewComment is null)
        {
            return "commentExist";
        }
        bool comment = await _commentRepository.DeleteReviewComment(comment_id);
        if (!comment)
        {
            return "comment";
        }


        return "ok";
    }
}