using System.ComponentModel.DataAnnotations;

namespace User.Domain;

public class ReviewComment
{
    [Key] public int comment_id { get; set; }

    public int? root_id { get; set; }

    [Required] public int review_id { get; set; }

    [Required] public int writer_id { get; set; }

    [Required] public string comment_content { get; set; }

    [Required] public DateTime created_at { get; set; }

    public static ReviewComment Create(int? root_id, int review_id, int writer_id, string comment_content,
        DateTime created_at)
    {
        return new ReviewComment
        {
            root_id = root_id,
            review_id = review_id,
            writer_id = writer_id,
            comment_content = comment_content,
            created_at = created_at
        };
    }
}