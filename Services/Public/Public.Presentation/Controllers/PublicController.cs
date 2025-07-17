using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Public.Application.PublicManagement;
using Public.Domain;
using Public.Infrastructure.PublicRepository;

namespace Public.Presentation.Controllers;

[ApiController]
[Produces("application/json")]
[Route("publicManager")]
public class PublicController : ControllerBase
{
    private readonly IShowAllReviews _showAllReviews;
    private readonly IShowRecentReviews _showRecentReviews;
    private readonly IReturnReviewById _returnReviewById;
    private readonly IGetScamTypes _getScamTypes;
    private readonly IShowReviewComments _showReviewComments;
    private readonly IShowUrlComments _showUrlComments;
    private const int RecentReviewsCount = 10;

    public PublicController(IShowAllReviews showAllReviews, IShowRecentReviews showRecentReviews,
        IReturnReviewById returnReviewById, IGetScamTypes getScamTypes, IShowReviewComments showReviewComments, IShowUrlComments showUrlComments)
    {
        _showAllReviews = showAllReviews;
        _showRecentReviews = showRecentReviews;
        _returnReviewById = returnReviewById;
        _getScamTypes = getScamTypes;
        _showReviewComments = showReviewComments;
        _showUrlComments = showUrlComments;
    }

    [HttpGet("recentReviews")]
    public async Task<ActionResult> GetRecentReviews()
    {
        var recentReviews = await _showRecentReviews.Handle(RecentReviewsCount);
        if (recentReviews is null)
            return BadRequest("No reviews found");

        return Ok(recentReviews);
    }

    [HttpGet("allReviews")]
    public async Task<ActionResult> GetAllReviews()
    {
        var reviews = await _showAllReviews.Handle();
        if (reviews is null)
            return BadRequest("No reviews were found!");

        return Ok(reviews);
    }

    [HttpGet("scamTypes")]
    public async Task<ActionResult> ReturnScamTypes()
    {
        var scamTypes = await _getScamTypes.Handle();
        if (scamTypes is null)
            return BadRequest("No scam type exists!");

        return Ok(scamTypes);
    }

    [HttpGet("reviewId")]
    public async Task<ActionResult> GetReviewById(int review_id)
    {
        var reviewInfo = await _returnReviewById.Handle(review_id);
        if (reviewInfo == null)
        {
            return BadRequest("Review information could not be found!");
        }

        return Ok(reviewInfo);
    }

    [HttpGet("ReviewComments")]
    public async Task<ActionResult> GetReviewComments(int review_id)
    {
        var comments = await _showReviewComments.Handle(review_id);
        if (comments == null)
        {
            return BadRequest("No comments could be found for this review!");
        }

        return Ok(comments);
    }
    [HttpGet("UrlComments")]
    public async Task<ActionResult> GetUrlComments(string url)
    {
        var comments = await _showUrlComments.Handle(url);
        if (comments == null)
        {
            return BadRequest("No comments could be found for this url!");
        }

        return Ok(comments);
    }
}