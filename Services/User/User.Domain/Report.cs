using System.ComponentModel.DataAnnotations;

namespace User.Domain;

public class Report
{
    public int report_id { get; set; }

    [Required] public string title { get; set; }

    [Required] public int writer_id { get; set; }

    [Required] public int scam_type_id { get; set; }

    [Required] public DateTime scam_date { get; set; }

    [Required] public DateTime report_date { get; set; }

    public decimal financial_loss { get; set; }

    [Required] public string description { get; set; }

    public static Report Create(string title, int writer_id, int scam_type_id, DateTime scam_date, DateTime report_date,
        decimal financial_loss, string description)
    {
        return new Report
        {
            title = title,
            writer_id = writer_id,
            scam_type_id = scam_type_id,
            scam_date = scam_date,
            report_date = report_date,
            financial_loss = financial_loss,
            description = description
        };
    }
}