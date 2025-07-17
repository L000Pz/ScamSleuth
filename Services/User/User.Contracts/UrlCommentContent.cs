namespace User.Contracts;

public record UrlCommentContent(
    string url,
    int? root_id,
    int rating,
    string comment_content);