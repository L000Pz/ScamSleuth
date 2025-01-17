using System.Data.SqlTypes;

namespace Core.Contracts;

public record ReportSubmission(
    string title,
    int scam_type_id,
    DateTime scam_date,
    SqlMoney financial_loss,
    string description,
    int media_id);