namespace IAM.Contracts;

public record RegisterDetails(
    string email,
    string username,
    string password,
    string name);