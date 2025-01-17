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
}