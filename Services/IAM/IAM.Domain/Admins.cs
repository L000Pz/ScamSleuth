using System.ComponentModel.DataAnnotations;

namespace IAM.Domain;

public class Admins
{
    [Key]
    public int admin_id { get; set; }
    [Required]
    public string username { get; set; }
    [Required]
    public string email { get; set; }
    [Required]
    public string name { get; set; }
    [Required]
    public string password { get; set; }
}