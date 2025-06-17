namespace User.Contracts;

public record CommentContent(
    int? root_id,
    int review_id,
    string comment_content);