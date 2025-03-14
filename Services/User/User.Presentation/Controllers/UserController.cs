using System.Text;
using User.Application.UserManagement;
using User.Contracts;
using User.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using RabbitMQ.Client;

namespace User.Presentation.Controllers;



[ApiController]
[Produces("application/json")]
[Route("userManagement")]
public class UserController: ControllerBase
{
    private readonly IChangePassword _changePassword;
    private readonly IGetUserReports _getUserReports;
    private readonly ISubmitReport _submitReport;
    private readonly IReturnReportById _returnReportById;
    private readonly IRemoveReport _removeReport;
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private const string checkUrl = "http://gateway-api:80/IAM/authentication/Check Token";
    private const string mediaUrl = "http://gateway-api:80/Media/mediaManager/Get";
    private const string scamTypeUrl = "http://gateway-api:80/Public/publicManager/scamTypes";

    public UserController(IChangePassword changePassword,HttpClient httpClient, IGetUserReports getUserReports, ISubmitReport submitReport,IRemoveReport removeReport, IConfiguration configuration, IReturnReportById returnReportById)
    {
        _changePassword = changePassword;
        _httpClient = httpClient;
        _getUserReports = getUserReports;
        _submitReport = submitReport;
        _removeReport = removeReport;
        _configuration = configuration;
        _returnReportById = returnReportById;
    }
    [HttpPut("ChangePassword")]
    [Authorize]
    public async Task<ActionResult> ChangePassword([FromBody] PasswordChange passwordChange)
    {
        string? token = HttpContext.Request.Headers.Authorization;
        token = token.Split(" ")[1];

        token = await CheckToken(token);
        if (token == "unsuccessful")
        {
            return BadRequest("Could not validate the token.");
        }
        if (passwordChange.email != token)
        {
            return BadRequest("Email doesn't match!");
        }

        String? result = await _changePassword.Handle(passwordChange);
        if (result is null)
        {
            return BadRequest("Operation failed!");
        }

        if (result == "format")
        {
            return BadRequest("New password's length must be over 6 characters!");
        }
        return Ok(result);
    }
    
    [HttpPost("SubmitReport")]
    [Authorize]
    public async Task<ActionResult> SubmitReport([FromBody] ReportSubmission reportSubmission)
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
            
            if (!validScamTypes.Any(st => st.scam_type_id == reportSubmission.scam_type_id))
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
            foreach (var media_id in reportSubmission.media)
            {
                Console.WriteLine(media_id);
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

        string result = await _submitReport.Handle(reportSubmission, token);
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
    
    
    [HttpGet("GetUserReports")]
    [Authorize]
    public async Task<ActionResult> GetReports()
    {
        string? token = HttpContext.Request.Headers.Authorization;
        token = token.Split(" ")[1];

        token = await CheckToken(token);
        List<Report>? reports = await _getUserReports.Handle(token);
        if (reports is null)
        {
            return BadRequest("No Reports could be found!");
        }
        return Ok(reports);
    }
  
    [HttpGet("reportId")]
    public async Task<ActionResult> GetReportById(int report_id)
    {
        var reportInfo = await _returnReportById.Handle(report_id);
        if (reportInfo == null)
        {
            return BadRequest("Report information could not be found!");
        }
        return Ok(reportInfo);
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