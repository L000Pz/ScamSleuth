using User.Contracts;

namespace User.Application.UserManagement;

public interface IWriteUrlComment
{
    public Task<string> Handle(UrlCommentContent urlCommentContent, string token);

}