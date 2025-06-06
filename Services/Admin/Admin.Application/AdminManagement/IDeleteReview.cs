namespace Admin.Application.AdminManagement;

public interface IDeleteReview
{
    public Task<(string status, List<int>? mediaIds)> Handle(int reviewId, string token);
    
}