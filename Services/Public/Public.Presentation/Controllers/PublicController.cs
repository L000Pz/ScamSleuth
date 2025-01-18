using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Public.Application.PublicManagement;
using Public.Domain;
using Public.Infrastructure.PublicRepository;

namespace Public.Presentation.Controllers;

    
[ApiController]
[Produces("application/json")]
[Route("publicManager")]
public class PublicController: ControllerBase
{
    
   private readonly PostgreSqlContext _context;
   private readonly IShowAllReviews _showAllReviews;
   private readonly IShowRecentReviews _showRecentReviews;
   private readonly IReturnReviewById _returnReviewById;
   private const int RecentReviewsCount = 10; 

   public PublicController(PostgreSqlContext context, IShowAllReviews showAllReviews, IShowRecentReviews showRecentReviews, IReturnReviewById returnReviewById)
    {
        _context = context;
        _showAllReviews = showAllReviews;
        _showRecentReviews = showRecentReviews;
        _returnReviewById = returnReviewById;
    }

   [HttpGet("recent")] 
   public async Task<ActionResult> GetRecentReviews()
   {
       var recentReviews = await _showRecentReviews.Handle(RecentReviewsCount);
       if (recentReviews is null)
           return BadRequest("No reviews found");

       return Ok(recentReviews);
   }

   [HttpGet]
   public async Task<ActionResult> GetAllReviews()
   {
       var reviews = await _showAllReviews.Handle();
       if (reviews is null)
           return BadRequest("No reviews found");

       return Ok(reviews);
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
    
}
