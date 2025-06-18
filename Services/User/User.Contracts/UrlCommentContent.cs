namespace User.Contracts;

public record UrlCommentContent(
    int url_id,
    int? root_id,
    int rating,
    string comment_content);