using System.Text;
using Core.Application.UserManagement;
using Core.Contracts;
using Core.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace Core.Presentation.Controllers;



[ApiController]
[Produces("application/json")]
[Route("core")]
public class CoreController: ControllerBase
{
    private readonly IChangePassword _changePassword;
    private readonly IGetUserReports _getUserReports;
    private readonly ISubmitReport _submitReport;
    private readonly HttpClient _httpClient;
    private string checkUrl = "http://localhost:8080/IAM/authentication/Check Token";
    private string postUrl = "htto://localhost:8080/Media/Media/Save";
    public CoreController(IChangePassword changePassword,HttpClient httpClient, IGetUserReports getUserReports, ISubmitReport submitReport)
    {
        _changePassword = changePassword;
        _httpClient = httpClient;
        _getUserReports = getUserReports;
        _submitReport = submitReport;
    }
    [HttpPut("Change Password")]
    [Authorize]
    public async Task<ActionResult> ChangePassword([FromBody]string email,string password)
    {
        string? token = HttpContext.Request.Headers.Authorization;
        token = token.Split(" ")[1];
        
        token = await CheckToken(token);
        if (email != token)
        {
            return BadRequest("Email doesn't match!");
        }
        String? result = await _changePassword.Handle(token,password);
        if (result is null)
        {
            return BadRequest("Operation failed!");
        }
        return Ok(result);
    }
    
    [HttpPost("Submit Report")]
    [Authorize]
    public async Task<ActionResult> SubmitReport([FromBody] ReportSubmission reportSubmission)
    {
        string? token = HttpContext.Request.Headers.Authorization;
        token = token.Split(" ")[1];

        token = await CheckToken(token);
        if (token == "Could not validate the token.")
        {
            return BadRequest("Authentication failed!");
        }
        
        string result = await _submitReport.Handle(reportSubmission,token);
        if (result == "report")
        {
            return BadRequest("Failed to submit report!");
        }

        if (result == "writer")
        {
            return BadRequest("User doesn't exist!");
        }
        return Ok("Report submitted successfully.");
    }
    
    
    [HttpGet("Get User's Reports")]
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
                return "Could not validate the token.";
            }

            token = await response.Content.ReadAsStringAsync();
            return token;
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return "Could not validate the token.";
        }
    }
}