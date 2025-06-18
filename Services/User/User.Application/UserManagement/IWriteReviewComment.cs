using User.Contracts;
using User.Domain;

namespace User.Application.UserManagement;

public interface IWriteReviewComment
{
    public Task<string> Handle(ReviewCommentContent reviewCommentContent, string token);
}