using System.Data.SqlTypes;

namespace User.Contracts;

public record ReportSubmission(
    string title,
    int scam_type_id,
    DateTime scam_date,
    DateTime report_date,
    decimal financial_loss,
    string description,
    List<int> media);