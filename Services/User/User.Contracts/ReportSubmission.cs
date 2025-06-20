﻿namespace User.Contracts;

public record ReportSubmission(
    string title,
    int scam_type_id,
    DateTime scam_date,
    decimal financial_loss,
    string description,
    List<int> media);