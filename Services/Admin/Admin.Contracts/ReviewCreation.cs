using System.ComponentModel.DataAnnotations;

namespace Admin.Contracts;

public record ReviewCreation(
    string content,
    string title,
    int scam_type_id,
    DateTime review_date,
    List<int> media);