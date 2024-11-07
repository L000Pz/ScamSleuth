using IAM.Application.AuthenticationService;
using Microsoft.AspNetCore.Mvc;
namespace IAM.Presentation.Controllers;

[Route("authentication")]
public class AuthController : ControllerBase
{
    private readonly IRegisterService _registerService;

    public AuthController(IRegisterService registerService)
    {
        _registerService = registerService;
    }


    [HttpPost("register")]
    public ActionResult Register(string firstName, string lastName)
    {
        var result = _registerService.Handle(firstName,lastName);
        return Ok(result);
    }
    [HttpPost("login")]
    public ActionResult Login()
    {
        return Ok();
    }
}