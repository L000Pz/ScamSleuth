﻿using Microsoft.EntityFrameworkCore;
using User.Application.Common;
using User.Domain;

namespace User.Infrastructure.UserRepository;

public class UserRepository : IUserRepository
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

    public async Task<Users?> GetUserById(int user_id)
    {
        return _context.users.SingleOrDefault(user => user.user_id == user_id);
    }

    public async Task<Users?> ChangePassword(Users users, string password)
    {
        users.password = password;
        _context.users.Update(users);
        await _context.SaveChangesAsync();
        return users;
    }

    public async Task<Users?> ChangeUsername(Users users, string username)
    {
        users.username = username;
        _context.users.Update(users);
        await _context.SaveChangesAsync();
        return users;
    }

    public async Task<Users?> ChangeName(Users users, string name)
    {
        users.name = name;
        _context.users.Update(users);
        await _context.SaveChangesAsync();
        return users;
    }

    public async Task<Users?> ChangeProfilePicture(Users users, int profile_picture_id)
    {
        users.profile_picture_id = profile_picture_id;
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

    public async Task<List<Report_Media>> SubmitReportMedia(List<Report_Media> report_media_list)
    {
        var submittedMedia = new List<Report_Media>();
        foreach (var report_media in report_media_list) _context.report_media.Add(report_media);
        await _context.SaveChangesAsync();
        return report_media_list;
    }

    public async Task<List<Report>> GetUserReports(int writer_id)
    {
        return await _context.report
            .Join(
                _context.users,
                report => report.writer_id,
                users => users.user_id,
                (review, admin) => review
            )
            .Where(report => report.writer_id == writer_id)
            .ToListAsync();
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
                if (mediaAssociations.Any()) _context.report_media.RemoveRange(mediaAssociations);

                var report = await _context.report
                    .FirstOrDefaultAsync(r => r.report_id == report_id);
                if (report != null)
                    _context.report.Remove(report);
                else
                    return false;

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

    public async Task<Admins?> GetAdminByUsername(string username)
    {
        return _context.admins.SingleOrDefault(admin => admin.username == username);
    }
    public async Task<Report?> GetReportByDescription(string description)
    {
        return _context.report.SingleOrDefault(r => r.description == description);
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
    public async Task<Review?> GetReviewById(int review_id)
    {
        return await _context.review
            .FirstOrDefaultAsync(r => r.review_id == review_id);
    }
    public async Task<UrlStorage?> GetUrl(string url_path)
    {
        return await _context.url_storage
            .FirstOrDefaultAsync(us => us.url == url_path);
    }
    public async Task<ReviewComment?> GetReviewCommentById(int? comment_id)
    {
        return await _context.review_comment
            .FirstOrDefaultAsync(rc => rc.comment_id == comment_id);
    }
    public async Task<UrlComment?> GetUrlCommentById(int? comment_id)
    {
        return await _context.url_comment
            .FirstOrDefaultAsync(rc => rc.comment_id == comment_id);
    }
}