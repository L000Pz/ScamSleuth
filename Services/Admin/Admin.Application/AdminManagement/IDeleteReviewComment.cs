namespace Admin.Application.AdminManagement;

public interface IDeleteReviewComment
{
    public Task<string> Handle(int comment_id, string token);
}