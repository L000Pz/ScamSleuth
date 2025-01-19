namespace User.Contracts;

public record PasswordChange(
    string email,
    string password);