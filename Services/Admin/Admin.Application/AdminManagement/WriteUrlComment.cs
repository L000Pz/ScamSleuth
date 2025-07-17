using Admin.Application.Common;
using Admin.Contracts;
using Admin.Domain;

namespace Admin.Application.AdminManagement;

public class WriteUrlComment : IWriteUrlComment
{
    private readonly ICommentRepository _commentRepository;
    private readonly IAdminRepository _adminRepository;

    public WriteUrlComment(ICommentRepository commentRepository, IAdminRepository adminRepository)
    {
        _commentRepository = commentRepository;
        _adminRepository = adminRepository;
    }

    public async Task<string> Handle(UrlCommentContent urlCommentContent, string token)
    {
        var writer = await _adminRepository.GetAdminByEmail(token);
        if (writer is null) return "writer";
        var url = await _commentRepository.GetUrl(urlCommentContent.url);
        if (url is null) return "url";
        if (urlCommentContent.root_id != null)
        {
            var root_comment = await _commentRepository.GetUrlCommentById(urlCommentContent.root_id);
            if (root_comment is null) return "root";
        }

        var now = DateTime.Now;
        var uc = UrlComment.Create(url.url_id, writer.admin_id, "admin", urlCommentContent.root_id,
            urlCommentContent.comment_content, now);
        var newComment = await _commentRepository.WriteUrlComment(uc);
        if (newComment is null) return "comment";
        return "ok";
    }
}