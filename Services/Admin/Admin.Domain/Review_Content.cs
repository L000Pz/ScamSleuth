namespace Admin.Domain;

public class Review_Content
{
    public int review_content_id { get; set; }
    public string review_content { get; set; }
    public static Review_Content Create(int review_content_id,string review_content)
    {
        return new Review_Content
        {
            review_content_id = review_content_id,
            review_content = review_content
        };
    }
}