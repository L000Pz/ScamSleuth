using FuzzySharp;
using Microsoft.EntityFrameworkCore;
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
    public async Task<List<UrlComment?>> GetRecentUrlComments(int numberOfComments)
    {
        var recentComments = await _context.url_comment
            .Where(r => r.rating != 0)
            .OrderByDescending(r => r.created_at)
            .Take(numberOfComments)
            .ToListAsync();
        return recentComments;
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

    public async Task<int> GetNumberOfCommentsUrl(int url_id)
    {
        int count = _context.url_comment.Count(c => c.url_id == url_id && c.rating != 0);
        return count;
    }

    public async Task<int> GetNumberOf5Url(int url_id)
    {
        int count = _context.url_comment.Count(c => c.url_id == url_id && c.rating == 5);
        return count;
    }

    public async Task<int> GetNumberOf4Url(int url_id)
    {
        int count = _context.url_comment.Count(c => c.url_id == url_id && c.rating == 4);
        return count;
    }

    public async Task<int> GetNumberOf3Url(int url_id)
    {
        int count = _context.url_comment.Count(c => c.url_id == url_id && c.rating == 3);
        return count;
    }

    public async Task<int> GetNumberOf2Url(int url_id)
    {
        int count = _context.url_comment.Count(c => c.url_id == url_id && c.rating == 2);
        return count;
    }

    public async Task<int> GetNumberOf1Url(int url_id)
    {
        int count = _context.url_comment.Count(c => c.url_id == url_id && c.rating == 1);
        return count;
    }

    public async Task<double> GetAverageRatingUrl(int url_id)
    {
        var ratings = _context.url_comment
            .Where(c => c.url_id == url_id && c.rating != 0);
        double average = ratings.Any() ? ratings.Average(c => c.rating) : 0;
        return average;
    }

    public async Task<UrlStorage?> GetUrlById(int url_id)
    {
        return _context.url_storage.SingleOrDefault(u => u.url_id == url_id);
    }

    public async Task<bool> IncreaseView(int review_id)
    {
        var review = await _context.review.FirstOrDefaultAsync(r => r.review_id == review_id);
        var current_views = review.views;
        if (current_views is null)
        {
            review.views = 1;
        }
        else
        {
            review.views = current_views + 1;
        }
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<Review?>> SearchReviewTitle(string input)
    {
        var reviews = await _context.review
            .ToListAsync();
        var filtered = reviews
            .Where(r =>
                Fuzz.Ratio(r.title, input) > 70)
            .ToList();
        return filtered;
    }

    public async Task<List<Review?>> SearchReviewContent(string input)
    {
        var allDocs = await _mongoContext.GetAllDocs();

        var contentItems = allDocs
            .Where(doc => doc.Contains("review_content") && doc.Contains("review_content_id"))
            .Select(doc => new Review_Content
            {
                review_content_id = int.Parse(doc["review_content_id"].ToString()),
                review_content = doc["review_content"].AsString
            })
            .ToList();

        var exactMatches = contentItems
            .Where(rc => rc.review_content.Contains(input, StringComparison.OrdinalIgnoreCase))
            .ToList();

        var matches = Process.ExtractAll(
                input,
                contentItems.Select(rc => rc.review_content)
            )
            .Where(m => m.Score >= 80)
            .ToList();

        var matchedContentIds = new HashSet<int>(exactMatches.Select(m => m.review_content_id));

        foreach (var match in matches)
        {
            var contentId = contentItems.FirstOrDefault(rc => rc.review_content == match.Value)?.review_content_id;
            if (contentId != null)
            {
                matchedContentIds.Add(contentId.Value);
            }
        }

        var matchedReviews = await _context.review
            .Where(r => matchedContentIds.Contains(r.review_content_id))
            .ToListAsync();

        return matchedReviews;
    }






}