using System.Text;
using Media.Application.Media;
using Media.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace Media.Presentation.Controllers;

[ApiController]
[Produces("application/json")]
[Route("mediaManager")]
public class MediaController: ControllerBase
{
    
    private readonly ISaveMedia _saveMedia;
    private readonly IGetMedia _getMedia;
    private readonly HttpClient _httpClient;
    private readonly IDeleteMedia _deleteMedia;
    private string checkUrl = "http://gateway-api:80/IAM/authentication/Check Token";

    public MediaController(ISaveMedia saveMedia, IGetMedia getMedia, HttpClient httpClient, IDeleteMedia deleteMedia)
    {
        _saveMedia = saveMedia;
        _getMedia = getMedia;
        _httpClient = httpClient;
        _deleteMedia = deleteMedia;
    }
    
    [HttpPut("Save")]
    [Authorize]
    public async Task<ActionResult> Save(IFormFile file)
    {
        string token = HttpContext.Request.Headers.Authorization;
        token = token.Split(" ")[1];
        
        try
        {
            string jsonToken = JsonConvert.SerializeObject(token);
            // create http content to send
            HttpContent content = new StringContent(jsonToken, Encoding.UTF8, "application/json");
            // send request using post
            HttpResponseMessage response = await _httpClient.PostAsync(checkUrl, content);
            
            if (!response.IsSuccessStatusCode)
            {
                return BadRequest("Could not validate the token.");
            }

            token = await response.Content.ReadAsStringAsync();
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return BadRequest("Could not validate the token.");
        }
        
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded.");
        }
        var mediaFile = new MediaFile
        {
            file_name = file.FileName,
            name = file.Name,
            content_type = file.ContentType,
            Content = file.OpenReadStream()
        };
        
        int ou = await _saveMedia.Handle(mediaFile,token);
        if (ou==-1)
        {
            return BadRequest("Wrong data type!");
        }
        if (ou==-2)
        {
            return BadRequest("An error has happened, please try again later.");
        }
        return Ok(ou);
    }

    [HttpGet("Get")]
    public async Task<ActionResult> GetMedia(int id)
    {
        MediaFile? media = await _getMedia.GetFile(id);
        if (media is null)
        {
            return NotFound("File not found!");
        }
        media.Content.Position = 0;
        return File(media.Content, media.content_type, media.file_name);
    }

    [HttpDelete("DeleteAll")]
    public async Task<ActionResult> DeleteAll(String email)
    {
        String? res = await _deleteMedia.DeleteAll(email);
        return Ok("All files have been deleted successfully!");
    }

    [HttpDelete("Delete")]
    public async Task<ActionResult> Delete(int id)
    {
        String? res = await _deleteMedia.Delete(id);
        if (res is null)
        {
            return BadRequest("File not found!");
        }
        return Ok("File has been deleted successfully!");
    }
}





