using System.ComponentModel.DataAnnotations;

namespace Public.Domain;

public class ReviewComment
{
    [Key] public int comment_id { get; set; }

    public int? root_id { get; set; }

    [Required] public int review_id { get; set; }

    [Required] public int writer_id { get; set; }

    [Required] public string comment_content { get; set; }

    [Required] public DateTime created_at { get; set; }
}