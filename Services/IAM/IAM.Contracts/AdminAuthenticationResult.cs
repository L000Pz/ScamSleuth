using IAM.Domain;

namespace IAM.Contracts;

public record AdminAuthenticationResult(
    Admins admin,
    string token);