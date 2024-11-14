using IAM.Domain;

namespace IAM.Application.AuthenticationService;

public record AdminAuthenticationResult(
    Admins admin,
    string token);