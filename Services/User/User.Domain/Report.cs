using System.ComponentModel.DataAnnotations;
using System.Data.SqlTypes;

namespace User.Domain;

public class Report
{
    [Key]
    public int report_id { get; set; }
    [Required]
    public string title { get; set; }
    public int scam_type_id { get; set; }
    [Required]
    public DateTime scam_date { get; set; }
    public SqlMoney financial_loss { get; set; }
    [Required]
    public string description { get; set; }
    
    public static Report Create(string title, int scam_type_id, DateTime scam_date, SqlMoney financial_loss, string description)
    {
        return new Report
        {
            title = title,
            scam_type_id = scam_type_id,
            scam_date = scam_date,
            financial_loss = financial_loss,
            description = description
        };
    }
    
}
