namespace User.Contracts;

public record EditInfo(
    string? email,
    string? new_username,
    int? new_profile_picture_id,
    string? new_name,
    string? old_password,
    string? new_password
    );

