using System.ComponentModel.DataAnnotations;

namespace User.Domain;

public class User_Report
{
    public int user_id { get; set; }
    public int report_id { get; set; }
    public static User_Report Create(int user_id,int report_id)
    {
        return new User_Report
        {
            user_id = user_id,
            report_id = report_id
        };
    }
}