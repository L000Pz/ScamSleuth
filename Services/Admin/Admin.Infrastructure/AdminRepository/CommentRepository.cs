using Admin.Application.Common;
using Admin.Domain;
using Microsoft.EntityFrameworkCore;

namespace Admin.Infrastructure.AdminRepository;

public class CommentRepository : ICommentRepository
{
    private readonly PostgreSqlContext _context;

    public CommentRepository(PostgreSqlContext context)
    {
        _context = context;
    }

    public async Task<ReviewComment?> GetReviewCommentById(int? comment_id)
    {
        return _context.review_comment.SingleOrDefault(c => c.comment_id == comment_id);
    }

    public async Task<UrlComment?> GetUrlCommentById(int? comment_id)
    {
        return _context.url_comment.SingleOrDefault(c => c.comment_id == comment_id);
    }

    public async Task<ReviewComment?> WriteReviewComment(ReviewComment reviewComment)
    {
        _context.review_comment.Add(reviewComment);
        await _context.SaveChangesAsync();
        return reviewComment;
    }

    public async Task<UrlComment?> WriteUrlComment(UrlComment urlComment)
    {
        _context.url_comment.Add(urlComment);
        await _context.SaveChangesAsync();
        return urlComment;
    }
    public async Task<bool> DeleteReviewComment(int comment_id)
    {
        try
        {
            var comment = await _context.review_comment
                .FirstOrDefaultAsync(r => r.comment_id == comment_id);

            if (comment != null)
            {
                _context.review_comment.Remove(comment);
                await _context.SaveChangesAsync();
                return true;
            }

            return false;
        }
        catch (Exception)
        {
            return false;
        }
    }

    public async Task<bool> DeleteUrlComment(int comment_id)
    {
        try
        {
            var comment = await _context.url_comment
                .FirstOrDefaultAsync(r => r.comment_id == comment_id);

            if (comment != null)
            {
                _context.url_comment.Remove(comment);
                await _context.SaveChangesAsync();
                return true;
            }

            return false;
        }
        catch (Exception)
        {
            return false;
        }
    }
    public async Task<UrlStorage?> GetUrl(string url_path)
    {
        return await _context.url_storage
            .FirstOrDefaultAsync(us => us.url == url_path);
    }
}