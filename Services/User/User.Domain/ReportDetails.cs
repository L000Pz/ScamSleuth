namespace User.Domain;

public class ReportDetails
{
    public Report Report { get; set; }
    public Users Writer { get; set; }
    public List<Report_Media> Media { get; set; }
}