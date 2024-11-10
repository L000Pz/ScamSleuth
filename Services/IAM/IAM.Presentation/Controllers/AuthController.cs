using IAM.Application.AuthenticationService;
using Microsoft.AspNetCore.Mvc;
namespace IAM.Presentation.Controllers;

[Route("authentication")]
public class AuthController : ControllerBase
{
    private readonly IRegisterService _registerService;
    private readonly ILoginService _loginService;

    public AuthController(IRegisterService registerService, ILoginService loginService)
    {
        _registerService = registerService;
        _loginService = loginService;
    }


    [HttpPost("Register")]
    public async Task<ActionResult> Register(string email, string username, string password, string name)
    {
        var result = await _registerService.Handle(email, username, password, name);
        if (result.token.Equals("email"))
        {
            return BadRequest("Email already exists!");
        }
        if (result.token.Equals("username"))
        {
            return BadRequest("Username already exists!");
        }
        return Ok(result);
    }
    [HttpPost("Login")]
    public async Task<ActionResult> Login(string email, string password)
    {
        var result = await _loginService.Handle(email, password);
        if (result is null)
        {
            return BadRequest("User doesn't exist!");
        }
        if (result.token.Equals("incorrect"))
        {
            return BadRequest("Incorrect password!");
        }
        return Ok(result);
    }
}