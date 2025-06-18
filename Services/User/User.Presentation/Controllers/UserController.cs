using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using User.Application.UserManagement;
using User.Contracts;
using User.Domain;

namespace User.Presentation.Controllers;

[ApiController]
[Produces("application/json")]
[Route("userManagement")]
public class UserController : ControllerBase
{
    private const string checkUrl = "http://gateway-api:80/IAM/authentication/Check Token";
    private const string mediaUrl = "http://gateway-api:80/Media/mediaManager/Get";
    private const string scamTypeUrl = "http://gateway-api:80/Public/publicManager/scamTypes";
    private readonly IConfiguration _configuration;
    private readonly IEditUserInfo _editUserInfo;
    private readonly IGetUserReports _getUserReports;
    private readonly HttpClient _httpClient;
    private readonly IRemoveReport _removeReport;
    private readonly IReturnReportById _returnReportById;
    private readonly ISubmitReport _submitReport;
    private readonly IWriteReviewComment _writeReviewComment;
    private readonly IWriteUrlComment _writeUrlComment;

    public UserController(IEditUserInfo editUserInfo, HttpClient httpClient, IGetUserReports getUserReports,
        ISubmitReport submitReport, IRemoveReport removeReport, IConfiguration configuration,
        IReturnReportById returnReportById, IWriteReviewComment writeReviewComment, IWriteUrlComment writeUrlComment)
    {
        _editUserInfo = editUserInfo;
        _httpClient = httpClient;
        _getUserReports = getUserReports;
        _submitReport = submitReport;
        _removeReport = removeReport;
        _configuration = configuration;
        _returnReportById = returnReportById;
        _writeReviewComment = writeReviewComment;
        _writeUrlComment = writeUrlComment;
    }

    [HttpPut("EditUserInfo")]
    [Authorize]
    public async Task<ActionResult> EditUserInfo([FromBody] EditInfo editInfo)
    {
        string? token = HttpContext.Request.Headers.Authorization;
        token = token.Split(" ")[1];

        token = await CheckToken(token);
        if (token == "unsuccessful") return BadRequest("Could not validate the token.");
        if (editInfo.email != token) return BadRequest("Email doesn't match!");

        if (editInfo.old_password == null) return BadRequest("You must enter your password first!");

        var result = await _editUserInfo.Handle(editInfo);
        if (result is null) return BadRequest("Operation failed!");

        if (result == "password") return BadRequest("Incorrect Password!");

        if (result == "username") return BadRequest("Username already exists!");

        if (result == "format") return BadRequest("New password's length must be over 6 characters!");
        return Ok(result);
    }

    [HttpPost("SubmitReport")]
    [Authorize]
    public async Task<ActionResult> SubmitReport([FromBody] ReportSubmission reportSubmission)
    {
        string? token = HttpContext.Request.Headers.Authorization;
        token = token.Split(" ")[1];

        token = await CheckToken(token);
        if (token == "unsuccessful") return BadRequest("Authentication failed!");

        // Validate scam type
        try
        {
            var scamTypeResponse = await _httpClient.GetAsync(scamTypeUrl);
            if (!scamTypeResponse.IsSuccessStatusCode) return BadRequest("Failed to verify scam type!");

            var validScamTypes = JsonConvert.DeserializeObject<List<Scam_Type>>(
                await scamTypeResponse.Content.ReadAsStringAsync());

            if (!validScamTypes.Any(st => st.scam_type_id == reportSubmission.scam_type_id))
                return BadRequest("Invalid scam type! Please select from available scam types.");
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return BadRequest("Failed to verify scam type!");
        }

        // Validate media
        try
        {
            foreach (var media_id in reportSubmission.media)
            {
                Console.WriteLine(media_id);
                var mediaResponse = await _httpClient.GetAsync($"{mediaUrl}?id={media_id}");

                // If any media ID fails verification, return a bad request
                if (!mediaResponse.IsSuccessStatusCode) return BadRequest("Failed to verify media!");
            }
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return BadRequest("Failed to verify media!");
        }

        var result = await _submitReport.Handle(reportSubmission, token);
        if (result == "report") return BadRequest("Failed to submit report!");

        if (result == "writer") return BadRequest("Failed to authenticate user!");
        return Ok("Report submitted successfully.");
    }


    [HttpGet("GetUserReports")]
    [Authorize]
    public async Task<ActionResult> GetReports()
    {
        string? token = HttpContext.Request.Headers.Authorization;
        token = token.Split(" ")[1];

        token = await CheckToken(token);
        var reports = await _getUserReports.Handle(token);
        if (reports is null) return BadRequest("No Reports could be found!");
        return Ok(reports);
    }

    [HttpGet("reportId")]
    [Authorize]
    public async Task<ActionResult> GetReportById(int report_id)
    {
        string? token = HttpContext.Request.Headers.Authorization;
        token = token.Split(" ")[1];

        token = await CheckToken(token);
        var reportInfo = await _returnReportById.Handle(report_id, token);
        if (reportInfo == null) return BadRequest("Report information could not be found!");

        if (reportInfo.WriterDetails == null) return BadRequest("You do not have access to this report.");
        return Ok(reportInfo);
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
        if (result == "writer") return BadRequest("You are not a registered user!");
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

    [HttpPost("WriteUrlComment")]
    [Authorize]
    public async Task<ActionResult> WriteUrlComment([FromBody] UrlCommentContent urlCommentContent)
    {
        string? token = HttpContext.Request.Headers.Authorization;
        token = token.Split(" ")[1];

        token = await CheckToken(token);
        if (token == "unsuccessful") return BadRequest("Authentication failed!");
        var result = await _writeUrlComment.Handle(urlCommentContent, token);
        if (result == "writer") return BadRequest("You are not a registered user!");
        if (result == "rating")
        {
            return BadRequest("Rating must be between 1 to 5!");
        }
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

    private async Task<string> CheckToken(string token)
    {
        try
        {
            var jsonToken = JsonConvert.SerializeObject(token);
            HttpContent content = new StringContent(jsonToken, Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(checkUrl, content);

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