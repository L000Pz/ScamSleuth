using System.ComponentModel.DataAnnotations;

namespace Public.Domain;

public class UrlStorage
{
    [Key] public int url_id { get; set; }
    
    [Required] public string url { get; set; }

    [Required] public string description { get; set; }

    [Required] public DateTime search_date { get; set; }
}