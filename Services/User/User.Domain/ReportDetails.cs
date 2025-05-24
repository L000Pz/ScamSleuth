using User.Contracts;

namespace User.Domain;

public class ReportDetails
{
    public Report Report { get; set; }
    public List<int> Media { get; set; }
    public WriterDetails WriterDetails { get; set; }
}