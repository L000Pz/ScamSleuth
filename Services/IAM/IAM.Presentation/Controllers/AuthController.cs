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


    [HttpPost("register")]
    public ActionResult Register(string firstName, string lastName)
    {
        var result = _registerService.Handle(firstName,lastName);
        return Ok(result);
    }
    [HttpPost("login")]
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