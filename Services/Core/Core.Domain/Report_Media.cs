using System.ComponentModel.DataAnnotations;

namespace Core.Domain;

public class Report_Media
{
    [Key]
    public int report_id { get; set; }
    [Key]
    public int media_id { get; set; }
    public static Report_Media Create(int report_id,int media_id)
    {
        return new Report_Media
        {
            report_id = report_id,
            media_id = media_id
        };
    }
}