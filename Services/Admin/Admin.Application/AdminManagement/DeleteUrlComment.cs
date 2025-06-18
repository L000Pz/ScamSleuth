using Admin.Application.Common;
using Admin.Domain;

namespace Admin.Application.AdminManagement;

public class DeleteUrlComment : IDeleteUrlComment
{
    private readonly IAdminRepository _adminRepository;

    public DeleteUrlComment(IAdminRepository adminRepository)
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

        UrlComment? urlComment = await _adminRepository.GetUrlCommentById(comment_id);
        if (urlComment is null)
        {
            return "commentExist";
        }
        bool comment = await _adminRepository.DeleteUrlComment(comment_id);
        if (!comment)
        {
            return "comment";
        }


        return "ok";
    }
}