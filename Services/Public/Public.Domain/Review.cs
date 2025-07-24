using System.ComponentModel.DataAnnotations;

namespace Public.Domain;

public class Review
{
    public int review_id { get; set; }
    [Required]
    public string title { get; set; }
    [Required]
    public int writer_id { get; set; }
    [Required]
    public int scam_type_id { get; set; }
    [Required]
    public DateTime review_date { get; set; }
    [Required]
    public int review_content_id { get; set; }
    public int? views { get; set; }
    
}