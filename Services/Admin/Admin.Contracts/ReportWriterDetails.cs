namespace Admin.Contracts;

public record ReportWriterDetails(int? user_id,
    string username,
    string email,
    string name,
    int? profile_picture_id,
    bool is_verified);