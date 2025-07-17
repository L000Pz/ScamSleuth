using Admin.Application.Common;
using Admin.Domain;

namespace Admin.Application.AdminManagement;

public class DeleteUrlComment : IDeleteUrlComment
{
    private readonly IAdminRepository _adminRepository;
    private readonly ICommentRepository _commentRepository;

    public DeleteUrlComment(IAdminRepository adminRepository, ICommentRepository commentRepository)
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

        UrlComment? urlComment = await _commentRepository.GetUrlCommentById(comment_id);
        if (urlComment is null)
        {
            return "commentExist";
        }
        bool comment = await _commentRepository.DeleteUrlComment(comment_id);
        if (!comment)
        {
            return "comment";
        }


        return "ok";
    }
}