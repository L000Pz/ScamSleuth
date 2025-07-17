using Admin.Application.Common;
using Admin.Domain;
using Microsoft.EntityFrameworkCore;
using MongoDB.Bson;

namespace Admin.Infrastructure.AdminRepository;

public class AdminRepository : IAdminRepository
{
    private readonly PostgreSqlContext _context;
    private readonly MongoContext _mongoContext;

    public AdminRepository(PostgreSqlContext context, MongoContext mongoContext)
    {
        _context = context;
        _mongoContext = mongoContext;
    }

    public async Task<Admins?> GetAdminByEmail(string email)
    {
        return _context.admins.SingleOrDefault(user => user.email == email);
    }

    public async Task<Review?> SubmitReview(Review review)
    {
        _context.review.Add(review);
        await _context.SaveChangesAsync();
        return review;
    }

    public async Task<Review_Content?> SubmitReviewContent(Review_Content reviewContent)
    {
        var doc = await _mongoContext.CreateDoc(reviewContent);
        try
        {
            await _mongoContext.Insert(doc);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return null;
        }

        return reviewContent;
    }

    public async Task<int> GetLastContentId()
    {
        var docs = await _mongoContext.GetAllDocs();
        int max = 0;
        foreach (var VARIABLE in docs)
        {
            Console.WriteLine(VARIABLE[0]);
            if (VARIABLE[1].AsInt32 > max)
            {
                max = VARIABLE[1].AsInt32;
            }
        }

        return max + 1;
    }

    public async Task<Review_Banner?> SubmitReviewBanner(Review_Banner reviewBanner)
    {
        _context.review_banner.Add(reviewBanner);
        await _context.SaveChangesAsync();
        return reviewBanner;
    }


    public async Task<List<Report>?> GetAllReports()
    {
        var reports = await _context.report
            .OrderByDescending(r => r.scam_date)
            .ToListAsync();
        if (reports.Count == 0)
        {
            return null;
        }

        return reports;
    }

    public async Task<List<Review>> GetAdminReviews(int writer_id)
    {
        return await _context.review
            .Join(
                _context.admins,
                review => review.writer_id,
                admin => admin.admin_id,
                (review, admin) => review
            )
            .Where(review => review.writer_id == writer_id)
            .ToListAsync();
    }

    public async Task<Review?> GetReviewById(int review_id)
    {
        return await _context.review
            .FirstOrDefaultAsync(r => r.review_id == review_id);
    }

    public async Task<bool> DeleteReview(int review_id)
    {
        try
        {
            var review = await _context.review
                .FirstOrDefaultAsync(r => r.review_id == review_id);

            if (review != null)
            {
                _context.review.Remove(review);
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

    public async Task<bool> DeleteReviewContent(int review_content_id)
    {
        try
        {
            var content = await _mongoContext.Delete(review_content_id);

            if (content != null)
            {
                return true;
            }

            return false;
        }
        catch (Exception)
        {
            return false;
        }
    }

    public async Task<List<int>?> GetReviewMediaIds(int review_id)
    {
        return await _context.review_content_media
            .Where(rcm => rcm.review_id == review_id)
            .Select(rcm => rcm.media_id)
            .ToListAsync();
    }

    public async Task<List<Review_Content_Media>?> SubmitReviewMedia(List<Review_Content_Media> review_media_list)
    {
        foreach (var media in review_media_list)
        {
            _context.review_content_media.Add(media);
        }

        await _context.SaveChangesAsync();
        return review_media_list;
    }

    public async Task<bool> DeleteReviewMedia(int review_id)
    {
        try
        {
            var reviewMedia = await _context.review_content_media
                .Where(rcm => rcm.review_id == review_id)
                .ToListAsync();

            _context.review_content_media.RemoveRange(reviewMedia);
            await _context.SaveChangesAsync();
            return true;
        }
        catch (Exception)
        {
            return false;
        }
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

    private async Task<List<ReviewComment>> GetAllDescendantComments(int rootId)
    {
        var result = new List<ReviewComment>();

        var directChildren = await _context.review_comment
            .Where(rc => rc.root_id == rootId)
            .ToListAsync();

        foreach (var child in directChildren)
        {
            result.Add(child);
            var nestedDescendants = await GetAllDescendantComments(child.comment_id);
            result.AddRange(nestedDescendants);
        }

        return result;
    }


    public async Task<bool> UpdateReviewContent(Review_Content new_content)
    {
        var res = await _mongoContext.Update(new_content);
        if (res is null)
        {
            return false;
        }

        return true;
    }

    public async Task<bool> UpdateReviewTitle(int review_id, string new_title)
    {
        var review = await _context.review.FirstOrDefaultAsync(r => r.review_id == review_id);
        if (review == null)
            return false;
        review.title = new_title;
        await _context.SaveChangesAsync();
        return true;
    }
    
}