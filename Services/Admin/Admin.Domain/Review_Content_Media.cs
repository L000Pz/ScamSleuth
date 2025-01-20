namespace Admin.Domain;

public class Review_Content_Media
{
    public int review_content_id { get; set; }
    public int media_id { get; set; }
    public static Review_Content_Media Create(int review_content_id,int media_id)
    {
        return new Review_Content_Media
        {
            review_content_id = review_content_id,
            media_id = media_id
        };
    }
}