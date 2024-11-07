using IAM.Domain;

namespace IAM.Application.AuthenticationService;

public record AuthenticationResult(
    User User,
    string token);