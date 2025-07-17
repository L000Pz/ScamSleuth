namespace Admin.Contracts;

public record ReviewCommentContent(
    int? root_id,
    int review_id,
    string comment_content);