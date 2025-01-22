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
public class AdminController: ControllerBase
{
    private readonly IShowAllReports _showAllReports;
    private readonly IGetAdminReviews _getAdminReviews;
    private readonly ICreateReview _createReview;
    private readonly IDeleteReview _deleteReview;
    private readonly HttpClient _httpClient;
    private readonly IMessagePublisher _messagePublisher;
    private const string checkUrl = "http://gateway-api:80/IAM/authentication/Check Token";
    private const string reportUrl = "http://gateway-api:80/User/userManagement/reportId";
    private const string scamTypeUrl = "http://gateway-api:80/Public/publicManager/scamTypes";
    private const string mediaUrl = "http://gateway-api:80/Media/mediaManager/Get";

    public AdminController(HttpClient httpClient, IShowAllReports showAllReports,IGetAdminReviews getAdminReviews, ICreateReview createReview, IDeleteReview deleteReview, IMessagePublisher messagePublisher)
    {
        _httpClient = httpClient;
        _showAllReports = showAllReports;
        _getAdminReviews = getAdminReviews;
        _createReview = createReview;
        _deleteReview = deleteReview;
        _messagePublisher = messagePublisher;
    }
    [HttpPut("ViewReports")]
    [Authorize]
    public async Task<ActionResult> ViewReports()
    {
        string? token = HttpContext.Request.Headers.Authorization;
        token = token.Split(" ")[1];

        token = await CheckToken(token);
        if (token == "unsuccessful")
        {
            return BadRequest("You do not have access!");
        }
        
        var reports = await _showAllReports.Handle();
        if (reports is null)
            return BadRequest("No reports were found!");

        return Ok(reports);
    }
    
    [HttpGet("reportId")]
    [Authorize]
    public async Task<IActionResult> GetReportInformation(int report_id)
    {
        string? token = HttpContext.Request.Headers.Authorization;
        token = token.Split(" ")[1];

        token = await CheckToken(token);
        if (token == "unsuccessful")
        {
            return BadRequest("Authentication failed!");
        }
        try 
        {
            HttpResponseMessage reportResponse = await _httpClient.GetAsync($"{reportUrl}?report_id={report_id}");
            if (!reportResponse.IsSuccessStatusCode)
            {
                Console.WriteLine(reportResponse);
                return BadRequest("Failed find report's information!");
            }
        
            var reportInfo = reportResponse.Content.ReadAsStream();
            return Ok(reportInfo);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return BadRequest("Failed find report's information!");
        }
    }

    [HttpGet("GetAdminReviews")]
    [Authorize]
    public async Task<ActionResult> GetReviews()
    {
        string? token = HttpContext.Request.Headers.Authorization;
        token = token.Split(" ")[1];

        token = await CheckToken(token);
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
    
    
    [HttpPost("SubmitReport")]
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
    
        // Validate media
        try 
        { 
            foreach (var media_id in reviewCreation.media)
            {
                HttpResponseMessage mediaResponse = await _httpClient.GetAsync($"{mediaUrl}?id={media_id}");
        
                // If any media ID fails verification, return a bad request
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