using IAM.Domain;

namespace IAM.Contracts;

public record AuthenticationResult(
    Users users,
    string token);