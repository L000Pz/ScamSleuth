using System.ComponentModel.DataAnnotations;

namespace Admin.Contracts;

public record ReviewCreation(
    string title,
    int scam_type_id,
    DateTime review_date,
    int review_content_id);