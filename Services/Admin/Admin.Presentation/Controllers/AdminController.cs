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
    private const string mediaUrl = "http://localhost:8080/Media/mediaManager/Get";
    private const string scamTypeUrl = "http://localhost:8080/Public/publicManager/scamTypes";

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