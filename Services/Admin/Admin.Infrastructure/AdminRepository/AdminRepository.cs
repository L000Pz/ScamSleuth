using Admin.Application.Common;
using Admin.Domain;
using Microsoft.EntityFrameworkCore;

namespace Admin.Infrastructure.AdminRepository;

public class AdminRepository : IAdminRepository
{
    private readonly PostgreSqlContext _context;

    public AdminRepository(PostgreSqlContext context)
    {
        _context = context;
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
        _context.review_content.Add(reviewContent);
        await _context.SaveChangesAsync();
        return reviewContent;
    }

    public async Task<Review_Banner?> SubmitReviewBanner(Review_Banner reviewBanner)
    {
        _context.review_banner.Add(reviewBanner);
        await _context.SaveChangesAsync();
        return reviewBanner;
    }

    public async Task<List<Review_Content_Media>?> SubmitReviewMedia(List<Review_Content_Media> review_media_list)
    {
        var submittedMedia = new List<Review_Content_Media>();
        foreach (var media in review_media_list)
        {
            _context.review_content_media.Add(media);
        }
        await _context.SaveChangesAsync();
        return review_media_list;
    }

    public async Task<Admin_Review?> SubmitAdminReview(Admin_Review adminReview)
    {
        _context.admin_review.Add(adminReview);
        await _context.SaveChangesAsync();
        return adminReview;
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
    public async Task<List<Review>> GetAdminReviews(string email)
    {
        return _context.admin_review
            .Join(
                _context.admins,
                ar => ar.admin_id,
                a => a.admin_id,
                (ar, a) => new { AdminReview = ar, Admin = a }
            )
            .Where(x => x.Admin.email == email)
            .Join(
                _context.review,
                x => x.AdminReview.review_id,
                r => r.review_id,
                (x, r) => r
            )
            .ToList();
    }
}