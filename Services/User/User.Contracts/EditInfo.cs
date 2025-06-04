namespace User.Contracts;

public record EditInfo(
    string? email,
    string? new_username,
    string? new_name,
    string? old_password,
    string? new_password
    );

