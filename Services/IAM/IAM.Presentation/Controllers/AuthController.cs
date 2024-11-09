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
    public ActionResult Login(string email, string password)
    {
        var result = _loginService.Handle(email, password);
        return Ok(result);
    }
}