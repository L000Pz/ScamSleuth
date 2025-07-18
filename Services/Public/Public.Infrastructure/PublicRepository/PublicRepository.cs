﻿using Microsoft.EntityFrameworkCore;
using MongoDB.Bson.Serialization;
using Public.Application.Common;
using Public.Domain;

namespace Public.Infrastructure.PublicRepository;

public class PublicRepository : IPublicRepository
{
    private readonly PostgreSqlContext _context;
    private readonly MongoContext _mongoContext;

    public PublicRepository(PostgreSqlContext context, MongoContext mongoContext)
    {
        _context = context;
        _mongoContext = mongoContext;
    }

    public async Task<List<Review>?> GetAllReviews()
    {
        var reviews = await _context.review
            .OrderByDescending(r => r.review_date)
            .ToListAsync();
        if (reviews.Count == 0)
        {
            return null;
        }

        return reviews;
    }

    public async Task<List<ReviewComment?>> GetAllReviewComments(int review_id)
    {
        var comments = await _context.review_comment
            .Where(rc => rc.review_id == review_id)
            .ToListAsync();
        return comments;
    }
    public async Task<List<UrlComment?>> GetAllUrlComments(int url_id)
    {
        var comments = await _context.url_comment
            .Where(uc => uc.url_id == url_id)
            .ToListAsync();
        return comments;
    }
    public async Task<List<Scam_Type>?> GetAllScamTypes()
    {
        var scamTypes = await _context.scam_type
            .ToListAsync();
        if (scamTypes.Count == 0)
        {
            return null;
        }

        return scamTypes;
    }

    public async Task<List<Review>?> GetRecentReviews(int numberOfReviews)
    {
        var recentReviews = await _context.review
            .OrderByDescending(r => r.review_date)
            .Take(numberOfReviews)
            .ToListAsync();
        if (recentReviews.Count == 0)
        {
            return null;
        }

        return recentReviews;
    }

    public async Task<Review?> GetReviewById(int review_id)
    {
        var review = await _context.review
            .FirstOrDefaultAsync(r => r.review_id == review_id);
        return review;
    }
    public async Task<UrlStorage?> GetUrl(string url)
    {
        var review = await _context.url_storage
            .FirstOrDefaultAsync(us => us.url == url);
        return review;
    }
    public async Task<Review_Content?> GetReviewContent(int review_content_id)
    {
        var bsonContent = await _mongoContext.GetDoc(review_content_id);
        if (bsonContent == null)
            return null;


        bsonContent.Remove("_id");

        var reviewContent = BsonSerializer.Deserialize<Review_Content>(bsonContent);
        return reviewContent;
    }


    public async Task<Scam_Type?> GetScamTypeById(int scam_type_id)
    {
        var scamType = await _context.scam_type
            .FirstOrDefaultAsync(c => c.scam_type_id == scam_type_id);
        return scamType;
    }

    public async Task<Admins?> GetAdminById(int admin_id)
    {
        return _context.admins.SingleOrDefault(user => user.admin_id == admin_id);
    }

    public async Task<Users?> GetUserById(int user_id)
    {
        return _context.users.SingleOrDefault(user => user.user_id == user_id);
    }
    public async Task<List<Review_Content_Media?>> GetReviewContentMedia(int review_id)
    {
        var media = await _context.review_content_media
            .Where(m => m.review_id == review_id)
            .ToListAsync();
        return media;
    }
}