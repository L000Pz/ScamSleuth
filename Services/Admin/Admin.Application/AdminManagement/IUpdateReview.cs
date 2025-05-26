namespace Admin.Application.AdminManagement;

public interface IUpdateReview
{
    public Task<String?> HandleReviewContent(int review_id, string new_content, string token);
    public Task<String?> HandleReviewTitle(int review_id, string new_title, string token);

}