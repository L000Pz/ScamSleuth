using Microsoft.EntityFrameworkCore;
using User.Application.Common;
using User.Domain;

namespace User.Infrastructure.UserRepository;

public class UserRepository:IUserRepository
{
    private readonly PostgreSqlContext _context;

    public UserRepository(PostgreSqlContext context)
    {
        _context = context;
    }

    public async Task<Users?> GetUserByUsername(string username)
    {
        return _context.users.SingleOrDefault(user => user.username == username);

    }
    public async Task<Users?> GetUserByEmail(string email)
    {
        return _context.users.SingleOrDefault(user => user.email == email);
    }
    public async Task<Users?> ChangePassword(Users users, string password)
    {
        users.password = password;
        _context.users.Update(users);
        await _context.SaveChangesAsync();
        return users;
    }
    public async Task<Report?> SubmitReport(Report report)
    {
        _context.report.Add(report);
        await _context.SaveChangesAsync();
        return report;
    }

    public async Task<Report_Media?> SubmitReportMedia(Report_Media report_media)
    {
        _context.report_media.Add(report_media);
        await _context.SaveChangesAsync();
        return report_media;
    }
    public async Task<User_Report?> SubmitUserReport(User_Report user_report)
    {
        _context.user_report.Add(user_report);
        await _context.SaveChangesAsync();
        return user_report;
    }
    public async Task<List<Report>> GetUserReports(string email)
    {
        return _context.user_report
            .Join(
                _context.users,
                ur => ur.user_id,
                u => u.user_id,
                (ur, u) => new { UserReport = ur, User = u }
            )
            .Where(x => x.User.email == email)
            .Join(
                _context.report,
                x => x.UserReport.review_id,
                r => r.report_id,
                (x, r) => r
            )
            .ToList();
    }
    public async Task<bool> DeleteReport(int report_id)
    {
        try
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();
        
            try
            {
                var mediaAssociations = await _context.report_media
                    .Where(rm => rm.report_id == report_id)
                    .ToListAsync();
                if (mediaAssociations.Any())
                {
                    _context.report_media.RemoveRange(mediaAssociations);
                }

                var userReports = await _context.user_report
                    .Where(ur => ur.review_id == report_id)
                    .ToListAsync();
                if (userReports.Any())
                {
                    _context.user_report.RemoveRange(userReports);
                }

                var report = await _context.report
                    .FirstOrDefaultAsync(r => r.report_id == report_id);
                if (report != null)
                {
                    _context.report.Remove(report);
                }
                else
                {
                    return false;
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        catch (Exception ex)
        {
            return false;
        }
    }

    public async Task<List<int>?> FindMediaId(int report_id)
    {
        return await _context.report_media
            .Where(rm => rm.report_id == report_id)
            .Select(rm => rm.media_id)
            .ToListAsync();
    }
}