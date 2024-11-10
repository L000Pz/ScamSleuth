﻿using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using IAM.Application.Common;
using IAM.Domain;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace IAM.Infrastructure.JwtTokenGenerator;

public class JwtGenerator : IJwtTokenGenerator
{
    private readonly JwtTokenSettings _settings;
    private readonly SecurityKey _securityKey;
    private readonly SigningCredentials _signingCredentials;
    private readonly TokenValidationParameters _validationParameters;

    public JwtGenerator(IOptions<JwtTokenSettings> settings)
    {
        _settings = settings.Value;
        _securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.SecretKey));
        _signingCredentials = new SigningCredentials(_securityKey, SecurityAlgorithms.HmacSha256);
        
        _validationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = _settings.Issuer,
            ValidAudience = _settings.Audience,
            IssuerSigningKey = _securityKey,
            ClockSkew = TimeSpan.Zero
        };
    }

    public string GenerateToken(Users user)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.user_id.ToString()),
            new Claim(JwtRegisteredClaimNames.Name, user.username),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(JwtRegisteredClaimNames.Iat, DateTime.UtcNow.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: DateTime.UtcNow.Add(_settings.TokenLifetime),
            signingCredentials: _signingCredentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string? GetUsername(string token)
    {
        var handler = new JwtSecurityTokenHandler();
        
        try
        {
            // Validate the token first
            var principal = handler.ValidateToken(token, _validationParameters, out var validatedToken);
            
            if (validatedToken is JwtSecurityToken jwtToken)
            {
                return principal.FindFirstValue(JwtRegisteredClaimNames.Name);
            }
            
            return null;
        }
        catch (Exception ex)
        {
            // Log the exception details
            Console.WriteLine($"Token validation failed: {ex.Message}");
            return null;
        }
    }
}