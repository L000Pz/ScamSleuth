namespace IAM.Contracts;

public record AdminRegisterDetails(string email,
    string username,
    string password,
    string name,
    string contact_info);