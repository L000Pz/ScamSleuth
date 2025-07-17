using System.ComponentModel.DataAnnotations;

namespace User.Domain;

public class UrlComment
{
    [Key] public int comment_id { get; set; }

    [Required] public int url_id { get; set; }

    [Required] public int writer_id { get; set; }
    [Required] public string writer_role { get; set; }

    public int? root_id { get; set; }

    [Required] public int rating { get; set; }

    [Required] public string comment_content { get; set; }

    [Required] public DateTime created_at { get; set; }

    public static UrlComment Create(int url_id, int writer_id, string writer_role, int? root_id, int rating, string comment_content, DateTime created_at)
    {
        return new UrlComment()
        {
            url_id = url_id,
            writer_id = writer_id,
            writer_role = writer_role,
            root_id = root_id,
            rating = rating,
            comment_content = comment_content,
            created_at = created_at
        };
    }
}