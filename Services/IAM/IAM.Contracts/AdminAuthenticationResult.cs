using IAM.Domain;

namespace IAM.Contracts;

public record AdminAuthenticationResult(
    int? admin_id,
    string username,
    string email,
    string name,
    string contact_info,
    string bio,
    int? profile_picture_id, 
    string token,
    string role);