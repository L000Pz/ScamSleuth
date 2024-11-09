using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace IAM.Domain;

public class Users
{
    [Key]
    public int user_id { get; set; }
    [Required]
    public string username { get; set; }
    [Required]
    public string email { get; set; }
    [Required]
    public string name { get; set; }
    public string password { get; set; }

}