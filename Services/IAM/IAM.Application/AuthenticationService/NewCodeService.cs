using IAM.Application.Common;
using IAM.Contracts;
using IAM.Domain;
using MojoAuth.NET; // MojoAuth SDK

namespace IAM.Application.AuthenticationService;

public class NewCodeService : INewCodeService
{
    private readonly IJwtTokenGenerator _jwtGenerator;
    private readonly IInMemoryRepository _inMemoryRepository;
    private readonly ICodeGenerator _codeGenerator;
    private readonly IUserRepository _userRepository;

    private readonly MojoAuthHttpClient _mojoAuthHttpClient;

    public NewCodeService(IJwtTokenGenerator jwtGenerator,
        IInMemoryRepository inMemoryRepository,
        ICodeGenerator codeGenerator,
        IUserRepository userRepository, MojoAuthHttpClient mojoAuthHttpClient)
    {
        _jwtGenerator = jwtGenerator;
        _inMemoryRepository = inMemoryRepository;
        _codeGenerator = codeGenerator;
        _userRepository = userRepository;

        _mojoAuthHttpClient = mojoAuthHttpClient;
    }

    public async Task<string> Generate(string token)
    {
        string? email = _jwtGenerator.GetEmail(token);
        if (email == null)
        {
            return "invalidToken"; 
        }

        Users? user = await _userRepository.GetUserByEmail(email);
        if (user == null)
        {
            return "invalidUser";
        }

        var sendOtpResponse = await SendOtpToUser(email);

        if (sendOtpResponse.Result == null)
        {
            return "failed";
        }

        string code = _codeGenerator.GenerateCode();
        await _inMemoryRepository.Add(email, code); 

        string stateId = sendOtpResponse.Result.StateId;
        if (stateId != null)
        {
            await _inMemoryRepository.Add(email + "_stateId", stateId);
        }

        return "ok"; 
    }

    private async Task<MojoAuth.NET.Response<MojoAuth.NET.Core.EmailOtpResponse>> SendOtpToUser(string email)
    {
        try
        {
            var resp = await _mojoAuthHttpClient.SendEmailOTP(email);
            return resp; 
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error sending OTP: {ex.Message}");
            return null;
        }
    }
}