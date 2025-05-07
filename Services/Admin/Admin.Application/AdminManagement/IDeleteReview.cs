namespace Admin.Application.AdminManagement;

public interface IDeleteReview
{
    public Task<string> Handle(int reviewId, string token);
}