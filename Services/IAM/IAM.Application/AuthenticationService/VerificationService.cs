﻿using IAM.Application.Common;
using IAM.Contracts;
using IAM.Domain;
using Microsoft.AspNetCore.Http.HttpResults;

namespace IAM.Application.AuthenticationService;

public class VerificationService : IVerificationService
{
    private readonly IInMemoryRepository _inMemoryRepository;
    private readonly IJwtTokenGenerator _jwtGenerator;
    private readonly IUserRepository _userRepository;

    public VerificationService(IInMemoryRepository inMemoryRepository, IJwtTokenGenerator jwtGenerator, IUserRepository userRepository)
    {
        _inMemoryRepository = inMemoryRepository;
        _jwtGenerator = jwtGenerator;
        _userRepository = userRepository;
    }

    public async Task<AuthenticationResult> Handle(VerificationDetails verificationDetails)
    {
        String? username = _jwtGenerator.GetUsername(verificationDetails.token);
        if (username is null)
        {
            return new AuthenticationResult(null,"invalidToken");
        }
        Users? user = await _userRepository.GetUserByUsername(username);
        if (user is null)
        {
            return new AuthenticationResult(null, "invalidUser");
        }
        String? result = await _inMemoryRepository.Get(user.username.ToString());
        if (result is null)
        {
            return new AuthenticationResult(null,"codeExpired");
        }
        if (!result.Equals(verificationDetails.code))
        {
            return new AuthenticationResult(null, "invalidCode");
        }
        // veify user
        user.verify();
        await _userRepository.Update(user);
        return new AuthenticationResult(null,"ok");
    }
}