namespace User.Domain;

public class ReportDetails
{
    public Report Report { get; set; }
    public User_Report User_Report { get; set; }
    public List<Report_Media> Media { get; set; }
}