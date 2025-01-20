using System.ComponentModel.DataAnnotations;

namespace User.Domain;

public class Report_Media
{
    public int report_id { get; set; }
    public int media_id { get; set; }
    public static List<Report_Media> Create(int report_id, List<int> media)
    {
        var reportMediaList = new List<Report_Media>();
        foreach (var media_id in media)
        {
            reportMediaList.Add(new Report_Media
            {
                report_id = report_id,
                media_id = media_id
            });
        }
        return reportMediaList;
    }
}