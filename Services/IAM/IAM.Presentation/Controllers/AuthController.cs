﻿using IAM.Application.AuthenticationService;
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
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly ICodeGenerator _codeGenerator;
    private readonly IInMemoryRepository _inMemoryRepository;
    private readonly INewCodeService _newCodeService;

    public AuthController(IRegisterService registerService, ILoginService loginService, IVerificationService verificationService, IJwtTokenGenerator jwtTokenGenerator, ICodeGenerator codeGenerator, IInMemoryRepository inMemoryRepository, INewCodeService newCodeService)
    {
        _registerService = registerService;
        _loginService = loginService;
        _verificationService = verificationService;
        _jwtTokenGenerator = jwtTokenGenerator;
        _codeGenerator = codeGenerator;
        _inMemoryRepository = inMemoryRepository;
        _newCodeService = newCodeService;
    }
    public AuthController(){}

    [HttpPost("Register")]
    public async Task<ActionResult> Register([FromBody]RegisterDetails registerDetails)
    {
        var result = await _registerService.Handle(registerDetails);
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