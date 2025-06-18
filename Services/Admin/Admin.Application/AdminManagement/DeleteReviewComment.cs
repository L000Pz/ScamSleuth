using Admin.Application.Common;
using Admin.Domain;

namespace Admin.Application.AdminManagement;

public class DeleteReviewComment : IDeleteReviewComment
{
    private readonly IAdminRepository _adminRepository;

    public DeleteReviewComment(IAdminRepository adminRepository)
    {
        _adminRepository = adminRepository;
    }

    public async Task<string> Handle(int comment_id, string token)
    {
        Admins? admin = await _adminRepository.GetAdminByEmail(token);
        if (admin is null)
        {
            return "writer";
        }

        ReviewComment? reviewComment = await _adminRepository.GetReviewCommentById(comment_id);
        if (reviewComment is null)
        {
            return "commentExist";
        }
        bool comment = await _adminRepository.DeleteReviewComment(comment_id);
        if (!comment)
        {
            return "comment";
        }


        return "ok";
    }
}