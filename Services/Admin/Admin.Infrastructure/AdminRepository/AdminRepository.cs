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
        var docs =await _mongoContext.GetAllDocs();
        int max = 0;
        foreach (var VARIABLE in docs)
        {
            Console.WriteLine(VARIABLE[0]);
            if (VARIABLE[0].AsInt32 > max)
            {
                max = VARIABLE[0].AsInt32;
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
        var res = await _mongoContext.Delete(review_content_id);
        if (res is null)
        {
            return false;
        }
        return true;
    }
}