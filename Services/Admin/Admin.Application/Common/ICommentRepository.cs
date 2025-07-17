using Admin.Domain;

namespace Admin.Application.Common;

public interface ICommentRepository
{
    public Task<bool> DeleteReviewComment(int opmment_id);
    public Task<ReviewComment?> GetReviewCommentById(int? comment_id);
    public Task<bool> DeleteUrlComment(int cpmment_id);
    public Task<UrlComment?> GetUrlCommentById(int? comment_id);
    public Task<UrlComment?> WriteUrlComment(UrlComment urlComment);
    public Task<ReviewComment?> WriteReviewComment(ReviewComment reviewComment);
    Task<UrlStorage?> GetUrlById(int url_id);

}