namespace Admin.Domain;

public class Admin_Review
{
    public int admin_id { get; set; }
    public int review_id { get; set; }
    public static Admin_Review Create(int admin_id,int review_id)
    {
        return new Admin_Review
        {
            admin_id = admin_id,
            review_id = review_id
        };
    }
}