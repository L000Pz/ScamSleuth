using Admin.Application.Common;
using Admin.Domain;
using Microsoft.EntityFrameworkCore;

namespace Admin.Infrastructure.AdminRepository;

public class ReportRepository : IReportRepository
{
    private readonly PostgreSqlContext _context;

    public ReportRepository(PostgreSqlContext context)
    {
        _context = context;
    }

    public async Task<Users?> GetUserById(int user_id)
    {
        return _context.users.SingleOrDefault(user => user.user_id == user_id);
    }
    
    public async Task<List<int>?> FindMediaId(int report_id)
    {
        return await _context.report_media
            .Where(rm => rm.report_id == report_id)
            .Select(rm => rm.media_id)
            .ToListAsync();
    }
    public async Task<Report?> GetReportById(int report_id)
    {
        var review = await _context.report
            .FirstOrDefaultAsync(r => r.report_id == report_id);
        return review;
    }
    public async Task<List<int>> GetReportMedia(int report_id)
    {
        var media = await _context.report_media
            .Where(m => m.report_id == report_id)
            .Select(m => m.media_id)
            .ToListAsync();
        return media;
    }
    public async Task<bool> DeleteReport(int report_id)
    {
        try
        {
            var report = await _context.report
                .FirstOrDefaultAsync(r => r.report_id == report_id);

            if (report != null)
            {
                _context.report.Remove(report);
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
    public async Task<bool> DeleteReportMedia(int report_id)
    {
        try
        {
            var reportMedia = await _context.report_media
                .Where(rm => rm.report_id == report_id)
                .ToListAsync();

            _context.report_media.RemoveRange(reportMedia);
            await _context.SaveChangesAsync();
            return true;
        }
        catch (Exception)
        {
            return false;
        }
    }
    public async Task<List<int>?> GetReportMediaIds(int report_id)
    {
        return await _context.report_media
            .Where(rm => rm.report_id == report_id)
            .Select(rm => rm.media_id)
            .ToListAsync();
    }
}