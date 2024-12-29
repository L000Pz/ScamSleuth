﻿using System.Text;
using Media.Application.Media;
using Media.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace Media.Presentation.Controllers;

[ApiController]
[Produces("application/json")]
[Route("Media")]
public class MediaController: ControllerBase
{
    
    private readonly ISaveMedia _saveMedia;
    private readonly IGetMedia _getMedia;
    private readonly HttpClient _httpClient;
    private readonly IDeleteMedia _deleteMedia;
    private string checkUrl = "http://host.docker.internal:5000/authentication/Check Token";

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
                return BadRequest("Invalid token!");
            }

            token = await response.Content.ReadAsStringAsync();
            token = token.Remove(0, 1).Remove(token.Length - 2);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return BadRequest("Invalid token!");
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
        
        String ou = await _saveMedia.Handle(mediaFile,token);
        if (ou.Equals("failed"))
        {
            return BadRequest("Invalid token!");
        }
        if (ou.Equals("wrong"))
        {
            return BadRequest("Wrong data type!");
        }
        if (ou.Equals("bad"))
        {
            return BadRequest("An error has happened, please try again later.");
        }
        return Ok();
    }

    [HttpGet("GetMedia")]
    //[Authorize]
    public async Task<ActionResult> GetMedia(String Filename)
    {
       /* string token = HttpContext.Request.Headers.Authorization;
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
                return BadRequest("invalid token provided");
            }

            token = await response.Content.ReadAsStringAsync();
            token = token.Remove(0, 1).Remove(token.Length - 2);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return BadRequest("wrong token");
        }*/
        
        MediaFile? media = await _getMedia.GetFile("token", Filename);
        if (media is null)
        {
            return NotFound("correct token or file not found");
        }
        media.Content.Position = 0;
        return File(media.Content, media.content_type, media.file_name);
    }

    [HttpDelete("DeleteAll")]
    public async Task<ActionResult> DeleteAll(String username)
    {
        String? res = await _deleteMedia.Delete(username);
        return Ok();
    }
}





