namespace Admin.Domain;

public class Review_Content_Media
{
    public int review_content_id { get; set; }
    public int media_id { get; set; }
    public static List<Review_Content_Media> Create(int review_content_id,List<int> media)
    {
        var reviewMediaList = new List<Review_Content_Media>();
        foreach (var media_id in media)
        {
            reviewMediaList.Add(new Review_Content_Media
            {
                review_content_id = review_content_id,
                media_id = media_id
            });
        }
        return reviewMediaList;
    }
}