namespace IAM.Infrastructure.JwtTokenGenerator;

public class JwtTokenSettings
{
    public string SecretKey { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public TimeSpan TokenLifetime { get; set; } = TimeSpan.FromDays(15);
}