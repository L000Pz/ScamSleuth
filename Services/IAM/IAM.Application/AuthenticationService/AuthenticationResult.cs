using IAM.Domain;

namespace IAM.Application.AuthenticationService;

public record AuthenticationResult(
    Users users,
    string token);