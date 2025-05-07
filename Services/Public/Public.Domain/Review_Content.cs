using MongoDB.Bson.Serialization.Attributes;

namespace Public.Domain;

public class Review_Content
{
    public int review_content_id { get; set; }
    public string review_content { get; set; }
}