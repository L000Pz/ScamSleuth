namespace Media.Domain;

public class Media
{
    public int row_id { get; set; }
    public String email { get; set; }
    public String name { get; set; }
    public String file_name { get; set; }
    public String content_type { get; set; }
    public Stream Content { get; set; }

    public static Media Create(int row_id, string email, String name, string file_name, string content_type, Stream Content)
    {
        return new Media
        {
            row_id = row_id,
            email = email,
            name = name,
            file_name = file_name,
            content_type = content_type,
            Content = Content
        };
    }
    
}