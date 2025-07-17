namespace Admin.Contracts;

public record UrlCommentContent(
    string url,
    int? root_id,
    string comment_content);