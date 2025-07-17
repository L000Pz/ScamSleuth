namespace Admin.Contracts;

public record UrlCommentContent(
    int url_id,
    int? root_id,
    string comment_content);