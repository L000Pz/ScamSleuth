using System.ComponentModel.DataAnnotations;

namespace Public.Domain;

public class Review
{
    [Key] 
    public int review_id { get; set; }
    public string title { get; set; }
    public int scam_type_id { get; set; }
    public DateTime review_date { get; set; }
    public int review_content_id { get; set; }
}