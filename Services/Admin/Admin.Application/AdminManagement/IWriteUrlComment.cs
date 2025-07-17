using Admin.Contracts;

namespace Admin.Application.AdminManagement;

public interface IWriteUrlComment
{
    public Task<string> Handle(UrlCommentContent urlCommentContent, string token);
}