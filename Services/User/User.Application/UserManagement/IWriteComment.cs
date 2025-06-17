using User.Contracts;
using User.Domain;

namespace User.Application.UserManagement;

public interface IWriteComment
{
    public Task<string> Handle(CommentContent commentContent, string token);
}