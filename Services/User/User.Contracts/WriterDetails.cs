namespace User.Contracts;

public record WriterDetails(int? user_id,
    string username,
    string email,
    string name,
    int? profile_picture_id,
    bool is_verified);