namespace Public.Contracts;

public record RecentCommentDetails(string username, string comment_content, string url_path, double rating,
    DateTime created_at);