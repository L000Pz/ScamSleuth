namespace Core.Infrastructure.JWT;

public class JWTSettings
{
    public string SecretKey { get; set; }
    public string Issuer { get; set; }
    public string Audience { get; set; }
    public int TokenLifetimeInMinutes { get; set; }
}