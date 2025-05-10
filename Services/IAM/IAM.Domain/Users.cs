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
    public int profile_picture_id { get; set; }
    [Required]
    public string password { get; set; }
    [Required]
    public bool is_verified { get; set; }
    
    
    public static Users Create(String username,String name,String email, String password)
    {
        return new Users
        {
            username = username,
            name = name,
            email = email,
            password = password,
            is_verified = false
        };
    }
    public void verify()
    {
        is_verified = true;
    } 
}

