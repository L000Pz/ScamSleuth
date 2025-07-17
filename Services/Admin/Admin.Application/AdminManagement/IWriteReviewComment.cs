using Admin.Contracts;

namespace Admin.Application.AdminManagement;

public interface IWriteReviewComment
{
    public Task<string> Handle(ReviewCommentContent reviewCommentContent, string token);
}