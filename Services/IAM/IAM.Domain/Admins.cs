﻿using System.ComponentModel.DataAnnotations;

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
    public string contact_info { get; set; }
    [Required]
    public string password { get; set; }
    
    public static Admins Create(String username,String name,String email,String contact_info, String password)
    {
        return new Admins()
        {
            username = username,
            name = name,
            email = email,
            contact_info = contact_info,
            password = password,
        };
    }
    
}

