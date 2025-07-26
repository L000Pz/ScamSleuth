using IAM.Application.Common;
using IAM.Contracts;
using IAM.Domain;
using MojoAuth.NET;
using MojoAuth.NET.Core; // MojoAuth SDK

namespace IAM.Application.AuthenticationService;

public class VerificationService : IVerificationService
{
    private readonly IInMemoryRepository _inMemoryRepository;
    private readonly IJwtTokenGenerator _jwtGenerator;
    private readonly IUserRepository _userRepository;
    
    private readonly MojoAuthHttpClient _mojoAuthHttpClient;

    public VerificationService(IInMemoryRepository inMemoryRepository, IJwtTokenGenerator jwtGenerator, IUserRepository userRepository, MojoAuthHttpClient mojoAuthHttpClient)
    {
        _inMemoryRepository = inMemoryRepository;
        _jwtGenerator = jwtGenerator;
        _userRepository = userRepository;

        _mojoAuthHttpClient =mojoAuthHttpClient;
    }

    public async Task<string> Handle(VerificationDetails verificationDetails)
    {
        string? email = _jwtGenerator.GetEmail(verificationDetails.token);
        if (email == null)
        {
            return "invalidToken";
        }

        Users? user = await _userRepository.GetUserByEmail(email);
        if (user == null)
        {
            return "invalidUser"; 
        }

        string? storedStateId = await _inMemoryRepository.Get(user.email + "_stateId");
        if (storedStateId == null)
        {
            return "codeExpired"; 
        }

        var verifyOtpResponse = await VerifyOtpWithMojoAuth(storedStateId, verificationDetails.code);
        
        if (verifyOtpResponse.Result != null)
        {
            user.verify();
            await _userRepository.Update(user);
            return "ok";
        }
        else
        {
            return "invalidCode"; 
        }
    }

    private async Task<Response<VerifyOtpResponse>> VerifyOtpWithMojoAuth(string stateId, string otp)
    {
        try
        {
            var response = await _mojoAuthHttpClient.VerifyOTP(stateId, otp);
            return response; 
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error verifying OTP with MojoAuth: {ex.Message}");
            return null; 
        }
    }
}
