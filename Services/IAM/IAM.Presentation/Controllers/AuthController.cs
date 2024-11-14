using IAM.Application.AuthenticationService;
using IAM.Application.Common;
using Microsoft.AspNetCore.Mvc;
namespace IAM.Presentation.Controllers;

[Route("authentication")]
public class AuthController : ControllerBase
{
    private readonly IRegisterService _registerService;
    private readonly ILoginService _loginService;
    private readonly IVerificationService _verificationService;

    public AuthController(IRegisterService registerService, ILoginService loginService, IVerificationService verificationService)
    {
        _registerService = registerService;
        _loginService = loginService;
        _verificationService = verificationService;
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

    [HttpPost("Verify")]
    public async Task<ActionResult> Verify(string token, string code)
    {
        if (code is null)
        {
            return BadRequest("Code has not been sent!");
        }
        var result =await _verificationService.Handle(token, code);
        if (result.token.Equals("invalidToken"))
        {
            return BadRequest("Token is invalid!");
        }
        if (result.token.Equals("invalidUser"))
        {
            return BadRequest("User doesn't exist!");
        }
        if (result.token.Equals("codeExpired"))
        {
            return BadRequest("Code expired. Please request for a new code.");
        }
        if (result.token.Equals("invalidCode"))
        {
            return BadRequest("Invalid code!");
        }
        return Ok("Account verified successfully!");
    }
}