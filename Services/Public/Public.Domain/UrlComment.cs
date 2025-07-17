using System.ComponentModel.DataAnnotations;

namespace Public.Domain;

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
}