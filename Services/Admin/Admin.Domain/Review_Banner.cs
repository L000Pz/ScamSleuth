namespace Admin.Domain;

public class Review_Banner
{
    public int review_id { get; set; }
    public int media_id { get; set; }
    public static Review_Banner Create(int review_id,int media_id)
    {
        return new Review_Banner
        {
            review_id = review_id,
            media_id = media_id
        };
    }
}