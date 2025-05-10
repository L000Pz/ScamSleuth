using System;
using System.Threading.Tasks;
using IAM.Application.AuthenticationService;
using IAM.Application.Common;
using IAM.Contracts;
using Microsoft.AspNetCore.Mvc;
namespace IAM.Presentation.Controllers;

[Route("authentication")]
public class AuthController : ControllerBase
{
    private readonly IRegisterService _registerService;
    private readonly ILoginService _loginService;
    private readonly IVerificationService _verificationService;
    private readonly INewCodeService _newCodeService;
    private readonly IAdminRegisterService _adminRegisterService;
    private readonly ITokenCheck _tokenCheck;

    public AuthController(IRegisterService registerService, ILoginService loginService, IVerificationService verificationService, INewCodeService newCodeService, IAdminRegisterService adminRegisterService, ITokenCheck tokenCheck)
    {
        _registerService = registerService;
        _loginService = loginService;
        _verificationService = verificationService;
        _newCodeService = newCodeService;
        _adminRegisterService = adminRegisterService;
        _tokenCheck = tokenCheck;
    }
    //public AuthController(){}

    [HttpPost("Register")]
    public async Task<ActionResult> Register([FromBody]RegisterDetails registerDetails)
    {
        var result = await _registerService.Handle(registerDetails);
        if (result.token.Equals("emailFormat"))
        {
            return BadRequest("Invalid email format!");
        }

        if (result.token.Equals("passwordFormat"))
        {
            return BadRequest("Password must be at least 6 characters long.");
        }
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
    
    [HttpPost("Admin-Register")]
    public async Task<ActionResult> AdminRegister([FromBody]AdminRegisterDetails adminRegisterDetails)
    {
        var result = await _adminRegisterService.Handle(adminRegisterDetails);
        if (result.token.Equals("emailFormat"))
        {
            return BadRequest("Invalid email format!");
        }

        if (result.token.Equals("passwordFormat"))
        {
            return BadRequest("Password must be at least 6 characters long.");
        }
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
    public async Task<ActionResult> Login([FromBody]LoginDetails loginDetails)
    {
        var result = await _loginService.Handle(loginDetails);
        if (result is null)
        {
            var adminResult = await _loginService.HandleAdmin(loginDetails);
            if (adminResult is null)
            {
                return BadRequest("User doesn't exist!");
            }

            if (adminResult.token.Equals("incorrect"))
            {
                return BadRequest("Incorrect password!");
            }

            return Ok(adminResult);
        }
        if (result.token.Equals("incorrect"))
        {
            return BadRequest("Incorrect password!");
        }
        return Ok(result);
    }

    [HttpPost("New Code")]
    public async Task<ActionResult> NewCode(string token)
    {
        var result = await _newCodeService.Generate(token);
        if (result.Equals("invalidToken"))
        {
            return BadRequest("Token is invalid!");
        }

        if (result.Equals("invalidUser"))
        {
            return BadRequest("User doesn't exist!");
        }

        return Ok("New code has been generated!");
    }
    [HttpPost("Verify")]
    public async Task<ActionResult> Verify([FromBody]VerificationDetails verificationDetails)
    {
        if (verificationDetails.code is null)
        {
            return BadRequest("Code has not been sent!");
        }
        var result =await _verificationService.Handle(verificationDetails);
        if (result.Equals("invalidToken"))
        {
            return BadRequest("Token is invalid!");
        }
        if (result.Equals("invalidUser"))
        {
            return BadRequest("User doesn't exist!");
        }
        if (result.Equals("codeExpired"))
        {
            return BadRequest("Code expired. Please request for a new code.");
        }
        if (result.Equals("invalidCode"))
        {
            return BadRequest("Invalid code!");
        }
        return Ok("Account verified successfully!");
    }
    
    [HttpPost("Check Token")]
    public async Task<ActionResult> Check([FromBody] String token)
    {
        var email = await _tokenCheck.Handle(token);
        if (email is not null)
        {
            return Ok(email);
        }
        return BadRequest("Invalid token!");
    }
    
}