using System.ComponentModel.DataAnnotations;

namespace User.Domain;

public class User_Report
{
    [Key]
    public int user_id { get; set; }
    [Key]
    public int review_id { get; set; }
    public static User_Report Create(int user_id,int review_id)
    {
        return new User_Report
        {
            user_id = user_id,
            review_id = review_id
        };
    }
}