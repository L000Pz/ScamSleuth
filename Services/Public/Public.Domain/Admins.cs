using System.ComponentModel.DataAnnotations;

namespace Public.Domain;

public class Admins
{
    public int admin_id { get; set; }
    [Required]
    public string username { get; set; }
    [Required]
    public string email { get; set; }
    [Required]
    public string name { get; set; }
    [Required]
    public string contact_info { get; set; }
    public string? bio { get; set; }
    public int? profile_picture_id { get; set; }
    [Required]
    public string password { get; set; }
}