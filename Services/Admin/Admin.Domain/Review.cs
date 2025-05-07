using System.ComponentModel.DataAnnotations;

namespace Admin.Domain;

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

    
    public static Review Create(string title, int scam_type_id, DateTime review_date, int review_content_id)
    {
        return new Review
        {
            title = title,
            scam_type_id = scam_type_id,
            review_date = review_date,
            review_content_id = review_content_id
        };
    }
}