using System.Text;
using Admin.Application.AdminManagement;
using Admin.Contracts;
using Admin.Domain;
using Admin.Presentation.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using RabbitMQ.Client;

namespace Admin.Presentation.Controllers;

[ApiController]
[Produces("application/json")]
[Route("adminManagement")]
public class AdminController : ControllerBase
{
    private readonly IShowAllReports _showAllReports;
    private readonly IGetAdminReviews _getAdminReviews;
    private readonly ICreateReview _createReview;
    private readonly IDeleteReview _deleteReview;
    private readonly IGetReportById _getReportById;
    private readonly IUpdateReview _updateReview;
    private readonly IDeleteReviewComment _deleteReviewComment;
    private readonly IDeleteUrlComment _deleteUrlComment;
    private readonly IWriteUrlComment _writeUrlComment;
    private readonly IWriteReviewComment _writeReviewComment;
    private readonly HttpClient _httpClient;
    private readonly IMessagePublisher _messagePublisher;
    private const string checkUrl = "http://gateway-api:80/IAM/authentication/Check Token";
    private const string scamTypeUrl = "http://gateway-api:80/Public/publicManager/scamTypes";
    private const string mediaUrl = "http://gateway-api:80/Media/mediaManager/Get";

    public AdminController(HttpClient httpClient, IShowAllReports showAllReports, IGetAdminReviews getAdminReviews,
        ICreateReview createReview, IDeleteReview deleteReview, IMessagePublisher messagePublisher,
        IGetReportById getReportById, IUpdateReview updateReview, IDeleteReviewComment deleteReviewComment,
        IDeleteUrlComment deleteUrlComment, IWriteUrlComment writeUrlComment, IWriteReviewComment writeReviewComment)
    {
        _httpClient = httpClient;
        _showAllReports = showAllReports;
        _getAdminReviews = getAdminReviews;
        _createReview = createReview;
        _deleteReview = deleteReview;
        _messagePublisher = messagePublisher;
        _getReportById = getReportById;
        _updateReview = updateReview;
        _deleteReviewComment = deleteReviewComment;
        _deleteUrlComment = deleteUrlComment;
        _writeUrlComment = writeUrlComment;
        _writeReviewComment = writeReviewComment;
    }

    [HttpGet("ViewReports")]
    [Authorize]
    public async Task<ActionResult> ViewReports()
    {
        string? token = HttpContext.Request.Headers.Authorization;
        token = token.Split(" ")[1];

        token = await CheckToken(token);
        if (token == "unsuccessful")
        {
            return BadRequest("You don't have access to this property!");
        }

        var reports = await _showAllReports.Handle();
        if (reports is null)
            return BadRequest("No reports were found!");

        return Ok(reports);
    }


    [HttpGet("GetAdminReviews")]
    [Authorize]
    public async Task<ActionResult> GetReviews()
    {
        string? token = HttpContext.Request.Headers.Authorization;
        token = token.Split(" ")[1];

        token = await CheckToken(token);
        if (token == "unsuccessful")
        {
            return BadRequest("Authentication failed!");
        }

        List<Review>? reviews = await _getAdminReviews.Handle(token);
        if (reviews is null)
        {
            return BadRequest("No reviews could be found!");
        }

        return Ok(reviews);
    }


    [HttpDelete("DeleteReview")]
    [Authorize]
    public async Task<ActionResult> DeleteReview(int reviewId)
    {
        string? token = HttpContext.Request.Headers.Authorization;
        token = token.Split(" ")[1];

        token = await CheckToken(token);
        if (token == "unsuccessful")
        {
            return BadRequest("Authentication failed!");
        }

        // Delete the review and get media IDs
        var (status, mediaIds) = await _deleteReview.Handle(reviewId, token);
        if (status != "ok")
        {
            return BadRequest($"Failed to delete review!");
        }

        // Publish messages to delete associated media
        if (mediaIds != null && mediaIds.Any())
        {
            foreach (var mediaId in mediaIds)
            {
                _messagePublisher.PublishMediaDeletion(mediaId);
            }
        }

        return Ok("Review deleted successfully.");
    }


    [HttpDelete("DeleteReviewComment")]
    [Authorize]
    public async Task<ActionResult> DeleteReviewComment(int comment_id)
    {
        string? token = HttpContext.Request.Headers.Authorization;
        token = token.Split(" ")[1];

        token = await CheckToken(token);
        if (token == "unsuccessful")
        {
            return BadRequest("Authentication failed!");
        }

        var result = await _deleteReviewComment.Handle(comment_id, token);
        if (result == "writer")
        {
            return BadRequest($"You are not allowed to remove any comments!");
        }

        if (result == "commentExist")
        {
            return BadRequest("The comment you are trying to delete does not exist!");
        }


        if (result == "comment")
        {
            return BadRequest("Failed to remove the comment!");
        }

        return Ok("Comment deleted successfully.");
    }

    [HttpDelete("DeleteUrlComment")]
    [Authorize]
    public async Task<ActionResult> DeleteUrlComment(int comment_id)
    {
        string? token = HttpContext.Request.Headers.Authorization;
        token = token.Split(" ")[1];

        token = await CheckToken(token);
        if (token == "unsuccessful")
        {
            return BadRequest("Authentication failed!");
        }

        var result = await _deleteUrlComment.Handle(comment_id, token);
        if (result == "writer")
        {
            return BadRequest($"You are not allowed to remove any comments!");
        }

        if (result == "commentExist")
        {
            return BadRequest("The comment you are trying to delete does not exist!");
        }


        if (result == "comment")
        {
            return BadRequest("Failed to remove the comment!");
        }

        return Ok("Comment deleted successfully.");
    }

    [HttpPost("WriteReview")]
    [Authorize]
    public async Task<ActionResult> CreateReview([FromBody] ReviewCreation reviewCreation)
    {
        string? token = HttpContext.Request.Headers.Authorization;
        token = token.Split(" ")[1];

        token = await CheckToken(token);
        if (token == "unsuccessful")
        {
            return BadRequest("Authentication failed!");
        }

        // Validate scam type
        try
        {
            HttpResponseMessage scamTypeResponse = await _httpClient.GetAsync(scamTypeUrl);
            if (!scamTypeResponse.IsSuccessStatusCode)
            {
                return BadRequest("Failed to verify scam type!");
            }

            var validScamTypes = JsonConvert.DeserializeObject<List<Scam_Type>>(
                await scamTypeResponse.Content.ReadAsStringAsync());

            if (!validScamTypes.Any(st => st.scam_type_id == reviewCreation.scam_type_id))
            {
                return BadRequest("Invalid scam type! Please select from available scam types.");
            }
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return BadRequest("Failed to verify scam type!");
        }

        try
        {
            foreach (var media_id in reviewCreation.media)
            {
                HttpResponseMessage mediaResponse = await _httpClient.GetAsync($"{mediaUrl}?id={media_id}");

                if (!mediaResponse.IsSuccessStatusCode)
                {
                    return BadRequest($"Failed to verify media!");
                }
            }
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return BadRequest("Failed to verify media!");
        }

        string result = await _createReview.Handle(reviewCreation, token);
        if (result == "report")
        {
            return BadRequest("Failed to submit report!");
        }

        if (result == "writer")
        {
            return BadRequest("Failed to authenticate user!");
        }

        return Ok("Report submitted successfully.");
    }

    [HttpGet("GetReportById")]
    public async Task<ActionResult> GetReportById(int report_id)
    {
        string? token = HttpContext.Request.Headers.Authorization;
        token = token.Split(" ")[1];
        token = await CheckToken(token);
        if (token == "unsuccessful")
        {
            return BadRequest("Authentication failed!");
        }

        var reportInfo = await _getReportById.Handle(report_id, token);
        if (reportInfo == null)
        {
            return BadRequest("Report information could not be found!");
        }

        if (reportInfo.ReportWriterDetails == null)
        {
            return BadRequest("You do not have access to this report.");
        }

        return Ok(reportInfo);
    }

    [HttpPost("UpdateReviewContent")]
    [Authorize]
    public async Task<ActionResult> UpdateReviewContent([FromBody] ReviewContentUpdate reviewContentUpdate)
    {
        string? token = HttpContext.Request.Headers.Authorization;
        token = token.Split(" ")[1];
        token = await CheckToken(token);
        if (token == "unsuccessful")
        {
            return BadRequest("Authentication failed!");
        }

        var result =
            await _updateReview.HandleReviewContent(reviewContentUpdate.review_id, reviewContentUpdate.new_content,
                token);
        if (result == "review")
        {
            return BadRequest("Review information could not be found!");
        }

        if (result == "admin")
        {
            return BadRequest("You do not have access to this review.");
        }

        if (result == "invalid")
        {
            return BadRequest("Could not Update Review content!");
        }

        return Ok("Review content has been updated successfully");
    }

    [HttpPost("UpdateReviewTitle")]
    [Authorize]
    public async Task<ActionResult> UpdateReviewTitle([FromBody] TitleUpdate titleUpdate)
    {
        string? token = HttpContext.Request.Headers.Authorization;
        token = token.Split(" ")[1];

        token = await CheckToken(token);
        if (token == "unsuccessful")
        {
            return BadRequest("Authentication failed!");
        }

        var result = await _updateReview.HandleReviewTitle(titleUpdate.review_id, titleUpdate.new_title, token);
        if (result == "review")
        {
            return BadRequest("Review information could not be found!");
        }

        if (result == "admin")
        {
            return BadRequest("You do not have access to this review.");
        }

        if (result == "invalid")
        {
            return BadRequest("Could not Update Review title!");
        }

        return Ok("Review title has been updated successfully");
    }

    [HttpPost("WriteUrlComment")]
    [Authorize]
    public async Task<ActionResult> WriteUrlComment([FromBody] UrlCommentContent urlCommentContent)
    {
        string? token = HttpContext.Request.Headers.Authorization;
        token = token.Split(" ")[1];

        token = await CheckToken(token);
        if (token == "unsuccessful") return BadRequest("Authentication failed!");
        var result = await _writeUrlComment.Handle(urlCommentContent, token);
        if (result == "writer") return BadRequest("You are not a registered admin!");
        if (result == "url")
        {
            return BadRequest("Could not find the url!");
        }

        if (result == "root")
        {
            return BadRequest("Root comment could not be found!");
        }

        if (result == "comment")
        {
            return BadRequest("Failed to submit the comment!");
        }

        return Ok("Comment submitted successfully.");
    }

    [HttpPost("WriteReviewComment")]
    [Authorize]
    public async Task<ActionResult> WriteReviewComment([FromBody] ReviewCommentContent reviewCommentContent)
    {
        string? token = HttpContext.Request.Headers.Authorization;
        token = token.Split(" ")[1];

        token = await CheckToken(token);
        if (token == "unsuccessful") return BadRequest("Authentication failed!");
        var result = await _writeReviewComment.Handle(reviewCommentContent, token);
        if (result == "writer") return BadRequest("You are not a registered admin!");
        if (result == "review")
        {
            return BadRequest("Could not find the review!");
        }

        if (result == "root")
        {
            return BadRequest("Root comment could not be found!");
        }

        if (result == "comment")
        {
            return BadRequest("Failed to submit the comment!");
        }

        return Ok("Comment submitted successfully.");
    }

    private async Task<String> CheckToken(String token)
    {
        try
        {
            string jsonToken = JsonConvert.SerializeObject(token);
            HttpContent content = new StringContent(jsonToken, Encoding.UTF8, "application/json");
            HttpResponseMessage response = await _httpClient.PostAsync(checkUrl, content);

            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine(response);
                return "unsuccessful";
            }

            token = await response.Content.ReadAsStringAsync();
            return token;
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return "unsuccessful";
        }
    }
}