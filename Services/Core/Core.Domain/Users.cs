﻿using System.ComponentModel.DataAnnotations;

namespace Core.Domain;

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
}