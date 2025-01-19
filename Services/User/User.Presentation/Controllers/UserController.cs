using System.Runtime.InteropServices.JavaScript;
using System.Text;
using User.Application.UserManagement;
using User.Contracts;
using User.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace Core.Presentation.Controllers;



[ApiController]
[Produces("application/json")]
[Route("userManagement")]
public class UserController: ControllerBase
{
    private readonly IChangePassword _changePassword;
    private readonly IGetUserReports _getUserReports;
    private readonly ISubmitReport _submitReport;
    private readonly HttpClient _httpClient;
    private const string checkUrl = "http://localhost:8080/IAM/authentication/Check Token";
    private const string mediaUrl = "http://localhost:8080/Media/mediaManager/Get";

    public UserController(IChangePassword changePassword,HttpClient httpClient, IGetUserReports getUserReports, ISubmitReport submitReport)
    {
        _changePassword = changePassword;
        _httpClient = httpClient;
        _getUserReports = getUserReports;
        _submitReport = submitReport;
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
        
        try 
        { 
            HttpResponseMessage mediaResponse = await _httpClient.GetAsync($"{mediaUrl}?id={reportSubmission.media_id}");
            if (!mediaResponse.IsSuccessStatusCode)
            {
                return BadRequest("Could not find the media!");
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