using Admin.Contracts;

namespace Admin.Domain;

public class ReportDetails
{
    public Report Report { get; set; }
    public List<int> Media { get; set; }
    public ReportWriterDetails ReportWriterDetails { get; set; }
}