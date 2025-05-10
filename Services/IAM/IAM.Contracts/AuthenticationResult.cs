using IAM.Domain;

namespace IAM.Contracts;

public record AuthenticationResult(
    int? user_id,
    string username,
    string email,
    string name,
    int? profile_picture_id,
    bool is_verified,
    string token,
    string role);