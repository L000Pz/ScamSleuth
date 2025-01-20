using System.Text;
using Admin.Application.AdminManagement;
using Admin.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using RabbitMQ.Client;

namespace Admin.Presentation.Controllers;



[ApiController]
[Produces("application/json")]
[Route("userManagement")]
public class UserController: ControllerBase
{
    private readonly IShowAllReports _showAllReports;
    private readonly HttpClient _httpClient;
    private const string checkUrl = "http://localhost:8080/IAM/authentication/Check Token";
    private const string reportUrl = "http://localhost:8080/User/userManagement/reportId";
    private const string reviewUrl = "http://localhost:8080/Public/publicManager/reviewId";

    public UserController(HttpClient httpClient, IShowAllReports showAllReports)
    {
        _httpClient = httpClient;
        _showAllReports = showAllReports;
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
            HttpResponseMessage reportResponse = await _httpClient.GetAsync($"{reportUrl}/{report_id}");
            if (!reportResponse.IsSuccessStatusCode)
            {
                return BadRequest("Failed find report's information!");
            }
        
            var reportInfo = await reportResponse.Content.ReadAsStringAsync();
            return Ok(reportInfo);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return BadRequest("Failed find report's information!");
        }
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