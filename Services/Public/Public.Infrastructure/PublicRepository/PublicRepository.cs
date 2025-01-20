﻿using Microsoft.EntityFrameworkCore;
using Public.Application.Common;
using Public.Domain;

namespace Public.Infrastructure.PublicRepository;

public class PublicRepository : IPublicRepository
{
    private readonly PostgreSqlContext _context;

    public PublicRepository(PostgreSqlContext context)
    {
        _context = context;
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
    public async Task<Review_Content?> GetReviewContent(int review_content_id)
    {
        var content = await _context.review_content
            .FirstOrDefaultAsync(c => c.review_content_id == review_content_id);
        return content;
    }
   
    public async Task<Admin_Review?> GetReviewWriter(int review_id)
    {
        var writer = await _context.admin_review
            .FirstOrDefaultAsync(c => c.review_id == review_id);
        return writer;
    }
    public async Task<List<Review_Content_Media?>> GetReviewContentMedia(int review_content_id)
    {
        var media = await _context.review_content_media
            .Where(m => m.review_content_id == review_content_id)
            .ToListAsync();
        return media;
    }

    public async Task<Scam_Type?> GetScamTypeById(int scam_type_id)
    {
        var scamType = await _context.scam_type
            .FirstOrDefaultAsync(c => c.scam_type_id == scam_type_id);
        return scamType;
    }
}