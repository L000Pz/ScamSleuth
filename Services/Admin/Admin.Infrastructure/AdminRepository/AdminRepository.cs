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

    public Task DeleteReview(int review_id)
    {
        return null;
    }

    public Task<Review?> SubmitReview(Review review)
    {
        return null;
    }

    public Task<Review_Content?> SubmitReviewContent(Review_Content reviewContent)
    {
        return null;
    }

    public Task<Review_Banner?> SubmitReviewBanner(Review_Banner reviewBanner)
    {
        return null;
    }

    public Task<Review_Content_Media?> SubmitReviewMedia(Review_Content_Media reviewContentMedia)
    {
        return null;
    }

    public Task<Admin_Review?> SubmitAdminReview(Admin_Review adminReview)
    {
        return null;
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
}